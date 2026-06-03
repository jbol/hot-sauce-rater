/**
 * Hot Sauce Passport — Backend Server
 *
 * Built entirely on Node.js built-in modules (Node 22+):
 *   - node:http      — HTTP server
 *   - node:sqlite    — Database (built-in since Node 22.5)
 *   - node:crypto    — scrypt password hashing + HMAC-SHA256 tokens
 *
 * Zero external runtime dependencies.
 */

import { createServer } from 'node:http';
import { readFile, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from './auth.js';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const DIST_DIR = resolve(__dirname, '..', 'dist');
const IS_PROD = process.env.NODE_ENV === 'production' || existsSync(DIST_DIR);

const PORT = process.env.PORT || 3001;
// In production, same-origin requests don't need CORS.
// In dev, Vite runs on :5173 so we allow that origin.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ── Static file serving (production only) ───────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

function serveStatic(pathname, res) {
  // Map "/" to index.html
  const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = resolve(DIST_DIR, relPath);

  // Security: prevent path traversal outside dist/
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403); res.end(); return;
  }

  if (existsSync(filePath)) {
    const mime = MIME[extname(filePath)] || 'application/octet-stream';
    readFile(filePath, (err, data) => {
      if (err) { res.writeHead(500); res.end(); return; }
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    });
  } else {
    // SPA fallback — let React Router handle the route
    const indexPath = join(DIST_DIR, 'index.html');
    readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found. If this is a fresh deploy, run: pnpm build');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  }
}

// ── In-memory rate limiter ───────────────────────────────────────────────────
// Keyed by "purpose:ip" → { count, resetAt }
const rateLimitStore = new Map();

function rateLimit(key, windowMs, max) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// Prune stale entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore) {
    if (now > v.resetAt) rateLimitStore.delete(k);
  }
}, 60_000);

