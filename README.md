# 🌶️ Pasaporte Picante · Hot Sauce Passport

A flamenco-inspired passport for every hot sauce you've tried. Each sauce you
record becomes a stamped **"visa de fuego"** page, and the passport's pages are
ordered **least → most spicy** (your own 1–10 fire ranking; Scoville breaks
ties). The design borrows from Andalusia: a carmine leather cover, lunares
(polka-dot) linings, azulejo tile borders, a folding-fan heat gauge that opens
with the fire, and a circular "PROBADO" rubber stamp on every page.

- **Passport book UI** — 3D page-flip spreads on desktop, single pages on mobile
- **Record sauces you've tried** — name, brand, origin, peppers, fire scale
  (1–10), star rating, Scoville, date, tasting notes; edit or "tear out" pages
- **ID page** — bearer info, rank title, stats, and a machine-readable zone
- Legacy v2 catalogue ratings are migrated into passport entries automatically
  on first boot (one-time, flagged in the `meta` table)

**Stack:** React + Vite frontend · Pure Node.js 22 backend (zero runtime dependencies for the server) · Built-in SQLite (`node:sqlite`) · **pnpm** for package management

---

## Deploying to Hostinger

> 📘 **Already set up and just want to ship an update?** See
> **[DEPLOYING.md](DEPLOYING.md)** for the repeatable merge-to-`main` → redeploy
> workflow, rollback steps, and the database-backup checklist. The section below
> is for *first-time* setup.

### 1. Make sure your repo is pushed to GitHub

Hostinger's Node.js hosting syncs directly from a GitHub repository.

### 2. Select Node.js version

In **hPanel → Node.js**, set the version to **22.x** (required for the built-in `node:sqlite` and `node:crypto` APIs).

### 3. Set environment variables

In **hPanel → Node.js → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `JWT_SECRET` | *(a long random string)* | **Required in production.** Generate one with `openssl rand -hex 32` |
| `NODE_ENV` | `production` | Activates static file serving and the `Secure` cookie flag |
| `PORT` | *(leave unset)* | Hostinger injects `$PORT` automatically |
| `DB_PATH` | *(leave unset)* | Defaults to `data/hot-sauce-passport.db` inside the project folder |

> ⚠️ **JWT_SECRET is critical.** If you leave it unset, the server will refuse to start in production. Use a strong random value — never commit it to your repository.

### 4. Set the build commands

Hostinger's standard auto-detected commands work as-is (you don't need to
change them — and on some plans they're locked anyway):

| Field | Value |
|---|---|
| **Install command** | `corepack enable && pnpm install --frozen-lockfile` |
| **Build command** | `pnpm build` |
| **Start command** | `pnpm start` |

> 🛑 **Hostinger can't actually build the frontend** — its build sandbox is
> mounted **noexec**, so `esbuild` (used by Vite) can't execute its native
> binary. The repo is set up to handle this so the commands above still succeed:
> - **Install:** [`pnpm-workspace.yaml`](pnpm-workspace.yaml) sets
>   `allowBuilds: { esbuild: false }`, so pnpm skips esbuild's postinstall
>   (which would hit `EACCES`). Vite still finds the esbuild binary locally, so
>   local builds are unaffected.
> - **Build:** `pnpm build` runs [`scripts/build.mjs`](scripts/build.mjs), which
>   detects Hostinger's sandbox and **skips** the Vite build, serving the
>   **committed `dist/`** instead. Locally it runs the real build.
> - **Start:** the Node server has **zero runtime dependencies** and serves the
>   prebuilt `dist/` + the API from one process on Hostinger's assigned port.

### 5. Deploy

1. **Locally**, rebuild and commit the frontend whenever you change `src/`:
   ```bash
   nvm use 22 && corepack enable   # Node 22 + pnpm 11 are required to build
   pnpm install
   pnpm build                      # regenerates dist/ (runs the real Vite build locally)
   git add dist && git commit -m "Rebuild frontend" && git push
   ```
   Backend-only changes under `server/` don't need a rebuild.
2. **In hPanel**, sync the repo and click **Deploy**. Hostinger installs (no
   esbuild), skips the build, pulls the committed `dist/`, and starts the server.

The server automatically detects the `dist/` folder and serves the frontend as static files.

---

## SQLite persistence note

