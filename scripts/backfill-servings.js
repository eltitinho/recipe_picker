// Renseigne le nombre de portions (servings) des recettes importées de Marmiton
// en relisant le recipeYield du JSON-LD de chaque page recette.
// Usage : RECIPE_DATA_DIR=data node scripts/backfill-servings.js
import { createCatalogDb } from '../src/db.js';

const ALBUM_API = 'https://www.marmiton.org/reloaded/api/album-photo?albumid=1372292';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0';

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const catalog = createCatalogDb(`${dataDir}/app.db`);

const res = await fetch(ALBUM_API, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
if (!res.ok) throw new Error(`HTTP ${res.status} sur l'API album`);
const album = await res.json();

const update = catalog.prepare('UPDATE recipes SET servings = ? WHERE name = ?');
let updated = 0;

for (const photo of album._embedded.albumphoto) {
  const slug = photo.text?.match(/(recette_[a-z0-9-]+_\d+\.aspx)/)?.[1];
  if (!slug) continue;
  try {
    const page = await fetch(`https://www.marmiton.org/recettes/${slug}`, { headers: { 'User-Agent': UA } });
    const html = await page.text();
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const recipe = JSON.parse(match[1])['@graph'].find((x) => x['@type'] === 'Recipe');
    const servings = Number(String(recipe?.recipeYield ?? '').match(/\d+/)?.[0]);
    if (Number.isInteger(servings) && servings >= 1) {
      updated += update.run(servings, photo.title).changes;
      console.log(`${photo.title} → ${servings} pers.`);
    } else {
      console.log(`${photo.title} → portions introuvables, inchangé`);
    }
  } catch (err) {
    console.error(`❌ ${photo.title}: ${err.message}`);
  }
}

console.log(`\nPortions mises à jour : ${updated} recette(s)`);
