import { describe, it, expect, beforeEach } from 'vitest';
import { createCatalogDb } from '../src/db.js';
import { addIngredient } from '../src/ingredients.js';
import { listRecipes, addRecipe, updateRecipe, deleteRecipe, findRecipesByIngredients } from '../src/recipes.js';

let db;
let tomate, oignon, pates, fromage;

beforeEach(() => {
  db = createCatalogDb(':memory:');
  tomate = addIngredient(db, 'Tomate');
  oignon = addIngredient(db, 'Oignon');
  pates = addIngredient(db, 'Pâtes');
  fromage = addIngredient(db, 'Fromage');
});

describe('recipes', () => {
  it('ajoute une recette avec ses ingrédients', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes à la tomate',
      ingredients: [{ id: pates.id }, { id: tomate.id }],
    });
    expect(recipe.name).toBe('Pâtes à la tomate');
    expect(recipe.ingredients.map((i) => i.name).sort()).toEqual(['Pâtes', 'Tomate']);
    expect(recipe.steps).toEqual([]);
    expect(listRecipes(db)).toHaveLength(1);
  });

  it('stocke et renvoie l\'image (imageUrl)', () => {
    const withImage = addRecipe(db, {
      name: 'Gratin',
      ingredients: [{ id: fromage.id }],
      imageUrl: 'https://example.com/gratin.jpg',
    });
    expect(withImage.imageUrl).toBe('https://example.com/gratin.jpg');
    const withoutImage = addRecipe(db, { name: 'Salade', ingredients: [{ id: tomate.id }] });
    expect(withoutImage.imageUrl).toBeNull();
    const listed = listRecipes(db);
    expect(listed.find((r) => r.name === 'Gratin').imageUrl).toBe('https://example.com/gratin.jpg');
    expect(listed.find((r) => r.name === 'Salade').imageUrl).toBeNull();
  });

  it('stocke les portions (servings), 4 par défaut', () => {
    const custom = addRecipe(db, { name: 'Gratin', ingredients: [{ id: fromage.id }], servings: 6 });
    expect(custom.servings).toBe(6);
    const defaut = addRecipe(db, { name: 'Salade', ingredients: [{ id: tomate.id }] });
    expect(defaut.servings).toBe(4);
    expect(listRecipes(db).find((r) => r.name === 'Gratin').servings).toBe(6);
    expect(listRecipes(db).find((r) => r.name === 'Salade').servings).toBe(4);
  });

  it('refuse des portions invalides', () => {
    expect(() => addRecipe(db, { name: 'A', ingredients: [{ id: tomate.id }], servings: 0 })).toThrow('entier positif');
    expect(() => addRecipe(db, { name: 'B', ingredients: [{ id: tomate.id }], servings: -2 })).toThrow('entier positif');
    expect(() => addRecipe(db, { name: 'C', ingredients: [{ id: tomate.id }], servings: 2.5 })).toThrow('entier positif');
    expect(() => addRecipe(db, { name: 'D', ingredients: [{ id: tomate.id }], servings: 'abc' })).toThrow('entier positif');
  });

  it('modifie une recette (nom, portions, ingrédients, étapes)', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes tomate',
      servings: 2,
      ingredients: [{ id: pates.id, quantity: 200 }, { id: tomate.id }],
      steps: [{ action: 'cook', description: 'Cuire les pâtes', ingredientIds: [pates.id] }],
      imageUrl: 'https://example.com/pates.jpg',
    });
    const updated = updateRecipe(db, recipe.id, {
      name: 'Pâtes tomate oignon',
      servings: 6,
      ingredients: [{ id: pates.id, quantity: 500 }, { id: oignon.id, quantity: 1 }],
      steps: [
        { action: 'prepare', description: 'Émincer', ingredientIds: [oignon.id] },
        { action: 'cook', description: 'Tout cuire', ingredientIds: [pates.id, oignon.id] },
      ],
    });
    expect(updated.id).toBe(recipe.id);
    expect(updated.name).toBe('Pâtes tomate oignon');
    expect(updated.servings).toBe(6);
    expect(updated.imageUrl).toBe('https://example.com/pates.jpg'); // conservée
    expect(updated.ingredients.map((i) => i.name).sort()).toEqual(['Oignon', 'Pâtes']);
    expect(updated.ingredients.find((i) => i.name === 'Pâtes').quantity).toBe(500);
    expect(updated.steps).toHaveLength(2);
    expect(updated.steps[0].action).toBe('prepare');
    expect(updated.steps[1].ingredients.map((i) => i.name).sort()).toEqual(['Oignon', 'Pâtes']);
    expect(listRecipes(db)).toHaveLength(1);
  });

  it('modifie l\'image seulement si imageUrl est fourni', () => {
    const recipe = addRecipe(db, {
      name: 'Gratin',
      ingredients: [{ id: fromage.id }],
      imageUrl: 'https://example.com/avant.jpg',
    });
    // imageUrl absent → conservée
    const kept = updateRecipe(db, recipe.id, { name: 'Gratin', ingredients: [{ id: fromage.id }] });
    expect(kept.imageUrl).toBe('https://example.com/avant.jpg');
    // imageUrl fourni → remplacée
    const replaced = updateRecipe(db, recipe.id, { name: 'Gratin', ingredients: [{ id: fromage.id }], imageUrl: '/images/user/x.png' });
    expect(replaced.imageUrl).toBe('/images/user/x.png');
    // imageUrl vide → supprimée
    const cleared = updateRecipe(db, recipe.id, { name: 'Gratin', ingredients: [{ id: fromage.id }], imageUrl: '' });
    expect(cleared.imageUrl).toBeNull();
  });

  it('refuse de modifier une recette introuvable', () => {
    expect(() => updateRecipe(db, 999, { name: 'X', ingredients: [{ id: tomate.id }] })).toThrow('introuvable');
  });

  it('applique les mêmes validations à la modification', () => {
    const recipe = addRecipe(db, { name: 'Gratin', ingredients: [{ id: fromage.id }] });
    addRecipe(db, { name: 'Salade', ingredients: [{ id: tomate.id }] });
    expect(() => updateRecipe(db, recipe.id, { name: '', ingredients: [{ id: tomate.id }] })).toThrow('vide');
    expect(() => updateRecipe(db, recipe.id, { name: 'X', ingredients: [] })).toThrow('au moins un ingrédient');
    expect(() => updateRecipe(db, recipe.id, { name: 'X', ingredients: [{ id: 999 }] })).toThrow('inconnus');
    expect(() => updateRecipe(db, recipe.id, { name: 'X', ingredients: [{ id: tomate.id }], servings: 0 })).toThrow('entier positif');
    expect(() => updateRecipe(db, recipe.id, { name: 'Salade', ingredients: [{ id: tomate.id }] })).toThrow('existe déjà');
    // Échec de validation : la recette d'origine est intacte
    const unchanged = listRecipes(db).find((r) => r.id === recipe.id);
    expect(unchanged.name).toBe('Gratin');
    expect(unchanged.ingredients.map((i) => i.name)).toEqual(['Fromage']);
  });

  it('refuse un nom vide', () => {
    expect(() => addRecipe(db, { name: '', ingredients: [{ id: pates.id }] })).toThrow('vide');
  });

  it('refuse une recette sans ingrédient', () => {
    expect(() => addRecipe(db, { name: 'Rien', ingredients: [] })).toThrow('au moins un ingrédient');
  });

  it('refuse des ingrédients inconnus', () => {
    expect(() => addRecipe(db, { name: 'Mystère', ingredients: [{ id: 999 }] })).toThrow('inconnus');
    expect(() => addRecipe(db, { name: 'Mystère', ingredients: [{ id: 'abc' }] })).toThrow('inconnus');
  });

  it('refuse les doublons de nom', () => {
    addRecipe(db, { name: 'Gratin', ingredients: [{ id: fromage.id }] });
    expect(() => addRecipe(db, { name: 'Gratin', ingredients: [{ id: tomate.id }] })).toThrow('existe déjà');
  });

  it('ignore les doublons d\'ingrédients dans la même recette', () => {
    const recipe = addRecipe(db, {
      name: 'Tomate simple',
      ingredients: [{ id: tomate.id }, { id: tomate.id, quantity: 100 }],
    });
    expect(recipe.ingredients).toHaveLength(1);
  });

  it('supprime une recette', () => {
    const recipe = addRecipe(db, { name: 'Salade', ingredients: [{ id: tomate.id }] });
    expect(deleteRecipe(db, recipe.id)).toBe(true);
    expect(listRecipes(db)).toEqual([]);
    expect(deleteRecipe(db, 999)).toBe(false);
  });

  it('la suppression d\'un ingrédient le retire des recettes (cascade)', () => {
    const recipe = addRecipe(db, { name: 'Pâtes tomate', ingredients: [{ id: pates.id }, { id: tomate.id }] });
    db.prepare('DELETE FROM ingredients WHERE id = ?').run(tomate.id);
    const [updated] = listRecipes(db);
    expect(updated.id).toBe(recipe.id);
    expect(updated.ingredients.map((i) => i.name)).toEqual(['Pâtes']);
  });
});

