// Uses Node.js 22's built-in SQLite (node:sqlite) — no external packages needed
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LEGACY_CATALOGUE } from './legacy-catalogue.js';
import { heatFromScoville } from '../shared/scoville.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// DB_PATH env var lets you override the location (useful on some hosts).
// Default: a "data/" folder at the project root (one level above server/).
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'hot-sauce-passport.db');

// Ensure the data directory exists
import { mkdirSync } from 'node:fs';
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

// WAL mode gives better concurrent performance.
// Skip WAL if the filesystem doesn't support it (fallback to DELETE mode).
try {
  db.exec('PRAGMA journal_mode = WAL');
} catch {
  console.warn('WAL mode not available, using default journal mode');
}
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- A sauce the user has tried — one passport page each.
  -- heat (1–10) is the user's own fire ranking; pages are ordered by it.
  -- source_sauce_id links entries migrated from the old v2 catalogue ratings.
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '',
    origin TEXT NOT NULL DEFAULT '',
    peppers TEXT NOT NULL DEFAULT '',
    heat INTEGER NOT NULL CHECK(heat >= 1 AND heat <= 10),
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    scoville INTEGER CHECK(scoville >= 0),
    notes TEXT NOT NULL DEFAULT '',
    tried_on TEXT NOT NULL DEFAULT (date('now')),
    source_sauce_id INTEGER,
    favorite INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, source_sauce_id)
  );

  CREATE INDEX IF NOT EXISTS idx_entries_user_heat ON entries (user_id, heat, scoville);

  -- Tiny key/value store for one-time flags (e.g. the legacy migration below).
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Legacy v2 tables (static-catalogue star ratings + favorites). No longer
  -- written by the app; kept so the migration below can read old data.
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sauce_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, sauce_id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sauce_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, sauce_id)
  );
`);

// ── Column migration: favourites flag (added in v3.4) ───────────────────────
// CREATE TABLE IF NOT EXISTS doesn't alter existing tables, so databases
// created before the column exist without it.
if (!db.prepare('PRAGMA table_info(entries)').all().some((c) => c.name === 'favorite')) {
  db.exec("ALTER TABLE entries ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0");
  console.log('♻️  Added entries.favorite column');
}

// ── One-time migration: v2 catalogue ratings → passport entries ──────────────
// Each old star rating referenced a sauce in the static catalogue. Turn each
// one into a real passport entry (name/brand/heat from the catalogue, stars
// and date from the rating). Runs exactly once per database — users may later
// edit or delete the migrated entries freely without them coming back.
const MIGRATION_KEY = 'legacy_ratings_migrated';
if (!db.prepare('SELECT value FROM meta WHERE key = ?').get(MIGRATION_KEY)) {
  const oldRatings = db.prepare('SELECT user_id, sauce_id, rating, rated_at FROM ratings').all();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO entries
      (user_id, name, brand, origin, peppers, heat, rating, scoville, tried_on, source_sauce_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(date(?), date('now')), ?)
  `);

  let migrated = 0;
  for (const row of oldRatings) {
    const sauce = LEGACY_CATALOGUE.find((s) => s.id === row.sauce_id);
    if (!sauce) continue;
    const result = insert.run(
      row.user_id, sauce.name, sauce.brand, sauce.origin, sauce.peppers,
      heatFromScoville(sauce.scoville), row.rating, sauce.scoville, row.rated_at, row.sauce_id
    );
    migrated += Number(result.changes);
  }

  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(MIGRATION_KEY, new Date().toISOString());
  if (migrated > 0) console.log(`♻️  Migrated ${migrated} legacy rating(s) into passport entries`);
}

// ── One-time migration: anchor existing levels to Scoville ──────────────────
// From v3.5 the level is derived from Scoville whenever one is recorded; this
// re-derives rows created before that rule so old and new entries agree.
const SCOVILLE_MIGRATION_KEY = 'heat_derived_from_scoville_v1';
if (!db.prepare('SELECT value FROM meta WHERE key = ?').get(SCOVILLE_MIGRATION_KEY)) {
  const rows = db.prepare('SELECT id, heat, scoville FROM entries WHERE scoville IS NOT NULL').all();
  const update = db.prepare('UPDATE entries SET heat = ? WHERE id = ?');
  let rederived = 0;
  for (const row of rows) {
    const derived = heatFromScoville(row.scoville);
    if (derived !== row.heat) {
      update.run(derived, row.id);
      rederived++;
    }
  }
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(SCOVILLE_MIGRATION_KEY, new Date().toISOString());
  if (rederived > 0) console.log(`♻️  Re-derived ${rederived} entry level(s) from Scoville`);
}

console.log('✅ Database ready');