Hostinger's Node.js hosting stores files on a shared filesystem. SQLite works fine for low-traffic personal projects, but some users have reported that file changes (including `.db` files) can be reverted during container restarts or re-deployments.

**To keep your data safe:**
- Avoid re-deploying while users are actively rating sauces
- Consider periodically exporting your database (download the `.db` file from `data/` via hPanel's File Manager)
- For a production app with real users, migrating to **Hostinger's MySQL** (available in hPanel) is recommended for durability

---

## Local development

This project uses **pnpm**. With Node 22+, enable it once via `corepack enable` (no global install needed).

```bash
# Install dependencies
pnpm install

# Run backend + frontend dev servers concurrently
pnpm dev
```

- Backend API: `http://localhost:3001`
- Frontend (Vite): `http://localhost:5173`

The Vite dev server proxies `/api` requests to the backend automatically.

```bash
# Build and preview the production bundle locally
pnpm build
pnpm start
# Visit http://localhost:3001
```

---

## Tests & CI/CD

```bash
pnpm test        # Node's built-in test runner — no test framework installed
```

The suite boots the **real server** against a throwaway SQLite database and
covers auth, entries CRUD, validation bounds, the mild→inferno ordering rule,
per-user isolation, the crypto helpers, and the one-time v2→v3 migration.

Two GitHub Actions workflows:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | every push to `main` + every PR | tests → build → fails if the committed `dist/` is stale |
| `deploy.yml` | publishing a **GitHub Release** (or manual dispatch) | CI gate → SSH `deploy/deploy.sh` on the VPS → smoke-checks the live site |

Cutting a release (which deploys to production):

```bash
gh release create v3.1.0 --generate-notes
```

The deploy key stored in `VPS_SSH_KEY` is **command-restricted** on the server
(`command="deploy.sh",restrict` in `authorized_keys`), so even if it leaked it
can only redeploy `origin/main` — it cannot open a shell.

---

## Environment variables reference

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `dev-secret-…` (dev only) | HMAC-SHA256 signing key for auth tokens |
| `NODE_ENV` | `development` | Set to `production` to enable static serving + Secure cookies |
| `PORT` | `3001` | HTTP port the server listens on |
| `DB_PATH` | `data/hot-sauce-passport.db` | Path to the SQLite database file |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (dev only; not needed in production) |

---

## Project structure

```
hot-sauce-rater/
├── server/
│   ├── index.js             # HTTP server, routing, rate limiting, entries API
│   ├── db.js                # SQLite setup, schema, one-time legacy migration
│   ├── auth.js              # Password hashing (scrypt) + token signing (HMAC-SHA256)
│   ├── legacy-catalogue.js  # v2 static catalogue (used only by the migration)
│   └── schema.sql           # Documented schema reference
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx     # "Oficina de expedición" — login / register
│   │   ├── PassportBook.jsx # The book: 3D flip spreads / mobile single pages
│   │   ├── PassportPages.jsx# Cover, linings, ID, fire scale, visas, add page
│   │   ├── EntryForm.jsx    # "Registro de salsa" modal (add / edit)
│   │   ├── FanGauge.jsx     # Folding-fan heat gauge & picker (1–10)
│   │   ├── StampSeal.jsx    # Circular "PROBADO" rubber stamp
│   │   ├── StarRating.jsx   # Gold stars (display + picker)
│   │   └── Ornaments.jsx    # Azulejo strips, chili glyph, dividers, emblem
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Session state (restored from cookie on load)
│   │   └── EntriesContext.jsx  # Sauce entries CRUD, sorted mild → inferno
│   ├── services/
│   │   └── api.js           # Fetch wrapper (credentials: include)
│   ├── utils/
│   │   └── heat.js          # Fire-scale levels, colours, sorting, formatting
│   ├── App.jsx
│   └── index.css            # Flamenco design system
├── data/                    # Auto-created; holds the SQLite DB (gitignored)
├── dist/                    # Built frontend (COMMITTED — Hostinger can't build)
├── package.json
└── vite.config.js
```

---

## API

All endpoints are cookie-authenticated (`token`, HttpOnly). Entries belong to
the signed-in user.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (also signs in) |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/entries` | List sauces, ordered heat → Scoville → name |
| `POST` | `/api/entries` | Record a sauce (`name`, `heat` 1–10 required) |
| `PUT` | `/api/entries/:id` | Update a sauce (full object) |
| `DELETE` | `/api/entries/:id` | Tear the page out |