describe('quantités', () => {
  it('stocke et relit les quantités avec l\'unité par défaut', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes à la tomate',
      ingredients: [
        { id: pates.id, quantity: 250 },
        { id: tomate.id, quantity: 400 },
      ],
    });
    const patesIng = recipe.ingredients.find((i) => i.name === 'Pâtes');
    const tomateIng = recipe.ingredients.find((i) => i.name === 'Tomate');
    expect(patesIng.quantity).toBe(250);
    expect(patesIng.unit).toBe('g');
    expect(tomateIng.quantity).toBe(400);
  });

  it('accepte les quantités décimales', () => {
    const recipe = addRecipe(db, {
      name: 'Tomate cerise',
      ingredients: [{ id: tomate.id, quantity: 0.5 }],
    });
    expect(recipe.ingredients[0].quantity).toBe(0.5);
  });

  it('la quantité est optionnelle (null si absente ou vide)', () => {
    const recipe = addRecipe(db, {
      name: 'Salade de tomates',
      ingredients: [{ id: tomate.id }, { id: oignon.id, quantity: '' }],
    });
    expect(recipe.ingredients.find((i) => i.name === 'Tomate').quantity).toBeNull();
    expect(recipe.ingredients.find((i) => i.name === 'Oignon').quantity).toBeNull();
  });

  it('refuse les quantités négatives, nulles ou non numériques', () => {
    expect(() => addRecipe(db, { name: 'A', ingredients: [{ id: tomate.id, quantity: -5 }] })).toThrow('positif');
    expect(() => addRecipe(db, { name: 'B', ingredients: [{ id: tomate.id, quantity: 0 }] })).toThrow('positif');
    expect(() => addRecipe(db, { name: 'C', ingredients: [{ id: tomate.id, quantity: 'abc' }] })).toThrow('positif');
  });

  it('accepte les quantités sous forme de chaînes numériques', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes',
      ingredients: [{ id: pates.id, quantity: '300' }],
    });
    expect(recipe.ingredients[0].quantity).toBe(300);
  });

  it('les quantités sont présentes dans listRecipes', () => {
    addRecipe(db, {
      name: 'Gratin',
      ingredients: [{ id: pates.id, quantity: 200 }, { id: fromage.id, quantity: 150 }],
    });
    const [recipe] = listRecipes(db);
    expect(recipe.ingredients.find((i) => i.name === 'Fromage').quantity).toBe(150);
  });
});

