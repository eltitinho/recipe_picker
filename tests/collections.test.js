import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseManager } from '../src/db.js';
import { register } from '../src/auth.js';
import { addIngredient } from '../src/ingredients.js';
import {
  listRecipes, addRecipe, getRecipe,
  saveRecipe, unsaveRecipe, listSavedRecipeIds,
} from '../src/recipes.js';

let manager;
let tomate, pates;

beforeEach(() => {
  manager = new DatabaseManager(':memory:');
  tomate = addIngredient(manager.catalog, 'Tomate', 'Légumes');
  pates = addIngredient(manager.catalog, 'Pâtes', 'Féculents & céréales');
  register(manager.users, 'kristian', 'secret1');
  register(manager.users, 'marie', 'secret2');
});

describe('bases utilisateur', () => {
  it('chaque utilisateur a sa propre base isolée', () => {
    const kristianDb = manager.getUserDb('kristian');
    const marieDb = manager.getUserDb('marie');
    addRecipe(kristianDb, { name: 'Mes pâtes', ingredients: [{ id: pates.id }] }, manager.catalog);

    expect(listRecipes(kristianDb, manager.catalog)).toHaveLength(1);
    expect(listRecipes(marieDb, manager.catalog)).toHaveLength(0);
  });

  it('la base utilisateur est mise en cache (même instance)', () => {
    expect(manager.getUserDb('kristian')).toBe(manager.getUserDb('kristian'));
  });

  it('les recettes personnelles résolvent les noms depuis le catalogue', () => {
    const kristianDb = manager.getUserDb('kristian');
    const recipe = addRecipe(kristianDb, {
      name: 'Pâtes à la tomate',
      ingredients: [{ id: pates.id, quantity: 250 }, { id: tomate.id }],
    }, manager.catalog);
    expect(recipe.ingredients.map((i) => i.name).sort()).toEqual(['Pâtes', 'Tomate']);
  });

  it('l\'unité de la recette suit l\'unité par défaut de l\'ingrédient', () => {
    const lait = addIngredient(manager.catalog, 'Lait', 'Produits laitiers & œufs', 'ml');
    const kristianDb = manager.getUserDb('kristian');
    const recipe = addRecipe(kristianDb, {
      name: 'Béchamel',
      ingredients: [{ id: lait.id, quantity: 500 }],
    }, manager.catalog);
    expect(recipe.ingredients[0].unit).toBe('ml');
  });
});

describe('recettes choisies (saved_recipes)', () => {
  let catalogRecipe;

  beforeEach(() => {
    catalogRecipe = addRecipe(manager.catalog, {
      name: 'Recette publique',
      ingredients: [{ id: tomate.id }],
    });
  });

  it('sauvegarde et liste une recette du catalogue', () => {
    const kristianDb = manager.getUserDb('kristian');
    expect(saveRecipe(kristianDb, catalogRecipe.id)).toBe(true);
    expect(listSavedRecipeIds(kristianDb)).toEqual([catalogRecipe.id]);
  });

  it('la sauvegarde est idempotente', () => {
    const kristianDb = manager.getUserDb('kristian');
    saveRecipe(kristianDb, catalogRecipe.id);
    expect(saveRecipe(kristianDb, catalogRecipe.id)).toBe(false);
    expect(listSavedRecipeIds(kristianDb)).toHaveLength(1);
  });

  it('retire une recette sauvegardée', () => {
    const kristianDb = manager.getUserDb('kristian');
    saveRecipe(kristianDb, catalogRecipe.id);
    expect(unsaveRecipe(kristianDb, catalogRecipe.id)).toBe(true);
    expect(listSavedRecipeIds(kristianDb)).toEqual([]);
    expect(unsaveRecipe(kristianDb, 999)).toBe(false);
  });

  it('les sauvegardes sont isolées par utilisateur', () => {
    saveRecipe(manager.getUserDb('kristian'), catalogRecipe.id);
    expect(listSavedRecipeIds(manager.getUserDb('marie'))).toEqual([]);
  });

  it('une recette du catalogue supprimée devient introuvable via getRecipe', () => {
    const kristianDb = manager.getUserDb('kristian');
    saveRecipe(kristianDb, catalogRecipe.id);
    manager.catalog.prepare('DELETE FROM recipes WHERE id = ?').run(catalogRecipe.id);
    // La référence reste mais getRecipe renvoie null : le serveur les filtre.
    expect(getRecipe(manager.catalog, catalogRecipe.id)).toBeNull();
  });
});