// ── Request helpers ──────────────────────────────────────────────────────────
function parseCookies(req) {
  const cookies = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k.trim()) cookies[k.trim()] = decodeURIComponent(v.join('='));
  }
  return cookies;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 10_240) { req.destroy(); reject(new Error('Request body too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ── Response helpers ─────────────────────────────────────────────────────────
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const COOKIE_MAX_AGE = 7 * 24 * 3600; // 7 days in seconds
const SECURE_FLAG = process.env.NODE_ENV === 'production' ? '; Secure' : '';

function setAuthCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; Path=/${SECURE_FLAG}`
  );
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/');
}

// ── Auth guard ───────────────────────────────────────────────────────────────
function requireAuth(cookies, res) {
  const token = cookies.token;
  if (!token) {
    json(res, 401, { error: 'Authentication required' });
    return null;
  }
  try {
    return verifyToken(token);
  } catch {
    clearAuthCookie(res);
    json(res, 401, { error: 'Session expired. Please log in again.' });
    return null;
  }
}

// ── Validation ───────────────────────────────────────────────────────────────
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isStrongPassword = (v) =>
  typeof v === 'string' && v.length >= 8 && /[A-Za-z]/.test(v) && /[0-9]/.test(v);
const isName = (v) => typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= 100;

// ── Route handlers ────────────────────────────────────────────────────────────

// POST /api/auth/register
async function registerHandler(req, res, _cookies) {
  const ip = req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(`auth:${ip}`, 15 * 60_000, 20)) {
    return json(res, 429, { error: 'Too many attempts. Please wait 15 minutes.' });
  }

  let body;
  try { body = await readBody(req); }
  catch (e) { return json(res, 400, { error: e.message }); }

  const { email, password, name } = body;

  if (!isEmail(email)) return json(res, 400, { error: 'A valid email address is required' });
  if (!isStrongPassword(password))
    return json(res, 400, { error: 'Password must be ≥8 characters and contain a letter and a number' });
  if (!isName(name)) return json(res, 400, { error: 'Name is required (max 100 characters)' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (existing) return json(res, 409, { error: 'An account with this email already exists' });

  const passwordHash = await hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(email.toLowerCase(), passwordHash, name.trim());

  const token = signToken({ userId: result.lastInsertRowid });
  setAuthCookie(res, token);
  json(res, 201, { user: { id: result.lastInsertRowid, email: email.toLowerCase(), name: name.trim() } });
}

// POST /api/auth/login
async function loginHandler(req, res, _cookies) {
  const ip = req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(`auth:${ip}`, 15 * 60_000, 20)) {
    return json(res, 429, { error: 'Too many attempts. Please wait 15 minutes.' });
  }

  let body;
  try { body = await readBody(req); }
  catch (e) { return json(res, 400, { error: e.message }); }

  const { email, password } = body;

  if (!isEmail(email)) return json(res, 400, { error: 'A valid email address is required' });
  if (!password) return json(res, 400, { error: 'Password is required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);

  // Always run verifyPassword even when user not found — prevents timing-based
  // enumeration attacks that could reveal registered emails.
  const DUMMY_HASH = '00000000000000000000000000000000:' + '0'.repeat(128);
  const match = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);

  if (!user || !match) return json(res, 401, { error: 'Invalid email or password' });

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);
  json(res, 200, { user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at } });
}

// POST /api/auth/logout
function logoutHandler(_req, res, _cookies) {
  clearAuthCookie(res);
  json(res, 200, { message: 'Logged out successfully' });
}

// GET /api/auth/me
function meHandler(_req, res, cookies) {
  const payload = requireAuth(cookies, res);
  if (!payload) return;

  const user = db
    .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
    .get(payload.userId);

  if (!user) {
    clearAuthCookie(res);
    return json(res, 404, { error: 'User not found' });
  }
  json(res, 200, { user });
}

// GET /api/sauces/user-data
function userDataHandler(_req, res, cookies) {
  const payload = requireAuth(cookies, res);
  if (!payload) return;

  const ratingsRows = db
    .prepare('SELECT sauce_id, rating, rated_at FROM ratings WHERE user_id = ? ORDER BY rated_at DESC')
    .all(payload.userId);
  const favRows = db
    .prepare('SELECT sauce_id FROM favorites WHERE user_id = ?')
    .all(payload.userId);

  const ratings = {};
  for (const r of ratingsRows) {
    ratings[r.sauce_id] = { rating: r.rating, ratedAt: r.rated_at };
  }
  json(res, 200, { ratings, favorites: favRows.map((f) => f.sauce_id) });
}

// POST /api/sauces/rate
async function rateHandler(req, res, cookies) {
  const payload = requireAuth(cookies, res);
  if (!payload) return;

  let body;
  try { body = await readBody(req); }
  catch (e) { return json(res, 400, { error: e.message }); }

  const { sauceId, rating } = body;
  if (!Number.isInteger(sauceId) || sauceId < 1) return json(res, 400, { error: 'Invalid sauce ID' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return json(res, 400, { error: 'Rating must be between 1 and 5' });

  db.prepare(`
    INSERT INTO ratings (user_id, sauce_id, rating) VALUES (?, ?, ?)
    ON CONFLICT(user_id, sauce_id)
    DO UPDATE SET rating = excluded.rating, rated_at = CURRENT_TIMESTAMP
  `).run(payload.userId, sauceId, rating);

  json(res, 200, { success: true, sauceId, rating });
}

// POST /api/sauces/favorite
async function favoriteHandler(req, res, cookies) {
  const payload = requireAuth(cookies, res);
  if (!payload) return;

  let body;
  try { body = await readBody(req); }
  catch (e) { return json(res, 400, { error: e.message }); }

  const { sauceId } = body;
  if (!Number.isInteger(sauceId) || sauceId < 1) return json(res, 400, { error: 'Invalid sauce ID' });

  const existing = db
    .prepare('SELECT id FROM favorites WHERE user_id = ? AND sauce_id = ?')
    .get(payload.userId, sauceId);

  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND sauce_id = ?').run(payload.userId, sauceId);
    json(res, 200, { favorited: false });
  } else {
    db.prepare('INSERT INTO favorites (user_id, sauce_id) VALUES (?, ?)').run(payload.userId, sauceId);
    json(res, 200, { favorited: true });
  }
}

// ── Route table ──────────────────────────────────────────────────────────────
const ROUTES = [
  ['POST', '/api/auth/register',     registerHandler],
  ['POST', '/api/auth/login',        loginHandler],
  ['POST', '/api/auth/logout',       logoutHandler],
  ['GET',  '/api/auth/me',           meHandler],
  ['GET',  '/api/sauces/user-data',  userDataHandler],
  ['POST', '/api/sauces/rate',       rateHandler],
  ['POST', '/api/sauces/favorite',   favoriteHandler],
];

// ── Main request dispatcher ──────────────────────────────────────────────────
async function dispatch(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  // ── API routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // CORS headers (needed in dev where Vite runs on a different port)
    res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const cookies = parseCookies(req);
    const route = ROUTES.find(([m, p]) => m === req.method && p === pathname);

    if (!route) return json(res, 404, { error: 'Not found' });

    try {
      await route[2](req, res, cookies);
    } catch (err) {
      console.error(`Error in ${req.method} ${pathname}:`, err);
      json(res, 500, { error: 'Internal server error' });
    }
    return;
  }

  // ── Static files (production: serves built Vite frontend) ───────────────
  if (IS_PROD) {
    serveStatic(pathname, res);
  } else {
    // In development, tell the user to use the Vite dev server
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Dev mode: use the Vite server on :5173 for the frontend');
  }
}

// ── Start ────────────────────────────────────────────────────────────────────
const server = createServer(dispatch);
server.listen(PORT, () => {
  const mode = IS_PROD ? 'production' : 'development';
  console.log(`🔥 Hot Sauce Passport [${mode}] → http://localhost:${PORT}`);
  if (IS_PROD) console.log(`   Serving frontend from: ${DIST_DIR}`);
});