describe('étapes', () => {
  it('ajoute des étapes et préserve l\'ordre', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes à la tomate',
      ingredients: [{ id: pates.id }, { id: tomate.id }],
      steps: [
        { action: 'prepare', utensil: 'Couteau', description: 'en petits dés', ingredientIds: [tomate.id] },
        { action: 'cook', utensil: 'Casserole', description: 'eau salée', ingredientIds: [pates.id] },
        { action: 'serve' },
      ],
    });
    expect(recipe.steps).toHaveLength(3);
    expect(recipe.steps.map((s) => s.position)).toEqual([1, 2, 3]);
    expect(recipe.steps.map((s) => s.action)).toEqual(['prepare', 'cook', 'serve']);
    expect(recipe.steps[0].utensil).toBe('Couteau');
    expect(recipe.steps[0].description).toBe('en petits dés');
    expect(recipe.steps[0].ingredients.map((i) => i.name)).toEqual(['Tomate']);
    expect(recipe.steps[2].utensil).toBeNull();
    expect(recipe.steps[2].ingredients).toEqual([]);
  });

  it('les étapes sont présentes dans listRecipes', () => {
    addRecipe(db, {
      name: 'Pâtes',
      ingredients: [{ id: pates.id }],
      steps: [{ action: 'cook', description: '10 min' }],
    });
    const [recipe] = listRecipes(db);
    expect(recipe.steps).toHaveLength(1);
    expect(recipe.steps[0].action).toBe('cook');
  });

  it('refuse une action inconnue', () => {
    expect(() => addRecipe(db, {
      name: 'A',
      ingredients: [{ id: tomate.id }],
      steps: [{ action: 'teleport' }],
    })).toThrow('Action d\'étape inconnue');
    expect(() => addRecipe(db, {
      name: 'B',
      ingredients: [{ id: tomate.id }],
      steps: [{}],
    })).toThrow('Action d\'étape inconnue');
  });

  it('refuse un ustensile inconnu', () => {
    expect(() => addRecipe(db, {
      name: 'A',
      ingredients: [{ id: tomate.id }],
      steps: [{ action: 'cook', utensil: 'Sabre laser' }],
    })).toThrow('Ustensile inconnu');
  });

  it('refuse un ingrédient d\'étape absent de la recette', () => {
    expect(() => addRecipe(db, {
      name: 'A',
      ingredients: [{ id: tomate.id }],
      steps: [{ action: 'prepare', ingredientIds: [fromage.id] }],
    })).toThrow('absent de la recette');
  });

  it('la suppression d\'une recette supprime ses étapes (cascade)', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes',
      ingredients: [{ id: pates.id }],
      steps: [{ action: 'cook', ingredientIds: [pates.id] }],
    });
    deleteRecipe(db, recipe.id);
    expect(db.prepare('SELECT COUNT(*) AS c FROM recipe_steps').get().c).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS c FROM step_ingredients').get().c).toBe(0);
  });

  it('la suppression d\'un ingrédient le retire des étapes (cascade)', () => {
    const recipe = addRecipe(db, {
      name: 'Pâtes tomate',
      ingredients: [{ id: pates.id }, { id: tomate.id }],
      steps: [{ action: 'mix', ingredientIds: [pates.id, tomate.id] }],
    });
    db.prepare('DELETE FROM ingredients WHERE id = ?').run(tomate.id);
    const [updated] = listRecipes(db);
    expect(updated.steps[0].ingredients.map((i) => i.name)).toEqual(['Pâtes']);
  });
});

