import { describe, it, expect, beforeEach } from 'vitest';
import { createCatalogDb } from '../src/db.js';
import { listIngredients } from '../src/ingredients.js';
import { CATEGORIES, DEFAULT_INGREDIENTS, seedDefaultIngredients, seedIfEmpty, applyDefaultUnits } from '../src/seed.js';

let db;

beforeEach(() => {
  db = createCatalogDb(':memory:');
});

describe('seed', () => {
  it('insère tous les ingrédients par défaut', () => {
    const inserted = seedDefaultIngredients(db);
    expect(inserted).toBe(DEFAULT_INGREDIENTS.length);
    expect(listIngredients(db)).toHaveLength(DEFAULT_INGREDIENTS.length);
  });

  it('est idempotent : pas de doublons si exécuté deux fois', () => {
    seedDefaultIngredients(db);
    const secondRun = seedDefaultIngredients(db);
    expect(secondRun).toBe(0);
    expect(listIngredients(db)).toHaveLength(DEFAULT_INGREDIENTS.length);
  });

  it('chaque ingrédient par défaut a une catégorie connue', () => {
    for (const { category } of DEFAULT_INGREDIENTS) {
      expect(CATEGORIES).toContain(category);
    }
  });

  it('n\'a pas de noms en double dans la liste par défaut', () => {
    const names = DEFAULT_INGREDIENTS.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('attribue les bonnes catégories', () => {
    seedDefaultIngredients(db);
    const ingredients = listIngredients(db);
    const byName = Object.fromEntries(ingredients.map((i) => [i.name, i.category]));
    expect(byName['Tomate']).toBe('Légumes');
    expect(byName['Poulet entier']).toBe('Viandes & charcuterie');
    expect(byName['Lentilles vertes']).toBe('Légumineuses');
  });

  it('attribue les bonnes unités par défaut', () => {
    seedDefaultIngredients(db);
    const ingredients = listIngredients(db);
    const byName = Object.fromEntries(ingredients.map((i) => [i.name, i.defaultUnit]));
    expect(byName['Lait']).toBe('ml');
    expect(byName['Crème fraîche']).toBe('ml');
    expect(byName['Huile d\'olive']).toBe('ml');
    expect(byName['Vin blanc']).toBe('ml');
    expect(byName['Œuf']).toBe('pièce');
    expect(byName['Tomate']).toBe('g');
  });

  it('applyDefaultUnits corrige les unités d\'une base existante', () => {
    seedDefaultIngredients(db);
    db.prepare('UPDATE ingredients SET default_unit = ? WHERE name = ?').run('g', 'Lait');
    applyDefaultUnits(db);
    const byName = Object.fromEntries(listIngredients(db).map((i) => [i.name, i.defaultUnit]));
    expect(byName['Lait']).toBe('ml');
  });

  it('seedIfEmpty ne remplit que si la base est vide', () => {
    expect(seedIfEmpty(db)).toBe(DEFAULT_INGREDIENTS.length);
    expect(seedIfEmpty(db)).toBe(0);
  });

  it('seedIfEmpty ne réinsère pas les ingrédients supprimés si la base n\'est pas vide', () => {
    seedIfEmpty(db);
    db.prepare('DELETE FROM ingredients WHERE name = ?').run('Ail');
    expect(seedIfEmpty(db)).toBe(0);
    const names = listIngredients(db).map((i) => i.name);
    expect(names).not.toContain('Ail');
  });
});
