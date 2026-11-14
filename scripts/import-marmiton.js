// Importe les 20 recettes d'un album Marmiton dans le catalogue.
// Usage : node scripts/import-marmiton.js [--dry-run] [--limit N]
//   RECIPE_DATA_DIR=data (défaut) ; --dry-run affiche sans insérer.
import { createCatalogDb } from '../src/db.js';
import { addIngredient, listIngredients } from '../src/ingredients.js';
import { addRecipe } from '../src/recipes.js';

const ALBUM_API = 'https://www.marmiton.org/reloaded/api/album-photo?albumid=1372292';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0';

const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

// --- Normalisation ---

const normalize = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
  .replace(/[’']/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const stripQualifiers = (s) => s
  .replace(/\b(de qualite|bio|frais|fraiche|tendre|rape|hache|pele|surgel[ee]s?|en conserve|sec|sechee?s?|fume[ee]s?|entier|entiere|maigre|facultatif|optionnel|au gout|a votre gout|selon gout|environ)\b/g, ' ')
  .replace(/\b(pour\s+(deux|trois|quatre|cinq|six|\d+))\b/g, ' ')
  .replace(/\s+/g, ' ').trim();

// --- Catégories / unités par mots-clés ---

const CATEGORY_KEYWORDS = [
  ['Viandes & charcuterie', ['poulet', 'volaille', 'jambon', 'boeuf', 'porc', 'veau', 'agneau', 'lardon', 'bacon', 'chorizo', 'saucisse', 'steak', 'dinde', 'canard', 'merguez', 'viande', 'blanc', 'escalope', 'filet de poulet', 'poitrine']],
  ['Poissons & fruits de mer', ['saumon', 'thon', 'cabillaud', 'crevette', 'merlu', 'colin', 'truite', 'anchois', 'sardine', 'maquereau', 'moule', 'calamar', 'lieu', 'eglefin', 'poisson']],
  ['Légumes', ['tomate', 'oignon', 'echalote', 'ail', 'carotte', 'courgette', 'poivron', 'poireau', 'champignon', 'epinard', 'salade', 'courge', 'butternut', 'pomme de terre', 'fenouil', 'haricot vert', 'avocat', 'concombre', 'brocoli', 'chou', 'navet', 'betterave', 'celeri', 'artichaut', 'asperge', 'endive', 'mais', 'petit pois']],
  ['Fruits', ['citron', 'pomme', 'banane', 'ananas', 'orange', 'poire', 'fraise', 'framboise', 'raisin', 'mangue', 'kiwi', 'abricot', 'peche']],
  ['Légumineuses', ['lentille', 'pois chiche', 'haricot rouge', 'haricot blanc', 'haricot noir', 'feve', 'pois casse', 'flageolet']],
  ['Féculents & céréales', ['spaghetti', 'tagliatelle', 'penne', 'farine', 'lasagne', 'gnocchi', 'nouille', 'riz', 'semoule', 'boulgour', 'quinoa', 'polenta', 'pate brisee', 'pate feuilletee', 'pain', 'tortilla', 'chapelure', 'coudes', 'torti', 'fusilli', 'pates']],
  ['Produits laitiers & œufs', ['creme fraiche', 'creme liquide', 'gruyere', 'emmental', 'parmesan', 'mozzarella', 'chevre', 'camembert', 'mascarpone', 'ricotta', 'comte', 'reblochon', 'fromage', 'bechamel', 'beurre', 'cheddar', 'yaourt', 'oeuf', 'lait', 'toastinette', 'roquefort', 'feta']],
  ['Herbes, épices & aromates', ['muscade', 'cumin', 'curry', 'paprika', 'thym', 'laurier', 'persil', 'basilic', 'ciboulette', 'estragon', 'cannelle', 'gingembre', 'curcuma', 'piment', 'safran', 'herbe', 'sel', 'poivre', 'coriandre', 'menthe', 'aneth', 'romarin', 'origan', 'clou de girofle', 'cardamome']],
  ['Huiles, condiments & sauces', ['huile', 'vinaigre', 'moutarde', 'miel', 'sauce soja', 'sauce tomate', 'concentre de tomate', 'bouillon', 'mayonnaise', 'ketchup', 'olive', 'capre', 'pesto', 'nuoc mam', 'cornichon', 'tomate pelee']],
  ['Noix & graines', ['amande', 'noisette', 'pignon', 'pistache', 'cacahuete', 'sesame', 'noix']],
  ['Sucres & pâtisserie', ['sucre', 'chocolat', 'cacao', 'vanille', 'levure', 'confiture', 'sirop']],
  ['Épicerie & divers', ['lait de coco', 'creme de coco', 'tofu', 'vin blanc', 'vin rouge', 'biere', 'rhum', 'pastis', 'eau']],
];

const ML_KEYWORDS = ['lait', 'creme', 'huile', 'vinaigre', 'vin', 'biere', 'rhum', 'jus', 'sauce', 'bouillon', 'sirop', 'eau'];
const PIECE_KEYWORDS = ['oeuf'];

function guessCategory(name) {
  const n = normalize(name);
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    for (const kw of keywords.sort((a, b) => b.length - a.length)) {
      if (n.includes(kw)) return category;
    }
  }
  return 'Autre';
}

function guessUnit(name) {
  const n = normalize(name);
  if (PIECE_KEYWORDS.some((k) => n.includes(k))) return 'pièce';
  if (ML_KEYWORDS.some((k) => n.includes(k))) return 'ml';
  return 'g';
}

// --- Parsing des ingrédients Marmiton ---

const UNIT_CONVERSIONS = [
  [/^(kg|kilo)s?\b/, 1000, 'weight'],
  [/^(g|gr|gramme)s?\b/, 1, 'weight'],
  [/^mg\b/, 0.001, 'weight'],
  [/^litres?\b|^l\b/, 1000, 'volume'],
  [/^dl\b/, 100, 'volume'],
  [/^cl\b/, 10, 'volume'],
  [/^ml\b/, 1, 'volume'],
  [/^(cuillere?s? a soupe|c\. ?a ?s\.?)\b/, 15, 'spoon'],
  [/^(cuillere?s? a cafe|c\. ?a ?c\.?)\b/, 5, 'spoon'],
  [/^pincee?s?\b/, 1, 'weight'],
  [/^poignee?s?\b/, 30, 'weight'],
  [/^tranches?\b/, 25, 'weight'],
  [/^gousses?\b/, 10, 'weight'],
  [/^(boites?|sachets?|paquets?|bocaux?|pots?)\b/, null, 'container'],
];

// flat : minuscules sans accents, mais conserve les points/virgules des nombres
const flat = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
  .replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();

// Cas particuliers français : alias vers un ingrédient du catalogue
const ALIASES = {
  'noix de beurre': 'beurre',
  'noisette de beurre': 'beurre',
  'noisettes de beurre': 'beurre',
};

// Préfixes contenants à retirer du nom (la quantité devient alors inconnue)
const CONTAINER_PREFIX = /^(louches|tasses|verres|boites?|barquettes|briques|pots?|paquets?|sachets?|bocaux?|plaques|cubes|fines tranches|gros pots|petits pots|pointes)\s+(?:de\s+|d\s+)?/;

function parseIngredientText(text) {
  // Fractions ("1/2 kg") → décimal
  const f = flat(text.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => String(Number(a) / Number(b))));

  // Quantité au milieu : "courge butternut de 1/2 kg environ"
  const mid = f.match(/^([a-z].+?)\s+(?:de|du|des)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|mg|ml|cl|dl|l)\b/);
  if (mid) {
    const factors = { kg: 1000, g: 1, mg: 0.001, ml: 1, cl: 10, dl: 100, l: 1000 };
    const kind = ['ml', 'cl', 'dl', 'l'].includes(mid[3]) ? 'volume' : 'weight';
    return { name: mid[1], quantity: parseFloat(mid[2].replace(',', '.')), factor: factors[mid[3]], kind };
  }

  const m = f.match(/^(\d+(?:[.,]\d+)?)(?:\s+(.*))?$/);
  if (!m) return { name: f, quantity: null };
  const qty = parseFloat(m[1].replace(',', '.'));
  let rest = (m[2] ?? '').trim();

  for (const [re, factor, kind] of UNIT_CONVERSIONS) {
    const um = rest.match(re);
    if (um) {
      rest = rest.slice(um[0].length).replace(/^\s*(de|du|des)\s+/, '').trim();
      if (kind === 'container') return { name: rest || f, quantity: null };
      return { name: rest || f, quantity: qty, factor, kind };
    }
  }
  // Nombre seul : "4 œufs", "5 poireaux" → unité pièce implicite.
  // Mais si le nom contient un poids/volume ("1/2 courge butternut de 1,2 kg"), on le préfère.
  rest = rest.replace(/^(de|du|des)\s+/, '').trim();
  const inner = rest.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|ml|cl|dl|l)\b/);
  if (inner) {
    const factors = { kg: 1000, g: 1, mg: 0.001, ml: 1, cl: 10, dl: 100, l: 1000 };
    const kind = ['ml', 'cl', 'dl', 'l'].includes(inner[2]) ? 'volume' : 'weight';
    const name = rest.slice(0, inner.index).trim() || rest;
    return { name, quantity: parseFloat(inner[1].replace(',', '.')), factor: factors[inner[2]], kind };
  }
  return { name: rest || f, quantity: qty, factor: 1, kind: 'piece' };
}

