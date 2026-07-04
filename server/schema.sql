-- ============================================================================
-- Hot Sauce Passport — Database Schema
-- ----------------------------------------------------------------------------
-- Engine : SQLite (Node 22 built-in `node:sqlite`, via server/db.js)
-- Scope  : the tables the running app reads/writes today.
--
-- Design notes
--   * Every sauce a user has tried is an `entries` row — one passport page
--     each. Sauces are user-recorded (no shared catalogue); `heat` (1–10) is
--     the user's own fire ranking and pages are ordered by it, least → most
--     spicy (Scoville breaks ties, then name).
--   * Auth tokens are stateless (signed HMAC-SHA256, see server/auth.js),
--     so there is deliberately no sessions/tokens table.
--   * Passwords are stored as a scrypt "salt:derivedKey" hex string —
--     never plaintext.
--   * The legacy v2 tables (`ratings`, `favorites`) referenced a static
--     catalogue. On first boot after upgrading, db.js migrates each old
--     rating into an `entries` row (flagged in `meta` so it runs once).
-- ============================================================================

PRAGMA foreign_keys = ON;   -- enforce FK constraints (set per-connection at runtime too)

-- ── users ───────────────────────────────────────────────────────────────────
-- One row per registered taster.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  email         TEXT     NOT NULL UNIQUE COLLATE NOCASE,   -- case-insensitive & unique
  password_hash TEXT     NOT NULL,                         -- scrypt "salt:key" hex, never plaintext
  name          TEXT     NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── entries ─────────────────────────────────────────────────────────────────
-- A sauce the user has tried — one passport page each.
CREATE TABLE IF NOT EXISTS entries (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT     NOT NULL,                       -- sauce name (required)
  brand           TEXT     NOT NULL DEFAULT '',            -- maker, e.g. "Huy Fong"
  origin          TEXT     NOT NULL DEFAULT '',            -- e.g. "Louisiana, USA"
  peppers         TEXT     NOT NULL DEFAULT '',            -- e.g. "Habanero, Chipotle"
  heat            INTEGER  NOT NULL CHECK (heat BETWEEN 1 AND 10),   -- fire scale (sort key)
  rating          INTEGER  CHECK (rating BETWEEN 1 AND 5), -- how much they liked it (optional)
  scoville        INTEGER  CHECK (scoville >= 0),          -- SHU (optional; tie-breaker)
  notes           TEXT     NOT NULL DEFAULT '',            -- tasting notes
  tried_on        TEXT     NOT NULL DEFAULT (date('now')), -- ISO date "YYYY-MM-DD"
  source_sauce_id INTEGER,                                 -- v2 catalogue id if migrated, else NULL
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, source_sauce_id)                        -- migration idempotency (NULLs are distinct)
);

-- Serves the passport-page query:
--   SELECT * FROM entries WHERE user_id = ? ORDER BY heat, COALESCE(scoville,-1), name
CREATE INDEX IF NOT EXISTS idx_entries_user_heat ON entries (user_id, heat, scoville);

-- ── meta ────────────────────────────────────────────────────────────────────
-- Tiny key/value store for one-time flags (e.g. 'legacy_ratings_migrated').
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ── legacy v2 tables ────────────────────────────────────────────────────────
-- No longer written by the app. Kept (not dropped) so the one-time startup
-- migration can read old data, and as a safety net for rollbacks.
CREATE TABLE IF NOT EXISTS ratings (
  id        INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sauce_id  INTEGER  NOT NULL,                             -- → old static catalogue
  rating    INTEGER  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, sauce_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sauce_id   INTEGER  NOT NULL,                            -- → old static catalogue
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, sauce_id)
);
