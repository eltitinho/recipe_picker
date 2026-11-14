import { describe, it, expect, beforeEach } from 'vitest';
import { createUsersDb } from '../src/db.js';
import {
  hashPassword, verifyPassword, register, login,
  createToken, verifyToken,
} from '../src/auth.js';

const SECRET = 'test-secret';
let db;

beforeEach(() => {
  db = createUsersDb(':memory:');
});

describe('mots de passe', () => {
  it('hash et vérifie un mot de passe', () => {
    const hash = hashPassword('motdepasse');
    expect(hash).toMatch(/^scrypt:/);
    expect(verifyPassword('motdepasse', hash)).toBe(true);
    expect(verifyPassword('autre', hash)).toBe(false);
  });

  it('deux hash du même mot de passe sont différents (sel aléatoire)', () => {
    expect(hashPassword('abc123')).not.toBe(hashPassword('abc123'));
  });
});

describe('register / login', () => {
  it('inscrit un utilisateur et le connecte', () => {
    const user = register(db, 'Kristian', 'secret1');
    expect(user.username).toBe('kristian');
    expect(login(db, 'kristian', 'secret1')).toEqual({ username: 'kristian' });
  });

  it('normalise le nom en minuscules', () => {
    register(db, 'KRIS-tian_2', 'secret1');
    expect(login(db, 'kris-tian_2', 'secret1')).not.toBeNull();
  });

  it('refuse les noms invalides', () => {
    expect(() => register(db, 'a', 'secret1')).toThrow('utilisateur');
    expect(() => register(db, 'nom avec espaces', 'secret1')).toThrow('utilisateur');
    expect(() => register(db, '../etc', 'secret1')).toThrow('utilisateur');
  });

  it('refuse les mots de passe trop courts', () => {
    expect(() => register(db, 'kristian', '12345')).toThrow('mot de passe');
  });

  it('refuse les doublons', () => {
    register(db, 'kristian', 'secret1');
    expect(() => register(db, 'Kristian', 'secret2')).toThrow('déjà pris');
  });

  it('rejette un mauvais mot de passe ou un utilisateur inconnu', () => {
    register(db, 'kristian', 'secret1');
    expect(login(db, 'kristian', 'mauvais')).toBeNull();
    expect(login(db, 'inconnu', 'secret1')).toBeNull();
  });
});

describe('jetons de session', () => {
  it('crée et vérifie un jeton', () => {
    const token = createToken('kristian', SECRET);
    expect(verifyToken(token, SECRET)).toBe('kristian');
  });

  it('rejette un jeton signé avec un autre secret', () => {
    const token = createToken('kristian', SECRET);
    expect(verifyToken(token, 'autre-secret')).toBeNull();
  });

  it('rejette un jeton modifié', () => {
    const token = createToken('kristian', SECRET);
    const [payload] = token.split('.');
    const forged = `${Buffer.from(JSON.stringify({ u: 'admin', exp: Date.now() + 10000 })).toString('base64url')}.faux`;
    expect(verifyToken(forged, SECRET)).toBeNull();
    expect(verifyToken(payload, SECRET)).toBeNull();
    expect(verifyToken('nimportequoi', SECRET)).toBeNull();
  });

  it('rejette un jeton expiré', () => {
    const token = createToken('kristian', SECRET, -1000);
    expect(verifyToken(token, SECRET)).toBeNull();
  });
});
