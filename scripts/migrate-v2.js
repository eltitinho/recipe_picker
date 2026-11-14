// Migration v1 → v2 : déplace l'ancien data/recipes.db (mono-base)
// vers le nouveau layout data/app.db (catalogue) + data/users.db.
// L'ancien fichier est renommé en recipes.db.bak, jamais supprimé.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { createCatalogDb } from '../src/db.js';
import { applyDefaultUnits } from '../src/seed.js';

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const legacyPath = path.join(dataDir, 'recipes.db');

if (!fs.existsSync(legacyPath)) {
  console.log('Aucun ancien data/recipes.db trouvé : rien à migrer.');
  process.exit(0);
}

// Migrations de schéma héritées de la v1 (idempotentes)
const legacy = new DatabaseSync(legacyPath);
const ingCols = legacy.prepare('PRAGMA table_info(ingredients)').all().map((c) => c.name);
if (!ingCols.includes('category')) {
  legacy.exec("ALTER TABLE ingredients ADD COLUMN category TEXT NOT NULL DEFAULT 'Autre'");
}
const riCols = legacy.prepare('PRAGMA table_info(recipe_ingredients)').all().map((c) => c.name);
if (!riCols.includes('quantity')) legacy.exec('ALTER TABLE recipe_ingredients ADD COLUMN quantity REAL');
if (!riCols.includes('unit')) legacy.exec("ALTER TABLE recipe_ingredients ADD COLUMN unit TEXT NOT NULL DEFAULT 'g'");

const catalog = createCatalogDb(path.join(dataDir, 'app.db'));

// Ingrédients : correspondance par nom (les ids peuvent différer)
const idByName = new Map();
let ingredientsCopied = 0;
for (const ing of legacy.prepare('SELECT name, category FROM ingredients').all()) {
  const existing = catalog.prepare('SELECT id FROM ingredients WHERE name = ?').get(ing.name);
  if (existing) {
    idByName.set(ing.name, existing.id);
  } else {
    const result = catalog.prepare('INSERT INTO ingredients (name, category) VALUES (?, ?)').run(ing.name, ing.category ?? 'Autre');
    idByName.set(ing.name, result.lastInsertRowid);
    ingredientsCopied++;
  }
}
applyDefaultUnits(catalog);

// Recettes (+ ingrédients + étapes) → catalogue
const legacyIngName = legacy.prepare('SELECT name FROM ingredients WHERE id = ?');
const mapIngredientId = (oldId) => idByName.get(legacyIngName.get(oldId)?.name);

let recipesCopied = 0;
let recipesSkipped = 0;
const legacyRecipes = legacy.prepare('SELECT id, name FROM recipes').all();
for (const old of legacyRecipes) {
  if (catalog.prepare('SELECT id FROM recipes WHERE name = ?').get(old.name)) {
    recipesSkipped++;
    continue;
  }
  catalog.exec('BEGIN');
  try {
    const newId = catalog.prepare('INSERT INTO recipes (name) VALUES (?)').run(old.name).lastInsertRowid;

    const link = catalog.prepare('INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
    for (const ri of legacy.prepare('SELECT ingredient_id, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?').all(old.id)) {
      const newIngId = mapIngredientId(ri.ingredient_id);
      if (newIngId) link.run(newId, newIngId, ri.quantity, ri.unit ?? 'g');
    }

    const stepStmt = catalog.prepare('INSERT INTO recipe_steps (recipe_id, position, action, utensil, description) VALUES (?, ?, ?, ?, ?)');
    const stepIngStmt = catalog.prepare('INSERT OR IGNORE INTO step_ingredients (step_id, ingredient_id) VALUES (?, ?)');
    const hasSteps = legacy.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_steps'").get();
    if (hasSteps) {
      for (const step of legacy.prepare('SELECT id, position, action, utensil, description FROM recipe_steps WHERE recipe_id = ? ORDER BY position').all(old.id)) {
        const newStepId = stepStmt.run(newId, step.position, step.action, step.utensil, step.description ?? '').lastInsertRowid;
        for (const si of legacy.prepare('SELECT ingredient_id FROM step_ingredients WHERE step_id = ?').all(step.id)) {
          const newIngId = mapIngredientId(si.ingredient_id);
          if (newIngId) stepIngStmt.run(newStepId, newIngId);
        }
      }
    }

    catalog.exec('COMMIT');
    recipesCopied++;
  } catch (err) {
    catalog.exec('ROLLBACK');
    throw err;
  }
}

legacy.close();

const backupPath = `${legacyPath}.bak`;
fs.renameSync(legacyPath, backupPath);

console.log(`Migration terminée :`);
console.log(`  - ${ingredientsCopied} ingrédients copiés dans app.db`);
console.log(`  - ${recipesCopied} recettes copiées dans le catalogue (${recipesSkipped} ignorées, déjà présentes)`);
console.log(`  - ancien fichier conservé : ${backupPath}`);
console.log(`\nNote : data/users.db sera créé automatiquement ; chaque utilisateur devra créer son compte.`);
