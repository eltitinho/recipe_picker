import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

function open(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

// Schéma des recettes. La FK vers ingredients n'est possible que si les deux
// tables vivent dans la même base (catalogue) ; les bases utilisateur
// référencent les ids du catalogue sans FK (contraintes inter-bases impossibles).
function recipesDdl(withIngredientFk) {
  const ingredientRef = withIngredientFk ? ' REFERENCES ingredients(id) ON DELETE CASCADE' : '';
  return `
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id INTEGER NOT NULL${ingredientRef},
      quantity REAL,
      unit TEXT NOT NULL DEFAULT 'g',
      PRIMARY KEY (recipe_id, ingredient_id)
    );

    CREATE TABLE IF NOT EXISTS recipe_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      action TEXT NOT NULL,
      utensil TEXT,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS step_ingredients (
      step_id INTEGER NOT NULL REFERENCES recipe_steps(id) ON DELETE CASCADE,
      ingredient_id INTEGER NOT NULL${ingredientRef},
      PRIMARY KEY (step_id, ingredient_id)
    );
  `;
}

// Base catalogue : ingrédients partagés + recettes publiques.
export function createCatalogDb(dbPath = ':memory:') {
  const db = open(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'Autre',
      default_unit TEXT NOT NULL DEFAULT 'g'
    );
  `);
  db.exec(recipesDdl(true));
  return db;
}

// Base des comptes utilisateurs.
export function createUsersDb(dbPath = ':memory:') {
  const db = open(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

// Base personnelle d'un utilisateur : ses recettes + ses recettes choisies.
export function createUserDb(dbPath = ':memory:') {
  const db = open(dbPath);
  db.exec(recipesDdl(false));
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_recipes (
      catalog_recipe_id INTEGER PRIMARY KEY,
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

// Gère les 3 types de bases. dataDir = ':memory:' pour les tests.
export class DatabaseManager {
  constructor(dataDir = process.env.RECIPE_DATA_DIR || 'data') {
    this.dataDir = dataDir;
    this.memory = dataDir === ':memory:';
    this.catalog = createCatalogDb(this.memory ? ':memory:' : path.join(dataDir, 'app.db'));
    this.users = createUsersDb(this.memory ? ':memory:' : path.join(dataDir, 'users.db'));
    this._userDbs = new Map();
  }

  getUserDb(username) {
    if (!this._userDbs.has(username)) {
      const dbPath = this.memory ? ':memory:' : path.join(this.dataDir, 'users', `${username}.db`);
      this._userDbs.set(username, createUserDb(dbPath));
    }
    return this._userDbs.get(username);
  }
}
