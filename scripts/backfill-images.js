// Renseigne image_url des recettes du catalogue à partir de l'album Marmiton.
// Idempotent : n'écrase pas une image déjà définie sauf --force.
// Usage : RECIPE_DATA_DIR=data node scripts/backfill-images.js [--force]
import { createCatalogDb } from '../src/db.js';

const ALBUM_API = 'https://www.marmiton.org/reloaded/api/album-photo?albumid=1372292';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0';
const FORCE = process.argv.includes('--force');

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const catalog = createCatalogDb(`${dataDir}/app.db`);

const res = await fetch(ALBUM_API, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
if (!res.ok) throw new Error(`HTTP ${res.status} sur l'API album`);
const album = await res.json();

const update = catalog.prepare(
  `UPDATE recipes SET image_url = ? WHERE name = ?${FORCE ? '' : ' AND image_url IS NULL'}`
);

let updated = 0;
for (const photo of album._embedded.albumphoto) {
  if (!photo.url) continue;
  updated += update.run(photo.url, photo.title).changes;
}

console.log(`Images mises à jour : ${updated}/${album._embedded.albumphoto.length} recettes de l'album${FORCE ? ' (--force)' : ''}`);
