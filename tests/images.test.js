import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { saveImage } from '../src/images.js';

// PNG 1x1 pixel
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-images-'));

describe('saveImage', () => {
  it('sauvegarde une image et renvoie son chemin public', () => {
    const dir = tmpDir();
    const url = saveImage(dir, 'kristian', `data:image/png;base64,${PNG_1PX}`);
    expect(url).toMatch(/^\/images\/user\/kristian-\d+\.png$/);
    const written = fs.readFileSync(path.join(dir, path.basename(url)));
    expect(written.length).toBeGreaterThan(0);
    expect(written.subarray(1, 4).toString()).toBe('PNG');
  });

  it('supporte jpeg, webp et gif', () => {
    const dir = tmpDir();
    expect(saveImage(dir, 'u', `data:image/jpeg;base64,${PNG_1PX}`)).toMatch(/\.jpg$/);
    expect(saveImage(dir, 'u', `data:image/webp;base64,${PNG_1PX}`)).toMatch(/\.webp$/);
    expect(saveImage(dir, 'u', `data:image/gif;base64,${PNG_1PX}`)).toMatch(/\.gif$/);
  });

  it('refuse les formats non image', () => {
    const dir = tmpDir();
    expect(() => saveImage(dir, 'u', `data:text/html;base64,${PNG_1PX}`)).toThrow('non supporté');
    expect(() => saveImage(dir, 'u', 'pas une data url')).toThrow('non supporté');
    expect(() => saveImage(dir, 'u', null)).toThrow('non supporté');
  });

  it('refuse une image vide', () => {
    const dir = tmpDir();
    expect(() => saveImage(dir, 'u', 'data:image/png;base64,')).toThrow();
  });

  it('refuse une image trop lourde', () => {
    const dir = tmpDir();
    const big = Buffer.alloc(5 * 1024 * 1024).toString('base64');
    expect(() => saveImage(dir, 'u', `data:image/png;base64,${big}`)).toThrow('trop lourde');
  });

  it('assainit le nom d\'utilisateur dans le nom de fichier', () => {
    const dir = tmpDir();
    const url = saveImage(dir, 'user;rm -rf', `data:image/png;base64,${PNG_1PX}`);
    expect(url).toMatch(/^\/images\/user\/user_rm_-rf-\d+\.png$/);
    expect(url).not.toContain(';');
    expect(url).not.toContain(' ');
  });
});
