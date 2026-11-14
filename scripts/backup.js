// Sauvegarde toutes les bases (app.db, users.db, users/*.db)
// dans data/backups/<horodatage>/ via VACUUM INTO (cohérent à chaud).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.RECIPE_DATA_DIR || 'data';
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const backupDir = path.join(dataDir, 'backups', timestamp);

function backupDb(sourcePath, destName) {
  if (!fs.existsSync(sourcePath)) return false;
  const db = new DatabaseSync(sourcePath, { readOnly: true });
  db.exec(`VACUUM INTO '${path.join(backupDir, destName)}'`);
  db.close();
  return true;
}

fs.mkdirSync(path.join(backupDir, 'users'), { recursive: true });

let count = 0;
if (backupDb(path.join(dataDir, 'app.db'), 'app.db')) count++;
if (backupDb(path.join(dataDir, 'users.db'), 'users.db')) count++;

const usersDir = path.join(dataDir, 'users');
if (fs.existsSync(usersDir)) {
  for (const file of fs.readdirSync(usersDir).filter((f) => f.endsWith('.db'))) {
    if (backupDb(path.join(usersDir, file), path.join('users', file))) count++;
  }
}

if (count === 0) {
  console.error(`Aucune base trouvée dans ${dataDir}`);
  process.exit(1);
}
console.log(`Backup créé : ${backupDir} (${count} base${count > 1 ? 's' : ''})`);