describe('findRecipesByIngredients', () => {
  beforeEach(() => {
    addRecipe(db, { name: 'Pâtes à la tomate', ingredients: [{ id: pates.id, quantity: 250 }, { id: tomate.id }] });
    addRecipe(db, { name: 'Pâtes au fromage', ingredients: [{ id: pates.id }, { id: fromage.id }] });
    addRecipe(db, { name: 'Salade tomate oignon', ingredients: [{ id: tomate.id }, { id: oignon.id }] });
  });

  it('retourne uniquement les recettes dont tous les ingrédients sont disponibles', () => {
    const results = findRecipesByIngredients(db, [pates.id, tomate.id]);
    expect(results.map((r) => r.name)).toEqual(['Pâtes à la tomate']);
  });

  it('retourne plusieurs recettes si tout est disponible', () => {
    const results = findRecipesByIngredients(db, [pates.id, tomate.id, fromage.id, oignon.id]);
    expect(results).toHaveLength(3);
  });

  it('retourne une liste vide si aucun ingrédient disponible', () => {
    expect(findRecipesByIngredients(db, [])).toEqual([]);
  });

  it('accepte les ids sous forme de chaînes', () => {
    const results = findRecipesByIngredients(db, [String(pates.id), String(tomate.id)]);
    expect(results.map((r) => r.name)).toEqual(['Pâtes à la tomate']);
  });
});
