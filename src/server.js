import express from 'express';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { DatabaseManager } from './db.js';
import { listIngredients, addIngredient, deleteIngredient } from './ingredients.js';
import {
  listRecipes, getRecipe, addRecipe, updateRecipe, deleteRecipe,
  saveRecipe, unsaveRecipe, listSavedRecipeIds,
} from './recipes.js';
import { CATEGORIES, seedIfEmpty } from './seed.js';
import { STEP_ACTIONS, UTENSILS } from './steps.js';
import { register, login, readSession, sessionCookieHeader, clearSessionCookieHeader } from './auth.js';
import { saveImage } from './images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(manager, secret = process.env.SESSION_SECRET || 'dev-secret-change-me') {
  const app = express();
  app.use(express.json({ limit: '6mb' })); // marge pour les images en base64
  app.use(express.static(path.join(__dirname, '..', 'public')));
  if (!manager.memory) {
    app.use('/images/user', express.static(path.join(manager.dataDir, 'images')));
  }

  const handleError = (res, err) => res.status(400).json({ error: err.message });

  // Session lue sur chaque requête
  app.use((req, res, next) => {
    req.username = readSession(req, secret);
    next();
  });

  // --- Auth (routes publiques) ---

  app.post('/api/auth/register', (req, res) => {
    try {
      const user = register(manager.users, req.body.username, req.body.password);
      res.setHeader('Set-Cookie', sessionCookieHeader(user.username, secret));
      res.status(201).json(user);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const user = login(manager.users, req.body.username, req.body.password);
    if (!user) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
    res.setHeader('Set-Cookie', sessionCookieHeader(user.username, secret));
    res.json(user);
  });

  app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', clearSessionCookieHeader());
    res.status(204).end();
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.username) {
      return res.status(401).json({ error: 'Non connecté' });
    }
    res.json({ username: req.username });
  });

  // --- Tout le reste de l'API exige une session ---

  app.use('/api', (req, res, next) => {
    if (!req.username) {
      return res.status(401).json({ error: 'Non connecté' });
    }
    next();
  });

  // --- Ingrédients (catalogue partagé) ---

  app.get('/api/ingredients', (req, res) => {
    res.json(listIngredients(manager.catalog));
  });

  app.post('/api/ingredients', (req, res) => {
    try {
      res.status(201).json(addIngredient(manager.catalog, req.body.name, req.body.category, req.body.defaultUnit));
    } catch (err) {
      handleError(res, err);
    }
  });

  app.delete('/api/ingredients/:id', (req, res) => {
    if (deleteIngredient(manager.catalog, Number(req.params.id))) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Ingrédient introuvable' });
    }
  });

  app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
  });

  app.get('/api/step-catalog', (req, res) => {
    res.json({ actions: STEP_ACTIONS, utensils: UTENSILS });
  });

  // --- Upload d'image de recette ---

  app.post('/api/my/images', (req, res) => {
    try {
      const imagesDir = manager.memory
        ? path.join(os.tmpdir(), 'recipe-picker-test-images')
        : path.join(manager.dataDir, 'images');
      res.status(201).json({ url: saveImage(imagesDir, req.username, req.body.dataUrl) });
    } catch (err) {
      handleError(res, err);
    }
  });

  // --- Recettes du catalogue (publiques) ---

  app.get('/api/catalog/recipes', (req, res) => {
    res.json(listRecipes(manager.catalog));
  });

  app.post('/api/catalog/recipes', (req, res) => {
    try {
      res.status(201).json(addRecipe(manager.catalog, req.body));
    } catch (err) {
      handleError(res, err);
    }
  });

  app.delete('/api/catalog/recipes/:id', (req, res) => {
    if (deleteRecipe(manager.catalog, Number(req.params.id))) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Recette introuvable' });
    }
  });

  // --- Recettes personnelles ---

  app.get('/api/my/recipes', (req, res) => {
    const userDb = manager.getUserDb(req.username);
    const created = listRecipes(userDb, manager.catalog);
    const savedIds = listSavedRecipeIds(userDb);
    const saved = savedIds
      .map((id) => getRecipe(manager.catalog, id))
      .filter(Boolean)
      .map((recipe) => ({ ...recipe, fromCatalog: true }));
    res.json({ created, saved, savedIds });
  });

  app.post('/api/my/recipes', (req, res) => {
    const userDb = manager.getUserDb(req.username);
    try {
      const recipe = addRecipe(userDb, req.body, manager.catalog);
      let published = false;
      if (req.body.publish) {
        try {
          addRecipe(manager.catalog, req.body);
          published = true;
        } catch {
          // Doublon de nom dans le catalogue : la recette perso est conservée.
        }
      }
      res.status(201).json({ ...recipe, published });
    } catch (err) {
      handleError(res, err);
    }
  });

  app.put('/api/my/recipes/:id', (req, res) => {
    const userDb = manager.getUserDb(req.username);
    try {
      res.json(updateRecipe(userDb, Number(req.params.id), req.body, manager.catalog));
    } catch (err) {
      if (err.message === 'Recette introuvable') {
        return res.status(404).json({ error: err.message });
      }
      handleError(res, err);
    }
  });

  app.delete('/api/my/recipes/:id', (req, res) => {
    const userDb = manager.getUserDb(req.username);
    if (deleteRecipe(userDb, Number(req.params.id))) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Recette introuvable' });
    }
  });

  app.post('/api/my/recipes/save/:catalogId', (req, res) => {
    const catalogId = Number(req.params.catalogId);
    if (!getRecipe(manager.catalog, catalogId)) {
      return res.status(404).json({ error: 'Recette du catalogue introuvable' });
    }
    const userDb = manager.getUserDb(req.username);
    saveRecipe(userDb, catalogId);
    res.status(204).end();
  });

  app.delete('/api/my/recipes/save/:catalogId', (req, res) => {
    const userDb = manager.getUserDb(req.username);
    unsaveRecipe(userDb, Number(req.params.catalogId));
    res.status(204).end();
  });

  return app;
}

// Démarrage direct : node src/server.js
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manager = new DatabaseManager();
  const seeded = seedIfEmpty(manager.catalog);
  if (seeded > 0) {
    console.log(`Catalogue pré-rempli avec ${seeded} ingrédients par défaut`);
  }
  if (!process.env.SESSION_SECRET) {
    console.warn('⚠️  SESSION_SECRET non défini : secret de développement utilisé. Définis-le en production !');
  }
  const app = createApp(manager);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Chez Mamie démarré sur http://localhost:${port}`);
  });
}
