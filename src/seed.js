export const CATEGORIES = [
  'Légumes',
  'Fruits',
  'Viandes & charcuterie',
  'Poissons & fruits de mer',
  'Légumineuses',
  'Féculents & céréales',
  'Produits laitiers & œufs',
  'Herbes, épices & aromates',
  'Huiles, condiments & sauces',
  'Noix & graines',
  'Sucres & pâtisserie',
  'Épicerie & divers',
  'Autre',
];

export const DEFAULT_INGREDIENTS = [
  // Légumes
  { name: 'Tomate', category: 'Légumes' },
  { name: 'Oignon', category: 'Légumes' },
  { name: 'Ail', category: 'Légumes' },
  { name: 'Échalote', category: 'Légumes' },
  { name: 'Carotte', category: 'Légumes' },
  { name: 'Courgette', category: 'Légumes' },
  { name: 'Aubergine', category: 'Légumes' },
  { name: 'Poivron', category: 'Légumes' },
  { name: 'Pomme de terre', category: 'Légumes' },
  { name: 'Brocoli', category: 'Légumes' },
  { name: 'Chou-fleur', category: 'Légumes' },
  { name: 'Épinards', category: 'Légumes' },
  { name: 'Haricots verts', category: 'Légumes' },
  { name: 'Salade', category: 'Légumes' },
  { name: 'Concombre', category: 'Légumes' },
  { name: 'Champignon', category: 'Légumes' },
  { name: 'Courge', category: 'Légumes' },
  { name: 'Potiron', category: 'Légumes' },
  { name: 'Betterave', category: 'Légumes' },
  { name: 'Céleri', category: 'Légumes' },
  { name: 'Fenouil', category: 'Légumes' },
  { name: 'Poireau', category: 'Légumes' },
  { name: 'Navet', category: 'Légumes' },
  { name: 'Radis', category: 'Légumes' },
  { name: 'Endive', category: 'Légumes' },
  { name: 'Chou', category: 'Légumes' },
  { name: 'Chou rouge', category: 'Légumes' },
  { name: 'Petits pois', category: 'Légumes' },
  { name: 'Maïs', category: 'Légumes' },
  { name: 'Artichaut', category: 'Légumes' },
  { name: 'Asperge', category: 'Légumes' },
  { name: 'Avocat', category: 'Légumes' },
  { name: 'Tomate cerise', category: 'Légumes' },
  { name: 'Roquette', category: 'Légumes' },
  { name: 'Blette', category: 'Légumes' },

  // Fruits
  { name: 'Pomme', category: 'Fruits' },
  { name: 'Banane', category: 'Fruits' },
  { name: 'Orange', category: 'Fruits' },
  { name: 'Citron', category: 'Fruits' },
  { name: 'Citron vert', category: 'Fruits' },
  { name: 'Fraise', category: 'Fruits' },
  { name: 'Framboise', category: 'Fruits' },
  { name: 'Myrtille', category: 'Fruits' },
  { name: 'Poire', category: 'Fruits' },
  { name: 'Pêche', category: 'Fruits' },
  { name: 'Abricot', category: 'Fruits' },
  { name: 'Cerise', category: 'Fruits' },
  { name: 'Raisin', category: 'Fruits' },
  { name: 'Ananas', category: 'Fruits' },
  { name: 'Mangue', category: 'Fruits' },
  { name: 'Kiwi', category: 'Fruits' },
  { name: 'Melon', category: 'Fruits' },
  { name: 'Pastèque', category: 'Fruits' },
  { name: 'Prune', category: 'Fruits' },
  { name: 'Figue', category: 'Fruits' },
  { name: 'Grenade', category: 'Fruits' },
  { name: 'Fruits de la passion', category: 'Fruits' },
  { name: 'Compote de pommes', category: 'Fruits' },

  // Viandes & charcuterie
  { name: 'Escalope de poulet', category: 'Viandes & charcuterie' },
  { name: 'Cuisses de poulet', category: 'Viandes & charcuterie' },
  { name: 'Poulet entier', category: 'Viandes & charcuterie' },
  { name: 'Bœuf haché', category: 'Viandes & charcuterie' },
  { name: 'Steak', category: 'Viandes & charcuterie' },
  { name: 'Rôti de bœuf', category: 'Viandes & charcuterie' },
  { name: 'Bœuf à mijoter', category: 'Viandes & charcuterie' },
  { name: 'Côte de porc', category: 'Viandes & charcuterie' },
  { name: 'Échine de porc', category: 'Viandes & charcuterie' },
  { name: 'Rôti de porc', category: 'Viandes & charcuterie' },
  { name: 'Agneau', category: 'Viandes & charcuterie' },
  { name: 'Veau', category: 'Viandes & charcuterie' },
  { name: 'Escalope de dinde', category: 'Viandes & charcuterie' },
  { name: 'Magret de canard', category: 'Viandes & charcuterie' },
  { name: 'Jambon blanc', category: 'Viandes & charcuterie' },
  { name: 'Jambon cru', category: 'Viandes & charcuterie' },
  { name: 'Lardons', category: 'Viandes & charcuterie' },
  { name: 'Bacon', category: 'Viandes & charcuterie' },
  { name: 'Saucisses', category: 'Viandes & charcuterie' },
  { name: 'Merguez', category: 'Viandes & charcuterie' },
  { name: 'Chorizo', category: 'Viandes & charcuterie' },
  { name: 'Chair à saucisse', category: 'Viandes & charcuterie' },
  { name: 'Viande hachée de porc', category: 'Viandes & charcuterie' },

  // Poissons & fruits de mer
  { name: 'Saumon', category: 'Poissons & fruits de mer' },
  { name: 'Thon', category: 'Poissons & fruits de mer' },
  { name: 'Cabillaud', category: 'Poissons & fruits de mer' },
  { name: 'Colin', category: 'Poissons & fruits de mer' },
  { name: 'Merlu', category: 'Poissons & fruits de mer' },
  { name: 'Truite', category: 'Poissons & fruits de mer' },
  { name: 'Sardine', category: 'Poissons & fruits de mer' },
  { name: 'Maquereau', category: 'Poissons & fruits de mer' },
  { name: 'Hareng', category: 'Poissons & fruits de mer' },
  { name: 'Crevettes', category: 'Poissons & fruits de mer' },
  { name: 'Moules', category: 'Poissons & fruits de mer' },
  { name: 'Calamars', category: 'Poissons & fruits de mer' },
  { name: 'Coquilles Saint-Jacques', category: 'Poissons & fruits de mer' },
  { name: 'Thon en boîte', category: 'Poissons & fruits de mer' },
  { name: 'Anchois', category: 'Poissons & fruits de mer' },

  // Légumineuses
  { name: 'Lentilles vertes', category: 'Légumineuses' },
  { name: 'Lentilles corail', category: 'Légumineuses' },
  { name: 'Pois chiches', category: 'Légumineuses' },
  { name: 'Haricots rouges', category: 'Légumineuses' },
  { name: 'Haricots blancs', category: 'Légumineuses' },
  { name: 'Haricots noirs', category: 'Légumineuses' },
  { name: 'Fèves', category: 'Légumineuses' },
  { name: 'Pois cassés', category: 'Légumineuses' },
  { name: 'Flageolets', category: 'Légumineuses' },
  { name: 'Edamame', category: 'Légumineuses' },

  // Féculents & céréales
  { name: 'Pâtes', category: 'Féculents & céréales' },
  { name: 'Spaghetti', category: 'Féculents & céréales' },
  { name: 'Riz', category: 'Féculents & céréales' },
  { name: 'Riz basmati', category: 'Féculents & céréales' },
  { name: 'Riz à risotto', category: 'Féculents & céréales' },
  { name: 'Quinoa', category: 'Féculents & céréales' },
  { name: 'Boulgour', category: 'Féculents & céréales' },
  { name: 'Semoule', category: 'Féculents & céréales' },
  { name: 'Polenta', category: 'Féculents & céréales' },
  { name: 'Sarrasin', category: 'Féculents & céréales' },
  { name: 'Orge', category: 'Féculents & céréales' },
  { name: 'Pain', category: 'Féculents & céréales' },
  { name: 'Pain de mie', category: 'Féculents & céréales' },
  { name: 'Pain burger', category: 'Féculents & céréales' },
  { name: 'Tortillas', category: 'Féculents & céréales' },
  { name: 'Farine', category: 'Féculents & céréales' },
  { name: 'Chapelure', category: 'Féculents & céréales' },
  { name: 'Flocons d\'avoine', category: 'Féculents & céréales' },
  { name: 'Gnocchis', category: 'Féculents & céréales' },
  { name: 'Nouilles', category: 'Féculents & céréales' },

  // Produits laitiers & œufs
  { name: 'Œuf', unit: 'pièce', category: 'Produits laitiers & œufs' },
  { name: 'Lait', unit: 'ml', category: 'Produits laitiers & œufs' },
  { name: 'Beurre', category: 'Produits laitiers & œufs' },
  { name: 'Crème fraîche', unit: 'ml', category: 'Produits laitiers & œufs' },
  { name: 'Crème liquide', unit: 'ml', category: 'Produits laitiers & œufs' },
  { name: 'Fromage râpé', category: 'Produits laitiers & œufs' },
  { name: 'Parmesan', category: 'Produits laitiers & œufs' },
  { name: 'Mozzarella', category: 'Produits laitiers & œufs' },
  { name: 'Comté', category: 'Produits laitiers & œufs' },
  { name: 'Emmental', category: 'Produits laitiers & œufs' },
  { name: 'Chèvre', category: 'Produits laitiers & œufs' },
  { name: 'Feta', category: 'Produits laitiers & œufs' },
  { name: 'Ricotta', category: 'Produits laitiers & œufs' },
  { name: 'Mascarpone', category: 'Produits laitiers & œufs' },
  { name: 'Yaourt nature', category: 'Produits laitiers & œufs' },
  { name: 'Yaourt grec', category: 'Produits laitiers & œufs' },
  { name: 'Fromage blanc', category: 'Produits laitiers & œufs' },
  { name: 'Roquefort', category: 'Produits laitiers & œufs' },
  { name: 'Camembert', category: 'Produits laitiers & œufs' },

  // Herbes, épices & aromates
  { name: 'Sel', category: 'Herbes, épices & aromates' },
  { name: 'Poivre', category: 'Herbes, épices & aromates' },
  { name: 'Paprika', category: 'Herbes, épices & aromates' },
  { name: 'Cumin', category: 'Herbes, épices & aromates' },
  { name: 'Curry', category: 'Herbes, épices & aromates' },
  { name: 'Curcuma', category: 'Herbes, épices & aromates' },
  { name: 'Gingembre', category: 'Herbes, épices & aromates' },
  { name: 'Cannelle', category: 'Herbes, épices & aromates' },
  { name: 'Muscade', category: 'Herbes, épices & aromates' },
  { name: 'Piment', category: 'Herbes, épices & aromates' },
  { name: 'Piment d\'Espelette', category: 'Herbes, épices & aromates' },
  { name: 'Safran', category: 'Herbes, épices & aromates' },
  { name: 'Basilic', category: 'Herbes, épices & aromates' },
  { name: 'Persil', category: 'Herbes, épices & aromates' },
  { name: 'Coriandre', category: 'Herbes, épices & aromates' },
  { name: 'Thym', category: 'Herbes, épices & aromates' },
  { name: 'Romarin', category: 'Herbes, épices & aromates' },
  { name: 'Laurier', category: 'Herbes, épices & aromates' },
  { name: 'Origan', category: 'Herbes, épices & aromates' },
  { name: 'Menthe', category: 'Herbes, épices & aromates' },
  { name: 'Ciboulette', category: 'Herbes, épices & aromates' },
  { name: 'Estragon', category: 'Herbes, épices & aromates' },
  { name: 'Aneth', category: 'Herbes, épices & aromates' },
  { name: 'Herbes de Provence', category: 'Herbes, épices & aromates' },
  { name: 'Ail en poudre', category: 'Herbes, épices & aromates' },
  { name: 'Oignon frit', category: 'Herbes, épices & aromates' },

  // Huiles, condiments & sauces
  { name: 'Huile d\'olive', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Huile de tournesol', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Huile de sésame', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Vinaigre', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Vinaigre balsamique', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Moutarde', category: 'Huiles, condiments & sauces' },
  { name: 'Mayonnaise', category: 'Huiles, condiments & sauces' },
  { name: 'Ketchup', category: 'Huiles, condiments & sauces' },
  { name: 'Sauce soja', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Sauce tomate', category: 'Huiles, condiments & sauces' },
  { name: 'Concentré de tomate', category: 'Huiles, condiments & sauces' },
  { name: 'Tomates pelées', category: 'Huiles, condiments & sauces' },
  { name: 'Pesto', category: 'Huiles, condiments & sauces' },
  { name: 'Sauce piquante', category: 'Huiles, condiments & sauces' },
  { name: 'Nuoc-mâm', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Miel', category: 'Huiles, condiments & sauces' },
  { name: 'Olives', category: 'Huiles, condiments & sauces' },
  { name: 'Cornichons', category: 'Huiles, condiments & sauces' },
  { name: 'Câpres', category: 'Huiles, condiments & sauces' },
  { name: 'Bouillon de légumes', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Bouillon de volaille', unit: 'ml', category: 'Huiles, condiments & sauces' },
  { name: 'Bouillon de bœuf', unit: 'ml', category: 'Huiles, condiments & sauces' },

  // Noix & graines
  { name: 'Amandes', category: 'Noix & graines' },
  { name: 'Noix', category: 'Noix & graines' },
  { name: 'Noisettes', category: 'Noix & graines' },
  { name: 'Noix de cajou', category: 'Noix & graines' },
  { name: 'Cacahuètes', category: 'Noix & graines' },
  { name: 'Pignons de pin', category: 'Noix & graines' },
  { name: 'Pistaches', category: 'Noix & graines' },
  { name: 'Graines de sésame', category: 'Noix & graines' },
  { name: 'Graines de tournesol', category: 'Noix & graines' },
  { name: 'Graines de chia', category: 'Noix & graines' },
  { name: 'Graines de lin', category: 'Noix & graines' },
  { name: 'Beurre de cacahuète', category: 'Noix & graines' },
  { name: 'Tahini', category: 'Noix & graines' },

  // Sucres & pâtisserie
  { name: 'Sucre', category: 'Sucres & pâtisserie' },
  { name: 'Sucre glace', category: 'Sucres & pâtisserie' },
  { name: 'Sucre vanillé', category: 'Sucres & pâtisserie' },
  { name: 'Cassonade', category: 'Sucres & pâtisserie' },
  { name: 'Chocolat noir', category: 'Sucres & pâtisserie' },
  { name: 'Chocolat au lait', category: 'Sucres & pâtisserie' },
  { name: 'Cacao en poudre', category: 'Sucres & pâtisserie' },
  { name: 'Levure chimique', category: 'Sucres & pâtisserie' },
  { name: 'Levure de boulanger', category: 'Sucres & pâtisserie' },
  { name: 'Extrait de vanille', category: 'Sucres & pâtisserie' },
  { name: 'Pâte feuilletée', category: 'Sucres & pâtisserie' },
  { name: 'Pâte brisée', category: 'Sucres & pâtisserie' },
  { name: 'Confiture', category: 'Sucres & pâtisserie' },
  { name: 'Sirop d\'érable', unit: 'ml', category: 'Sucres & pâtisserie' },
  { name: 'Spéculoos', category: 'Sucres & pâtisserie' },

  // Épicerie & divers
  { name: 'Lait de coco', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Crème de coco', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Tofu', category: 'Épicerie & divers' },
  { name: 'Vin blanc', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Vin rouge', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Bière', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Rhum', unit: 'ml', category: 'Épicerie & divers' },
  { name: 'Pâte à pizza', category: 'Épicerie & divers' },
  { name: 'Levain', category: 'Épicerie & divers' },
  { name: 'Eau gazeuse', unit: 'ml', category: 'Épicerie & divers' },
];

// Insère les ingrédients par défaut sans toucher à ceux déjà présents.
// Retourne le nombre d'ingrédients réellement ajoutés.
export function seedDefaultIngredients(db) {
  const insert = db.prepare('INSERT OR IGNORE INTO ingredients (name, category, default_unit) VALUES (?, ?, ?)');
  let inserted = 0;
  db.exec('BEGIN');
  try {
    for (const { name, category, unit } of DEFAULT_INGREDIENTS) {
      inserted += insert.run(name, category, unit ?? 'g').changes;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return inserted;
}

// Corrige les unités par défaut des ingrédients déjà en base
// (utile pour les bases seedées avant l'introduction des unités).
export function applyDefaultUnits(db) {
  const update = db.prepare('UPDATE ingredients SET default_unit = ? WHERE name = ?');
  for (const { name, unit } of DEFAULT_INGREDIENTS) {
    if (unit) update.run(unit, name);
  }
}

// Pré-remplit la base uniquement si elle est vide (premier démarrage).
export function seedIfEmpty(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM ingredients').get();
  if (count === 0) {
    return seedDefaultIngredients(db);
  }
  return 0;
}