// Nettoie un nom d'ingrédient : article élidé, parenthèses, contenants
function cleanName(name) {
  let n = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  n = n.replace(/^d\s+/, '');
  let container = false;
  const m = n.match(CONTAINER_PREFIX);
  if (m) {
    n = n.slice(m[0].length).trim();
    container = true;
  }
  n = n.replace(/^de\s+/, '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  return { name: n || name, container };
}

// --- Matching catalogue ---

function buildMatcher(catalogIngredients) {
  const byNorm = new Map();
  for (const ing of catalogIngredients) {
    byNorm.set(normalize(ing.name), ing);
  }
  const sing = (s) => s.split(' ').map((w) => w.replace(/sx?$/, '')).join(' ').trim();
  const find = (rawName) => {
    const aliased = ALIASES[normalize(rawName)] ?? rawName;
    const candidates = [normalize(aliased), stripQualifiers(normalize(aliased))];
    for (const c of candidates) {
      if (!c) continue;
      if (byNorm.has(c)) return byNorm.get(c);
      // singulier/pluriel
      if (byNorm.has(sing(c))) return byNorm.get(sing(c));
      if (byNorm.has(c + 's')) return byNorm.get(c + 's');
    }
    // Match par inclusion : priorité au début du nom (nom principal),
    // puis au plus long. Compare aussi les formes singulières.
    let best = null;
    const allCandidates = [...new Set([...candidates, ...candidates.map(sing)])].filter(Boolean);
    for (const c of allCandidates) {
      if (c.length < 4) continue;
      for (const [norm, ing] of byNorm) {
        if (norm.length < 4) continue; // évite les faux positifs ("ail", "sel")
        const ns = sing(norm);
        const wordBoundary = (hay, needle) => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay);
        let score = 0;
        if (c.startsWith(ns) || c.startsWith(norm)) score = 1000 + norm.length;
        else if (norm.startsWith(c)) score = 500 + c.length;
        else if (wordBoundary(c, ns) || wordBoundary(c, norm)) score = norm.length;
        if (score > (best?.score ?? 0)) best = { score, ing };
      }
    }
    return best?.ing ?? null;
  };
  return { find, byNorm };
}

