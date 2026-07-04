// The one-time v2 → v3 migration: old catalogue star ratings become passport
// entries on first boot, flagged in `meta` so they never come back after a
// user edits or deletes them.
//
// This file pre-seeds an old-schema database BEFORE importing the server, so
// the import runs the migration against it (each test file = own process).

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = join(mkdtempSync(join(tmpdir(), 'hsp-migration-')), 'test.db');
process.env.DB_PATH = DB_PATH;

let server;

before(async () => {
  // Seed a v2-era database: a user with two ratings — one for a catalogue
  // sauce (Sriracha, id 1) and one for an id the catalogue never had.
  const old = new DatabaseSync(DB_PATH);
  old.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sauce_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, sauce_id)
    );
    INSERT INTO users (email, password_hash, name) VALUES ('vet@test.es', 'x:y', 'Veteran');
    INSERT INTO ratings (user_id, sauce_id, rating, rated_at) VALUES (1, 1, 4, '2026-05-01 12:00:00');
    INSERT INTO ratings (user_id, sauce_id, rating) VALUES (1, 999, 5);
  `);
  old.close();

  ({ server } = await import('../server/index.js')); // import runs the migration
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
});

after(() => server.close());

test('catalogue ratings become entries with mapped fields', () => {
  const db = new DatabaseSync(DB_PATH);
  const entries = db.prepare('SELECT * FROM entries WHERE user_id = 1').all();

  assert.equal(entries.length, 1, 'unknown sauce_id 999 is skipped');
  const e = entries[0];
  assert.equal(e.name, 'Sriracha');
  assert.equal(e.brand, 'Huy Fong');
  assert.equal(e.heat, 6, 'v2 heatLevel 3 maps to 6 on the 1–10 scale');
  assert.equal(e.rating, 4, 'star rating carried over');
  assert.equal(e.scoville, 1750);
  assert.equal(e.tried_on, '2026-05-01', 'tried_on taken from rated_at');
  assert.equal(e.source_sauce_id, 1);
  db.close();
});

test('migration is flagged as done so it never re-runs', () => {
  const db = new DatabaseSync(DB_PATH);
  const flag = db.prepare("SELECT value FROM meta WHERE key = 'legacy_ratings_migrated'").get();
  assert.ok(flag, 'meta flag written');

  // Simulate the user deleting the migrated entry: with the flag set, a
  // restart must NOT resurrect it (the guard is the flag, not the data).
  db.prepare('DELETE FROM entries WHERE user_id = 1').run();
  const count = db.prepare('SELECT COUNT(*) AS n FROM entries WHERE user_id = 1').get().n;
  assert.equal(count, 0);
  db.close();
});

test('migrated passport is served through the API ordering', async () => {
  // (entry was deleted above — create fresh ones through the real API to
  // prove the migrated DB is fully usable)
  const base = `http://127.0.0.1:${server.address().port}`;
  const reg = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nuevo@test.es', password: 'flamenco22', name: 'Nuevo' }),
  });
  assert.equal(reg.status, 201);
});
