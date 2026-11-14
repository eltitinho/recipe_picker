import { isValidAction, isValidUtensil } from './steps.js';

// Les fonctions prennent deux bases :
//   db        = base contenant les recettes (catalogue OU base personnelle)
//   catalogDb = base contenant les ingrédients (toujours le catalogue)
// Pour les recettes du catalogue, passer la même base deux fois (défaut).

function resolveIngredientNames(catalogDb, rows) {
  const stmt = catalogDb.prepare('SELECT name FROM ingredients WHERE id = ?');
  return rows
    .map((row) => ({
      id: row.ingredient_id,
      name: stmt.get(row.ingredient_id)?.name ?? `#${row.ingredient_id}`,
      quantity: row.quantity,
      unit: row.unit,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function getRecipeIngredients(db, catalogDb, recipeId) {
  const rows = db.prepare('SELECT ingredient_id, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?').all(recipeId);
  return resolveIngredientNames(catalogDb, rows);
}

function getSteps(db, catalogDb, recipeId) {
  const steps = db.prepare(
    'SELECT id, position, action, utensil, description FROM recipe_steps WHERE recipe_id = ? ORDER BY position'
  ).all(recipeId);
  const ingStmt = db.prepare('SELECT ingredient_id FROM step_ingredients WHERE step_id = ?');
  return steps.map((step) => ({
    ...step,
    ingredients: resolveIngredientNames(catalogDb, ingStmt.all(step.id)),
  }));
}

export function listRecipes(db, catalogDb = db) {
  const recipes = db.prepare('SELECT id, name, image_url AS imageUrl, servings FROM recipes ORDER BY name').all();
  return recipes.map((recipe) => ({
    ...recipe,
    ingredients: getRecipeIngredients(db, catalogDb, recipe.id),
    steps: getSteps(db, catalogDb, recipe.id),
  }));
}

export function getRecipe(db, id, catalogDb = db) {
  const recipe = db.prepare('SELECT id, name, image_url AS imageUrl, servings FROM recipes WHERE id = ?').get(id);
  if (!recipe) return null;
  recipe.ingredients = getRecipeIngredients(db, catalogDb, id);
  recipe.steps = getSteps(db, catalogDb, id);
  return recipe;
}

// Normalise [{id, quantity}, ...] en Map(id -> quantity|null), avec validations.
function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error('Une recette doit avoir au moins un ingrédient');
  }
  const map = new Map();
  for (const ing of ingredients ?? []) {
    const id = Number(ing?.id);
    if (!Number.isInteger(id)) {
      throw new Error('Un ou plusieurs ingrédients sont inconnus');
    }
    let quantity = null;
    if (ing.quantity !== undefined && ing.quantity !== null && ing.quantity !== '') {
      quantity = Number(ing.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('La quantité doit être un nombre positif');
      }
    }
    map.set(id, quantity);
  }
  return map;
}

// Valide et normalise les étapes. Les ingrédients d'une étape doivent
// appartenir à la recette.
function normalizeSteps(steps, recipeIngredientIds) {
  if (steps === undefined || steps === null) {
    return [];
  }
  if (!Array.isArray(steps)) {
    throw new Error('Les étapes doivent être une liste');
  }
  return steps.map((step, index) => {
    if (!isValidAction(step?.action)) {
      throw new Error(`Action d'étape inconnue : ${step?.action}`);
    }
    const utensil = step.utensil || null;
    if (utensil !== null && !isValidUtensil(utensil)) {
      throw new Error(`Ustensile inconnu : ${utensil}`);
    }
    const ingredientIds = [...new Set((step.ingredientIds ?? []).map(Number))];
    for (const id of ingredientIds) {
      if (!recipeIngredientIds.has(id)) {
        throw new Error('Une étape utilise un ingrédient absent de la recette');
      }
    }
    return {
      position: index + 1,
      action: step.action,
      utensil,
      description: (step.description ?? '').trim(),
      ingredientIds,
    };
  });
}

// Valide et normalise les données d'une recette (ajout ou modification).
function validateRecipeData({ name, ingredients = [], steps = [], imageUrl = null, servings = 4 }, catalogDb) {
  const cleaned = (name ?? '').trim();
  if (!cleaned) {
    throw new Error('Le nom de la recette ne peut pas être vide');
  }
  const cleanedImageUrl = (imageUrl ?? '').trim() || null;
  const cleanedServings = servings === undefined || servings === null || servings === '' ? 4 : Number(servings);
  if (!Number.isInteger(cleanedServings) || cleanedServings < 1) {
    throw new Error('Le nombre de personnes doit être un entier positif');
  }
  const ingredientMap = normalizeIngredients(ingredients);
  const uniqueIds = [...ingredientMap.keys()];
  const placeholders = uniqueIds.map(() => '?').join(',');
  const catalogRows = catalogDb.prepare(`SELECT id, default_unit AS defaultUnit FROM ingredients WHERE id IN (${placeholders})`).all(...uniqueIds);
  if (catalogRows.length !== uniqueIds.length) {
    throw new Error('Un ou plusieurs ingrédients sont inconnus');
  }
  const unitById = new Map(catalogRows.map((row) => [row.id, row.defaultUnit]));
  const normalizedSteps = normalizeSteps(steps, new Set(uniqueIds));
  return { cleaned, cleanedImageUrl, cleanedServings, ingredientMap, unitById, normalizedSteps };
}

// Insère ingrédients et étapes d'une recette (après INSERT ou UPDATE).
function insertRecipeParts(db, recipeId, { ingredientMap, unitById, normalizedSteps }) {
  const linkStmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
  for (const [ingredientId, quantity] of ingredientMap) {
    linkStmt.run(recipeId, ingredientId, quantity, unitById.get(ingredientId) ?? 'g');
  }

  const stepStmt = db.prepare('INSERT INTO recipe_steps (recipe_id, position, action, utensil, description) VALUES (?, ?, ?, ?, ?)');
  const stepIngStmt = db.prepare('INSERT INTO step_ingredients (step_id, ingredient_id) VALUES (?, ?)');
  for (const step of normalizedSteps) {
    const stepId = stepStmt.run(recipeId, step.position, step.action, step.utensil, step.description).lastInsertRowid;
    for (const ingredientId of step.ingredientIds) {
      stepIngStmt.run(stepId, ingredientId);
    }
  }
}

export function addRecipe(db, data, catalogDb = db) {
  const validated = validateRecipeData(data, catalogDb);
  try {
    db.exec('BEGIN');
    const result = db.prepare('INSERT INTO recipes (name, image_url, servings) VALUES (?, ?, ?)').run(validated.cleaned, validated.cleanedImageUrl, validated.cleanedServings);
    insertRecipeParts(db, result.lastInsertRowid, validated);
    db.exec('COMMIT');
    return getRecipe(db, result.lastInsertRowid, catalogDb);
  } catch (err) {
    db.exec('ROLLBACK');
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error(`La recette "${validated.cleaned}" existe déjà`);
    }
    throw err;
  }
}

// Modifie une recette existante (ingrédients et étapes réinsérés).
// imageUrl absent de data → conservée ; '' ou null → supprimée ; chaîne → remplacée.
export function updateRecipe(db, id, data, catalogDb = db) {
  const recipeId = Number(id);
  if (!getRecipe(db, recipeId, catalogDb)) {
    throw new Error('Recette introuvable');
  }
  const imageProvided = Object.prototype.hasOwnProperty.call(data ?? {}, 'imageUrl');
  const validated = validateRecipeData(data, catalogDb);
  try {
    db.exec('BEGIN');
    if (imageProvided) {
      db.prepare('UPDATE recipes SET name = ?, servings = ?, image_url = ? WHERE id = ?').run(validated.cleaned, validated.cleanedServings, validated.cleanedImageUrl, recipeId);
    } else {
      db.prepare('UPDATE recipes SET name = ?, servings = ? WHERE id = ?').run(validated.cleaned, validated.cleanedServings, recipeId);
    }
    db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(recipeId);
    db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?').run(recipeId);
    insertRecipeParts(db, recipeId, validated);
    db.exec('COMMIT');
    return getRecipe(db, recipeId, catalogDb);
  } catch (err) {
    db.exec('ROLLBACK');
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error(`La recette "${validated.cleaned}" existe déjà`);
    }
    throw err;
  }
}

export function deleteRecipe(db, id) {
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
  return result.changes > 0;
}

// Retourne les recettes réalisables : tous leurs ingrédients sont disponibles.
export function findRecipesByIngredients(db, availableIngredientIds, catalogDb = db) {
  const available = new Set(availableIngredientIds.map(Number));
  return listRecipes(db, catalogDb).filter((recipe) =>
    recipe.ingredients.length > 0 && recipe.ingredients.every((ing) => available.has(ing.id))
  );
}

// --- Recettes choisies (références vers le catalogue, base personnelle) ---

export function saveRecipe(userDb, catalogRecipeId) {
  return userDb.prepare('INSERT OR IGNORE INTO saved_recipes (catalog_recipe_id) VALUES (?)').run(catalogRecipeId).changes > 0;
}

export function unsaveRecipe(userDb, catalogRecipeId) {
  return userDb.prepare('DELETE FROM saved_recipes WHERE catalog_recipe_id = ?').run(catalogRecipeId).changes > 0;
}

export function listSavedRecipeIds(userDb) {
  return userDb.prepare('SELECT catalog_recipe_id AS id FROM saved_recipes ORDER BY saved_at').all().map((r) => r.id);
}
