# 🌶️ Hot Sauce Passport

A full-stack hot sauce rating app. Users register, log in, and collect passport stamps as they rate each sauce.

**Stack:** React + Vite frontend · Pure Node.js 22 backend (zero npm dependencies for the server) · Built-in SQLite (`node:sqlite`)

---

## Deploying to Hostinger

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

Hostinger will ask for:

| Field | Value |
|---|---|
| **Install command** | `npm ci` |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |

`npm start` runs `NODE_ENV=production node server/index.js`, which serves both the API *and* the built React frontend from a single process on Hostinger's assigned port.

### 5. Deploy

Sync your GitHub repo in hPanel and click **Deploy**. Hostinger will:
1. Run `npm ci` to install React + Vite dev tools
2. Run `npm run build` to compile the frontend into `dist/`
3. Run `npm start` to start the Node.js server

The server automatically detects the `dist/` folder and switches into production mode, serving the frontend as static files.

---

## SQLite persistence note

Hostinger's Node.js hosting stores files on a shared filesystem. SQLite works fine for low-traffic personal projects, but some users have reported that file changes (including `.db` files) can be reverted during container restarts or re-deployments.

**To keep your data safe:**
- Avoid re-deploying while users are actively rating sauces
- Consider periodically exporting your database (download the `.db` file from `data/` via hPanel's File Manager)
- For a production app with real users, migrating to **Hostinger's MySQL** (available in hPanel) is recommended for durability

---

## Local development

```bash
# Install dependencies
npm install

# Run backend + frontend dev servers concurrently
npm run dev
```

- Backend API: `http://localhost:3001`
- Frontend (Vite): `http://localhost:5173`

The Vite dev server proxies `/api` requests to the backend automatically.

```bash
# Build and preview the production bundle locally
npm run build
npm start
# Visit http://localhost:3001
```

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
│   ├── index.js        # HTTP server, routing, rate limiting
│   ├── db.js           # SQLite setup and schema
│   └── auth.js         # Password hashing (scrypt) + token signing (HMAC-SHA256)
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx         # Login / register UI
│   │   ├── PassportHome.jsx     # Passport cover + stamps view
│   │   ├── PassportStamp.jsx    # Individual circular stamp
│   │   └── ExploreView.jsx      # Browse / filter / sort sauces
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Session state (restored from cookie on load)
│   │   └── SaucesContext.jsx    # Ratings + favorites synced to backend
│   ├── data/
│   │   └── hotSauces.js         # Static sauce catalogue
│   ├── services/
│   │   └── api.js               # Fetch wrapper (credentials: include)
│   ├── App.jsx
│   └── index.css
├── data/                        # Auto-created; holds the SQLite DB (gitignored)
├── dist/                        # Built frontend (gitignored)
├── package.json
└── vite.config.js
```
