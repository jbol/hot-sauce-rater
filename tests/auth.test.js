// Unit tests for the zero-dependency crypto helpers: scrypt password hashing
// and HMAC-SHA256 token signing/verification.

import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../server/auth.js';

test('password hash → verify round trip', async () => {
  const stored = await hashPassword('flamenco22');
  assert.match(stored, /^[0-9a-f]{32}:[0-9a-f]{128}$/, 'stored as salt:derivedKey hex');
  assert.equal(await verifyPassword('flamenco22', stored), true);
  assert.equal(await verifyPassword('flamenco23', stored), false);
});

test('same password hashes differently per salt', async () => {
  const a = await hashPassword('flamenco22');
  const b = await hashPassword('flamenco22');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('flamenco22', a), true);
  assert.equal(await verifyPassword('flamenco22', b), true);
});

test('verifyPassword tolerates malformed stored values', async () => {
  assert.equal(await verifyPassword('x', 'no-colon-here'), false);
  assert.equal(await verifyPassword('x', 'salt:not-hex-!!'), false);
});

test('token sign → verify round trip', () => {
  const token = signToken({ userId: 42 });
  const payload = verifyToken(token);
  assert.equal(payload.userId, 42);
  assert.equal(payload.iss, 'hot-sauce-passport');
  assert.ok(payload.exp > Math.floor(Date.now() / 1000), 'expiry in the future');
});

test('expired tokens are rejected', () => {
  const token = signToken({ userId: 1 }, -10);
  assert.throws(() => verifyToken(token), /expired/i);
});

test('tampered tokens are rejected', () => {
  const token = signToken({ userId: 1 });

  // Flip a character in the MIDDLE of the signature. (Not the last one: the
  // final base64url char of a 32-byte MAC carries only 4 meaningful bits, so
  // e.g. 'A'→'B' can decode to identical bytes and correctly verify.)
  const i = token.length - 10;
  const flipped = token.slice(0, i) + (token[i] === 'A' ? 'B' : 'A') + token.slice(i + 1);
  assert.throws(() => verifyToken(flipped));

  // swap in a forged payload with a valid structure
  const [header, , sig] = token.split('.');
  const forgedBody = Buffer.from(JSON.stringify({ userId: 999 })).toString('base64url');
  assert.throws(() => verifyToken(`${header}.${forgedBody}.${sig}`));

  assert.throws(() => verifyToken('not.a.token.at.all'));
  assert.throws(() => verifyToken(12345));
});
