// Pure Node.js crypto — no external packages
// - scrypt for password hashing (memory-hard, NIST-approved)
// - HMAC-SHA256 for signed tokens
// - timingSafeEqual to prevent timing attacks

import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('⚠️  Using default token secret. Set JWT_SECRET before deploying to production.');
  return 'dev-secret-hot-sauce-passport-change-in-production-2024';
})();

// ── Password hashing with scrypt ─────────────────────────────────────────────
// scrypt is a memory-hard KDF designed specifically for password storage.
// It stores as "salt:derivedKey" — both as hex strings.

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');        // 16 random bytes = 32 hex chars
  const derived = await scryptAsync(password, salt, 64); // 64-byte key
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const colonIdx = stored.indexOf(':');
  if (colonIdx === -1) return false;
  const salt = stored.slice(0, colonIdx);
  const storedHex = stored.slice(colonIdx + 1);

  try {
    const derived = await scryptAsync(password, salt, 64);
    const storedBuf = Buffer.from(storedHex, 'hex');
    // timingSafeEqual prevents timing-based attacks
    return derived.length === storedBuf.length && timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

// ── Token signing with HMAC-SHA256 ───────────────────────────────────────────
// Format: base64url(header).base64url(payload).HMAC-SHA256-signature
// Compatible with JWT structure but implemented with zero dependencies.

export function signToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iss: 'hot-sauce-passport',
  })).toString('base64url');
  const data = `${header}.${body}`;
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string') throw new Error('Token must be a string');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  const [header, body, sig] = parts;
  const data = `${header}.${body}`;

  // Constant-time signature verification
  const expectedSig = createHmac('sha256', SECRET).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig, 'base64url');
  const expBuf = Buffer.from(expectedSig, 'base64url');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token has expired');
  }

  return payload;
}
