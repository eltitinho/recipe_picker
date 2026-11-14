import fs from 'node:fs';
import path from 'node:path';

// Upload d'images sans dépendance : le frontend envoie une data URL (base64),
// on écrit le fichier dans <dataDir>/images et on renvoie son chemin public.

const MIME_TO_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_BYTES = 4 * 1024 * 1024; // 4 Mo

export function saveImage(imagesDir, username, dataUrl) {
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl ?? '');
  if (!match || !MIME_TO_EXT[match[1]]) {
    throw new Error('Format d\'image non supporté (png, jpg, webp, gif)');
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) {
    throw new Error('Image vide');
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error('Image trop lourde (4 Mo maximum)');
  }
  fs.mkdirSync(imagesDir, { recursive: true });
  const safeUser = username.replace(/[^a-z0-9_-]/gi, '_');
  const filename = `${safeUser}-${Date.now()}.${MIME_TO_EXT[match[1]]}`;
  fs.writeFileSync(path.join(imagesDir, filename), buffer);
  return `/images/user/${filename}`;
}
