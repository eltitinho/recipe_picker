import { describe, it, expect, beforeEach } from 'vitest';
import { createCatalogDb } from '../src/db.js';
import { listIngredients, addIngredient, deleteIngredient } from '../src/ingredients.js';

let db;

beforeEach(() => {
  db = createCatalogDb(':memory:');
});

describe('ingredients', () => {
  it('ajoute un ingrédient et le liste', () => {
    const ing = addIngredient(db, 'Tomate');
    expect(ing.name).toBe('Tomate');
    expect(listIngredients(db)).toEqual([{ id: ing.id, name: 'Tomate', category: 'Autre', defaultUnit: 'g' }]);
  });

  it('ajoute un ingrédient avec une catégorie et une unité', () => {
    const ing = addIngredient(db, 'Lait', 'Produits laitiers & œufs', 'ml');
    expect(ing.category).toBe('Produits laitiers & œufs');
    expect(ing.defaultUnit).toBe('ml');
    expect(listIngredients(db)[0].defaultUnit).toBe('ml');
  });

  it('utilise "Autre" et "g" si catégorie et unité sont vides', () => {
    const ing = addIngredient(db, 'Tomate', '   ', ' ');
    expect(ing.category).toBe('Autre');
    expect(ing.defaultUnit).toBe('g');
  });

  it('refuse un nom vide ou composé d\'espaces', () => {
    expect(() => addIngredient(db, '')).toThrow('vide');
    expect(() => addIngredient(db, '   ')).toThrow('vide');
    expect(() => addIngredient(db, null)).toThrow('vide');
  });

  it('supprime les espaces autour du nom et de la catégorie', () => {
    const ing = addIngredient(db, '  Oignon  ', ' Légumes ');
    expect(ing.name).toBe('Oignon');
    expect(ing.category).toBe('Légumes');
  });

  it('refuse les doublons', () => {
    addIngredient(db, 'Sel');
    expect(() => addIngredient(db, 'Sel')).toThrow('existe déjà');
  });

  it('trie les ingrédients par catégorie puis par nom', () => {
    addIngredient(db, 'Poivre', 'Épices');
    addIngredient(db, 'Ail', 'Légumes');
    addIngredient(db, 'Carotte', 'Légumes');
    expect(listIngredients(db).map((i) => i.name)).toEqual(['Ail', 'Carotte', 'Poivre']);
  });

  it('supprime un ingrédient existant', () => {
    const ing = addIngredient(db, 'Beurre');
    expect(deleteIngredient(db, ing.id)).toBe(true);
    expect(listIngredients(db)).toEqual([]);
  });

  it('retourne false si l\'ingrédient à supprimer n\'existe pas', () => {
    expect(deleteIngredient(db, 999)).toBe(false);
  });
});
