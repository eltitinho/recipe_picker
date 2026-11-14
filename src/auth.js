import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

const USERNAME_RE = /^[a-z0-9_-]{2,20}$/;
const SESSION_MAX_AGE_MS = 30 * 24 * 3600 * 1000; // 30 jours

// --- Mots de passe (scrypt, natif Node) ---

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = (stored ?? '').split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// --- Comptes ---

export function register(usersDb, username, password) {
  const name = (username ?? '').trim().toLowerCase();
  if (!USERNAME_RE.test(name)) {
    throw new Error('Le nom d\'utilisateur doit faire 2 à 20 caractères (a-z, 0-9, - et _ uniquement)');
  }
  if ((password ?? '').length < 6) {
    throw new Error('Le mot de passe doit faire au moins 6 caractères');
  }
  try {
    usersDb.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(name, hashPassword(password));
    return { username: name };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Le nom d'utilisateur "${name}" est déjà pris`);
    }
    throw err;
  }
}

export function login(usersDb, username, password) {
  const name = (username ?? '').trim().toLowerCase();
  const user = usersDb.prepare('SELECT username, password_hash FROM users WHERE username = ?').get(name);
  if (!user || !verifyPassword(password ?? '', user.password_hash)) {
    return null;
  }
  return { username: user.username };
}

// --- Jetons de session (cookie signé HMAC, stateless) ---

export function createToken(username, secret, maxAgeMs = SESSION_MAX_AGE_MS) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + maxAgeMs })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token, secret) {
  const [payload, sig] = (token ?? '').split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.u || data.exp < Date.now()) return null;
    return data.u;
  } catch {
    return null;
  }
}

// --- Cookie ---

export const SESSION_COOKIE = 'rp_session';

export function readSession(req, secret) {
  const cookies = req.headers.cookie ?? '';
  const match = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return verifyToken(decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)), secret);
}

export function sessionCookieHeader(username, secret) {
  const token = createToken(username, secret);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}`;
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