// --- Devine l'action d'une étape ---

function guessAction(text) {
  const t = normalize(text);
  if (/\b(four|gratin|rotir|grill|prechauff|enfourne)/.test(t)) return 'bake';
  if (/\b(laisse(r|z)? (reposer|refroidir|lever)|marine[zr]?|attend|reserve[zr]?|refroidir)/.test(t)) return 'wait';
  if (/\b(servir|servez|dresse[zr]?|demoule[zr]?|deguster|decore[zr]?)/.test(t)) return 'serve';
  if (/\b(melange[zr]?|mixer|mixe[zr]?|incorpore[zr]?|fouette[zr]?|bat(tre|tez)|assaisonne[zr]?|verse[zr]?|remue[zr]?|emulsionne[zr]?)/.test(t)) return 'mix';
  if (/\b(cuire|cuisson|bouillir|poele|casserole|mijote[zr]?|frire|saisir|chauffe[zr]?|fremir|dore[zr]?|revenir|grille[zr]?|fricassee)/.test(t)) return 'cook';
  return 'prepare';
}

// --- Fetch + parse d'une recette ---

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return res.json();
}

async function fetchRecipe(recipeUrl) {
  const res = await fetch(recipeUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${recipeUrl}`);
  const html = await res.text();
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('JSON-LD introuvable');
  const graph = JSON.parse(match[1])['@graph'];
  const recipe = graph.find((x) => x['@type'] === 'Recipe');
  if (!recipe) throw new Error('Objet Recipe introuvable');
  return recipe;
}

// --- Main ---

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const catalog = createCatalogDb(`${dataDir}/app.db`);

const album = await fetchJson(ALBUM_API);
const photos = album._embedded.albumphoto.sort((a, b) => a.order - b.order);
const recipeRefs = photos.map((p) => ({
  title: p.title,
  imageUrl: p.url ?? null,
  url: `https://www.marmiton.org/recettes/${p.text.match(/(recette_[a-z0-9-]+_\d+\.aspx)/)?.[1]}`,
})).filter((r) => r.url && !r.url.endsWith('undefined'));

