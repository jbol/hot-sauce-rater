// End-to-end API tests against the real server + a throwaway SQLite database.
// Covers auth, entries CRUD, validation bounds, the canonical mild→inferno
// ordering, and per-user isolation.

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, makeClient } from './helpers.js';

let server;
let base;
let alice;   // main authed client
let bob;     // second user, for isolation tests
let anon;    // never authenticated

before(async () => {
  ({ server, base } = await startTestServer());
  alice = makeClient(base);
  bob = makeClient(base);
  anon = makeClient(base);
});

after(() => server.close());

test('register rejects invalid input', async () => {
  const badEmail = await alice.post('/api/auth/register', { email: 'not-an-email', password: 'flamenco22', name: 'X' });
  assert.equal(badEmail.status, 400);

  const weakPassword = await alice.post('/api/auth/register', { email: 'weak@test.es', password: 'short', name: 'X' });
  assert.equal(weakPassword.status, 400);
});

test('register → me → logout → login round trip', async () => {
  const reg = await alice.post('/api/auth/register', { email: 'alice@test.es', password: 'flamenco22', name: 'Alice' });
  assert.equal(reg.status, 201);
  assert.equal(reg.json.user.email, 'alice@test.es');
  assert.ok(reg.json.user.created_at, 'register returns created_at');

  const me = await alice.get('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.json.user.name, 'Alice');

  const dup = await bob.post('/api/auth/register', { email: 'ALICE@test.es', password: 'flamenco22', name: 'Impostor' });
  assert.equal(dup.status, 409, 'duplicate email is case-insensitive');

  await alice.post('/api/auth/logout');
  assert.equal((await alice.get('/api/auth/me')).status, 401);

  const badLogin = await alice.post('/api/auth/login', { email: 'alice@test.es', password: 'wrong-password-1' });
  assert.equal(badLogin.status, 401);

  const login = await alice.post('/api/auth/login', { email: 'alice@test.es', password: 'flamenco22' });
  assert.equal(login.status, 200);
  assert.equal((await alice.get('/api/auth/me')).status, 200);
});

test('entries endpoints require authentication', async () => {
  assert.equal((await anon.get('/api/entries')).status, 401);
  assert.equal((await anon.post('/api/entries', { name: 'X', heat: 5 })).status, 401);
  assert.equal((await anon.put('/api/entries/1', { name: 'X', heat: 5 })).status, 401);
  assert.equal((await anon.del('/api/entries/1')).status, 401);
});

test('create applies defaults and validates bounds', async () => {
  const minimal = await alice.post('/api/entries', { name: 'Media', heat: 5 });
  assert.equal(minimal.status, 201);
  assert.equal(minimal.json.entry.brand, '');
  assert.equal(minimal.json.entry.rating, null);
  assert.equal(minimal.json.entry.scoville, null);
  assert.match(minimal.json.entry.triedOn, /^\d{4}-\d{2}-\d{2}$/, 'triedOn defaults to today');

  const cases = [
    { body: { heat: 5 }, why: 'missing name' },
    { body: { name: '   ', heat: 5 }, why: 'blank name' },
    { body: { name: 'X', heat: 0 }, why: 'heat below range' },
    { body: { name: 'X', heat: 11 }, why: 'heat above range' },
    { body: { name: 'X', heat: 'hot' }, why: 'non-integer heat' },
    { body: { name: 'X', heat: 5, rating: 6 }, why: 'rating above range' },
    { body: { name: 'X', heat: 5, scoville: -5 }, why: 'negative scoville' },
    { body: { name: 'X', heat: 5, triedOn: '2026-13-45' }, why: 'impossible date' },
  ];
  for (const { body, why } of cases) {
    assert.equal((await alice.post('/api/entries', body)).status, 400, why);
  }
});

test('entries come back least → most spicy (heat, then scoville, then name)', async () => {
  const sauces = [
    { name: 'Cola', heat: 7, scoville: 5000 },
    { name: 'Beta', heat: 2 },
    { name: 'Alfa', heat: 2 },
    { name: 'Nulo', heat: 7 },              // no scoville → sorts before known scoville at same heat
    { name: 'Bajo', heat: 7, scoville: 100 },
  ];
  for (const s of sauces) {
    assert.equal((await alice.post('/api/entries', s)).status, 201);
  }

  const list = await alice.get('/api/entries');
  assert.equal(list.status, 200);
  assert.deepEqual(
    list.json.entries.map((e) => e.name),
    ['Alfa', 'Beta', 'Media', 'Nulo', 'Bajo', 'Cola'],
  );
});

test('update re-files an entry when its heat changes', async () => {
  const list = await alice.get('/api/entries');
  const cola = list.json.entries.find((e) => e.name === 'Cola');

  const updated = await alice.put(`/api/entries/${cola.id}`, { ...cola, heat: 1, scoville: null });
  assert.equal(updated.status, 200);
  assert.equal(updated.json.entry.heat, 1);

  const after = await alice.get('/api/entries');
  assert.equal(after.json.entries[0].name, 'Cola', 'now the mildest, so it files first');

  assert.equal((await alice.put(`/api/entries/${cola.id}`, { heat: 5 })).status, 400, 'PUT requires the full object');
  assert.equal((await alice.put('/api/entries/999999', { name: 'X', heat: 5 })).status, 404);
});

test('delete tears the page out', async () => {
  const list = await alice.get('/api/entries');
  const media = list.json.entries.find((e) => e.name === 'Media');

  assert.equal((await alice.del(`/api/entries/${media.id}`)).status, 200);
  assert.equal((await alice.del(`/api/entries/${media.id}`)).status, 404, 'second delete finds nothing');

  const after = await alice.get('/api/entries');
  assert.ok(!after.json.entries.some((e) => e.id === media.id));
});

test("users cannot see or touch each other's entries", async () => {
  const reg = await bob.post('/api/auth/register', { email: 'bob@test.es', password: 'flamenco22', name: 'Bob' });
  assert.equal(reg.status, 201);

  const bobList = await bob.get('/api/entries');
  assert.deepEqual(bobList.json.entries, [], "bob starts with an empty passport despite alice's entries");

  const aliceEntry = (await alice.get('/api/entries')).json.entries[0];
  assert.equal((await bob.put(`/api/entries/${aliceEntry.id}`, { name: 'Hacked', heat: 1 })).status, 404);
  assert.equal((await bob.del(`/api/entries/${aliceEntry.id}`)).status, 404);

  const intact = (await alice.get('/api/entries')).json.entries[0];
  assert.equal(intact.name, aliceEntry.name);
});

test('unknown API routes 404, preflight is answered', async () => {
  assert.equal((await anon.get('/api/nope')).status, 404);
  const preflight = await fetch(`${base}/api/entries`, { method: 'OPTIONS' });
  assert.equal(preflight.status, 204);
});
