-- ============================================================================
-- Hot Sauce Passport — Database Schema
-- ----------------------------------------------------------------------------
-- Engine : SQLite (Node 22 built-in `node:sqlite`, via server/db.js)
-- Scope  : the tables the running app reads/writes today.
--
-- Design notes
--   * sauce_id values reference the STATIC catalogue in
--     src/data/hotSauces.js (ids 1..N). Sauces are not stored in the DB,
--     so sauce_id has no foreign key. See the optional `sauces` table at
--     the end if you want to make the catalogue data-driven.
--   * Auth tokens are stateless (signed HMAC-SHA256, see server/auth.js),
--     so there is deliberately no sessions/tokens table.
--   * Passwords are stored as a scrypt "salt:derivedKey" hex string —
--     never plaintext.
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

-- ── ratings ─────────────────────────────────────────────────────────────────
-- A user's 1–5 star rating of a sauce. At most one row per (user, sauce):
-- re-rating UPSERTs in place and refreshes rated_at.
CREATE TABLE IF NOT EXISTS ratings (
  id        INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sauce_id  INTEGER  NOT NULL,                             -- → src/data/hotSauces.js
  rating    INTEGER  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, sauce_id)
);

-- ── favorites ───────────────────────────────────────────────────────────────
-- A user's favorited sauces. Row present = favorited; the "favorite" endpoint
-- toggles by inserting/deleting. At most one row per (user, sauce).
CREATE TABLE IF NOT EXISTS favorites (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sauce_id   INTEGER  NOT NULL,                            -- → src/data/hotSauces.js
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, sauce_id)
);

-- ── indexes ─────────────────────────────────────────────────────────────────
-- The UNIQUE(user_id, sauce_id) constraints already index the common
-- "all rows for this user" lookups (leftmost-prefix on user_id), which covers
-- the favorites reads and the (user_id, sauce_id) point lookups.
-- This extra index serves the "my ratings, newest first" query:
--   SELECT sauce_id, rating, rated_at FROM ratings WHERE user_id = ? ORDER BY rated_at DESC
CREATE INDEX IF NOT EXISTS idx_ratings_user_recent ON ratings (user_id, rated_at DESC);


-- ============================================================================
-- OPTIONAL — data-driven sauce catalogue
-- ----------------------------------------------------------------------------
-- The app currently ships the catalogue as a static JS array. If you'd rather
-- store sauces in the DB (so you can add/edit them without a redeploy),
-- uncomment the block below. You can then add real foreign keys on sauce_id
-- in ratings/favorites, e.g.  sauce_id INTEGER NOT NULL REFERENCES sauces(id).
-- ============================================================================
--
-- CREATE TABLE IF NOT EXISTS sauces (
--   id           INTEGER PRIMARY KEY,                 -- match existing catalogue ids
--   name         TEXT    NOT NULL,
--   brand        TEXT    NOT NULL,
--   heat_level   INTEGER NOT NULL CHECK (heat_level BETWEEN 1 AND 5),
--   max_heat     INTEGER NOT NULL DEFAULT 5,
--   description  TEXT    NOT NULL DEFAULT '',
--   origin       TEXT    NOT NULL DEFAULT '',
--   peppers      TEXT    NOT NULL DEFAULT '[]',        -- JSON array, e.g. ["Habanero"]
--   scoville     TEXT    NOT NULL DEFAULT '',          -- range string, e.g. "1,000-2,500"
--   created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE INDEX IF NOT EXISTS idx_sauces_heat ON sauces (heat_level);