console.log(`${recipeRefs.length} recettes trouvées dans l'album${DRY_RUN ? ' (DRY RUN)' : ''}`);

let matcher = buildMatcher(listIngredients(catalog));
let imported = 0;
let skipped = 0;

for (const ref of recipeRefs.slice(0, LIMIT)) {
  if (catalog.prepare('SELECT id FROM recipes WHERE name = ?').get(ref.title)) {
    console.log(`⏭️  ${ref.title} (déjà présente)`);
    skipped++;
    continue;
  }
  try {
    const marmiton = await fetchRecipe(ref.url);
    const parsedIngredients = (marmiton.recipeIngredient ?? []).map((text) => {
      const parsed = parseIngredientText(text);
      const cleaned = cleanName(parsed.name);
      parsed.name = cleaned.name;
      if (cleaned.container) parsed.quantity = null;
      return parsed;
    });

    const ingredients = [];
    const newIngredients = [];
    for (const parsed of parsedIngredients) {
      let ing = matcher.find(parsed.name);
      if (!ing) {
        const category = guessCategory(parsed.name);
        const unit = guessUnit(parsed.name);
        if (DRY_RUN) {
          ing = { id: `NEW:${parsed.name}`, defaultUnit: unit };
          newIngredients.push(`    + NOUVEAU: ${parsed.name} [${category}, ${unit}]`);
        } else {
          ing = addIngredient(catalog, parsed.name.replace(/\b\w/g, (c) => c.toUpperCase()), category, unit);
          matcher = buildMatcher(listIngredients(catalog));
          newIngredients.push(`    + créé: ${ing.name} [${category}, ${unit}]`);
        }
      }
      let quantity = null;
      if (parsed.quantity != null && parsed.factor != null) {
        quantity = Math.round(parsed.quantity * parsed.factor * 10) / 10;
      }
      // Nombre seul ("4 œufs") : quantité conservée seulement si l'unité est "pièce"
      if (parsed.kind === 'piece' && ing.defaultUnit !== 'pièce') {
        quantity = null;
      }
      ingredients.push({ id: ing.id, quantity, _norm: normalize(ing.name ?? parsed.name), _debug: `${parsed.name} → ${ing.name ?? ing.id} ${quantity ?? '-'} ${ing.defaultUnit}` });
    }

    const steps = (marmiton.recipeInstructions ?? []).map((s) => {
      const text = (s.text ?? '').trim().replace(/\s+/g, ' ');
      return { action: guessAction(text), utensil: null, description: text, ingredientIds: [] };
    });

    // Liaison étapes ↔ ingrédients par mention du nom dans le texte
    for (const step of steps) {
      const normText = normalize(step.description);
      step.ingredientIds = ingredients
        .filter((ing) => ing._norm && ing._norm.length > 3 && normText.includes(ing._norm))
        .map((ing) => ing.id);
    }

    console.log(`\n🍽️  ${ref.title}`);
    for (const line of newIngredients) console.log(line);
    for (const d of ingredients) console.log(`    - ${d._debug}`);
    for (const [i, s] of steps.entries()) console.log(`    ${i + 1}. [${s.action}] ${s.description.slice(0, 90)}${s.description.length > 90 ? '…' : ''}`);

    if (!DRY_RUN) {
      addRecipe(catalog, { name: ref.title, ingredients, steps, imageUrl: ref.imageUrl });
      imported++;
    }
  } catch (err) {
    console.error(`❌ ${ref.title}: ${err.message}`);
  }
}

console.log(`\n✅ ${DRY_RUN ? 'Aperçu terminé' : `Import terminé : ${imported} importées, ${skipped} ignorées`}`);
