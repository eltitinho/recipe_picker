// Catalogue fixe des actions possibles pour une étape de recette.
// Le détail fin (beurrer, émincer, à feu doux...) va dans le champ libre de l'étape.
export const STEP_ACTIONS = [
  { key: 'prepare', emoji: '🔪', label: 'Préparer' },
  { key: 'mix', emoji: '🥣', label: 'Mélanger' },
  { key: 'cook', emoji: '🍳', label: 'Cuire' },
  { key: 'bake', emoji: '🔥', label: 'Cuire au four' },
  { key: 'wait', emoji: '⏲️', label: 'Attendre' },
  { key: 'serve', emoji: '🍽️', label: 'Servir' },
];

export const UTENSILS = [
  'Poêle',
  'Casserole',
  'Air Fryer',
  'Marmite',
  'Cocotte',
  'Wok',
  'Four',
  'Plat à gratin',
  'Planche à découper',
  'Couteau',
  'Économe',
  'Râpe',
  'Passoire',
  'Saladier',
  'Fouet',
  'Spatule',
  'Mixeur',
  'Presse-ail',
  'Balance',
  'Verre doseur',
];

export function isValidAction(key) {
  return STEP_ACTIONS.some((a) => a.key === key);
}

export function isValidUtensil(utensil) {
  return UTENSILS.includes(utensil);
}
