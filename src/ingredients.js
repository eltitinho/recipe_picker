export function listIngredients(db) {
  return db.prepare('SELECT id, name, category, default_unit AS defaultUnit FROM ingredients ORDER BY category, name').all();
}

export function addIngredient(db, name, category = 'Autre', defaultUnit = 'g') {
  const cleaned = (name ?? '').trim();
  if (!cleaned) {
    throw new Error('Le nom de l\'ingrédient ne peut pas être vide');
  }
  const cleanedCategory = (category ?? '').trim() || 'Autre';
  const cleanedUnit = (defaultUnit ?? '').trim() || 'g';
  try {
    const result = db.prepare('INSERT INTO ingredients (name, category, default_unit) VALUES (?, ?, ?)').run(cleaned, cleanedCategory, cleanedUnit);
    return { id: result.lastInsertRowid, name: cleaned, category: cleanedCategory, defaultUnit: cleanedUnit };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error(`L'ingrédient "${cleaned}" existe déjà`);
    }
    throw err;
  }
}

export function deleteIngredient(db, id) {
  const result = db.prepare('DELETE FROM ingredients WHERE id = ?').run(id);
  return result.changes > 0;
}
