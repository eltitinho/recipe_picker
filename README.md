# 👵 Chez Mamie

Application web multi-utilisateurs pour choisir une recette en fonction des
ingrédients disponibles.

## Stack

- **Backend** : Node.js (≥ 22.5) + Express + SQLite via `node:sqlite` (aucune dépendance native)
- **Frontend** : HTML/CSS/JS vanilla, sans build
- **Tests** : Vitest
- **Auth** : comptes en base (scrypt) + cookie de session signé HMAC

## Architecture des données

Trois types de bases SQLite (compactes, dans `data/`) :

```
data/
├── app.db        # catalogue partagé : ingrédients + recettes publiques
├── users.db      # comptes utilisateurs
└── users/
    ├── kristian.db   # recettes créées + recettes choisies (références)
    └── marie.db
```

- Le catalogue est stocké **une seule fois** ; chaque utilisateur ne stocke que
  ses propres données (les recettes « choisies » sont de simples références par id).
- Les bases utilisateur sont créées automatiquement au premier accès.

## Développement local

```bash
npm install
npm start          # → http://localhost:3000 (crée un compte au 1er accès)
npm test           # tests unitaires
npm run db:backup  # sauvegarde toutes les bases dans data/backups/
```

Variables d'environnement :

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3000` | Port d'écoute |
| `RECIPE_DATA_DIR` | `data` | Dossier des bases SQLite |
| `SESSION_SECRET` | *(secret de dev)* | Secret de signature des cookies — **à définir en production** |

## Migration depuis la v1 (base unique)

Si tu as un ancien `data/recipes.db` :

```bash
node scripts/migrate-v2.js
```

Il copie ingrédients + recettes dans le catalogue `app.db` (et corrige les
unités des liquides), puis renomme l'ancien fichier en `recipes.db.bak`
(jamais supprimé). Les utilisateurs devront créer leur compte.

## Déploiement sur un serveur

### 1. Prérequis

- Node.js ≥ 22.5 (idéalement 24) : `node --version`
- Un sous-domaine pointant vers le serveur (ex. `recettes.example.com`)

### 2. Installer l'application

```bash
sudo useradd --system --create-home recipes   # utilisateur dédié
sudo mkdir -p /opt/recipe_picker
# Copier le projet (git clone ou rsync depuis ta machine) :
sudo rsync -a --exclude node_modules --exclude data ./ /opt/recipe_picker/
cd /opt/recipe_picker
sudo npm install --omit=dev
sudo chown -R recipes:recipes /opt/recipe_picker
```

Si un ancien `data/recipes.db` existe sur le serveur, lance d'abord
`node scripts/migrate-v2.js` avec `RECIPE_DATA_DIR=/opt/recipe_picker/data`.

### 3. Lancer l'app en service systemd

```bash
openssl rand -hex 32   # génère un SESSION_SECRET, mets-le dans le .service
sudo cp deploy/recipe-picker.service /etc/systemd/system/
# Édite le fichier : SESSION_SECRET, chemins, utilisateur
sudo systemctl daemon-reload
sudo systemctl enable --now recipe-picker
journalctl -u recipe-picker -f             # logs en direct
```

L'app écoute sur `127.0.0.1:3000` (non exposée directement).

### 4. Reverse proxy + HTTPS

L'app gère elle-même les comptes et sessions ; le proxy sert juste à exposer
en HTTPS. Exemples de config dans `deploy/` :

**Caddy (recommandé, HTTPS automatique) :**

```bash
sudo apt install caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
# Édite : ton domaine (la ligne basic_auth peut être retirée, l'app a ses comptes)
sudo systemctl reload caddy
```

**nginx :** voir `deploy/nginx.conf` (+ `sudo certbot --nginx -d recettes.example.com`).

### 5. Sauvegardes automatiques

```bash
sudo crontab -e
# Backup quotidien à 3h :
0 3 * * * cd /opt/recipe_picker && RECIPE_DATA_DIR=/opt/recipe_picker/data /usr/bin/node scripts/backup.js
```

Les backups sont dans `data/backups/<horodatage>/`. Restaurer = arrêter le
service, remplacer les `.db`, relancer.

### 6. Mettre à jour l'application

```bash
sudo rsync -a --exclude node_modules --exclude data ./ /opt/recipe_picker/
cd /opt/recipe_picker && sudo npm install --omit=dev
sudo systemctl restart recipe-picker
```

⚠️ Le dossier `data/` (bases + backups) n'est **jamais** touché par les mises à jour.

## Structure du projet

```
src/
  server.js       # API Express (auth + routes scopées par utilisateur)
  db.js           # 3 schémas + DatabaseManager (multi-bases)
  auth.js         # comptes (scrypt) + sessions (cookie signé HMAC)
  ingredients.js  # logique ingrédients (catalogue partagé)
  recipes.js      # recettes (catalogue ou personnelles) + saved_recipes
  steps.js        # catalogue actions/ustensiles
  seed.js         # ingrédients par défaut (avec unités)
public/           # frontend (index.html, app.js)
tests/            # tests Vitest
scripts/
  backup.js       # sauvegarde de toutes les bases
  migrate-v2.js   # migration base unique → multi-bases
deploy/           # systemd, Caddy, nginx
```
