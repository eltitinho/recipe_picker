// Corrige les unités : applique les nouvelles unités par défaut du seed
// et migre les recipe_ingredients existants (g → unité par défaut de l'ingrédient)
// dans app.db et toutes les bases utilisateur.
// Usage : RECIPE_DATA_DIR=data node scripts/fix-units.js
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { createCatalogDb } from '../src/db.js';
import { applyDefaultUnits } from '../src/seed.js';

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const catalog = createCatalogDb(path.join(dataDir, 'app.db'));

applyDefaultUnits(catalog);

const nonGram = catalog.prepare("SELECT id, name, default_unit AS unit FROM ingredients WHERE default_unit != 'g'").all();
if (nonGram.length === 0) {
  console.log('Aucune unité spéciale à migrer.');
  process.exit(0);
}

const dbPaths = [path.join(dataDir, 'app.db')];
const usersDir = path.join(dataDir, 'users');
if (fs.existsSync(usersDir)) {
  for (const file of fs.readdirSync(usersDir).filter((f) => f.endsWith('.db'))) {
    dbPaths.push(path.join(usersDir, file));
  }
}

let total = 0;
for (const dbPath of dbPaths) {
  const db = dbPath.endsWith('app.db') ? catalog : new DatabaseSync(dbPath);
  for (const ing of nonGram) {
    total += db.prepare("UPDATE recipe_ingredients SET unit = ? WHERE ingredient_id = ? AND unit = 'g'").run(ing.unit, ing.id).changes;
  }
  if (!dbPath.endsWith('app.db')) db.close();
}

console.log(`Unités migrées : ${total} ligne(s) recipe_ingredients mises à jour dans ${dbPaths.length} base(s).`);
console.log(`Ingrédients concernés : ${nonGram.map((i) => `${i.name} (${i.unit})`).join(', ')}`);
