# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Petit groupe de proches (famille élargie, amis) : chacun a son compte sur une
instance auto-hébergée. Audience limitée et connue — ce n'est pas un service
public. Situation d'usage : décider des repas et des courses, à la maison,
seul ou en foyer.

## Product Purpose

Trouver quoi cuisiner à partir des ingrédients disponibles, puis organiser la
suite : sélection de recettes par ingrédients du frigo, portions ajustables,
liste de courses agrégée avec quantités calculées automatiquement. Le succès :
les repas et les courses se décident en quelques minutes, sans pub ni friction.

## Positioning

Par rapport aux sites de recettes classiques (Marmiton…) :

- **Catalogue personnel + partagé** : ses propres recettes (créées ou
  importées), publiables vers le catalogue commun de l'instance.
- **Liste de courses agrégée** : quantités calculées selon le nombre de
  personnes, regroupées par ingrédient.
- **Simplicité / rapidité** : pas de compte externe, pas de pub, la recette est
  directement lisible — rien de superflu.

## Operating Context

Instance auto-hébergée unique : service systemd derrière un reverse proxy
HTTPS (Caddy/nginx), sauvegardes quotidiennes des bases SQLite. Comptes créés
au premier accès. Interface en français. Scripts d'exploitation : import de
recettes Marmiton, backfill d'images et de portions, backup, migration v1→v2.

## Capabilities and Constraints

Fonctionnalités confirmées (état actuel du code) :

- Comptes utilisateurs (hash scrypt, cookie de session signé HMAC).
- Catalogue partagé : ~230 ingrédients seedés avec unités par défaut,
  recettes publiques ; gestion des ingrédients par les utilisateurs.
- Recettes personnelles : création/édition (étapes avec actions et ustensiles
  du catalogue fixe), images (URL externe ou upload 4 Mo), portions
  (`servings`), publication vers le catalogue.
- Import Marmiton vers le catalogue + backfill images/portions.
- Sélection de recettes par ingrédients disponibles ; liste de courses
  calculée côté client.

Stack actuel (fait d'implémentation) : Node ≥ 22.5 + Express, `node:sqlite`
sans aucune dépendance native (better-sqlite3 ne compile pas sur la machine
de développement — contrainte technique de cette machine), frontend
HTML/CSS/JS vanilla sans build dans `public/`, tests Vitest.

Décision d'interview explicite : **aucune contrainte durable confirmée** —
la langue française de l'UI, le frontend vanilla, l'absence de build et
l'auto-hébergement sont des faits actuels, pas des engagements à préserver ;
ils restent révisables. (Seule la non-compilation de better-sqlite3 sur la
machine de dev reste un fait technique, pas une préférence produit.)

## Brand Commitments

Nom : **Chez Mamie**, avec un logo médaillon mamie cartoon (`public/logo.png`).
Interface et contenu en français. Aucun autre engagement de marque confirmé.

## Evidence on Hand

- Données réelles : ingrédients seedés (`src/seed.js`), recettes importées
  Marmiton dans le catalogue, images (`public/images/recipes/`).
- Documentation d'exploitation : `README.md`, `deploy/` (systemd, Caddy,
  nginx).
- Aucun témoignage, chiffre d'usage ou contenu marketing — ne pas en
  fabriquer.

## Product Principles

1. **Simplicité d'abord** : chaque écran se comprend sans apprentissage ;
   rien qui ne serve pas directement le repas ou les courses.
2. **Le catalogue est commun, les données sont personnelles** : partager les
   recettes sans dupliquer les données ni mélanger les comptes.
3. **Du frigo à la liste de courses sans friction** : quantités calculées
   automatiquement, saisie minimale.
4. **Audience connue** : l'outil sert un petit groupe de proches — pas de
   fonctionnalités pour un public anonyme (croissance, modération, SEO).
