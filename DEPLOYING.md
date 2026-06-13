# 🚀 Deploying updates to Hostinger

This is the **repeatable update workflow** — how to get the latest code from
GitHub live on Hostinger. For *first-time* setup (Node version, env vars, build
commands), see the **"Deploying to Hostinger"** section in [README.md](README.md).

> **The golden rule:** Hostinger deploys from a **branch on GitHub** (almost
> always `main`). So "update the live site" really means two steps:
> **1) get your code onto `main` at GitHub**, then **2) make Hostinger pull &
> rebuild that branch.**

---

## TL;DR — the routine update

```bash
# 1. Merge your work into main (via a PR), then locally:
git checkout main
git pull

# 2. Trigger the deploy on Hostinger (see "Step 2" below for your method)
#    - Auto-deploy:   nothing to do — the push already triggered it
#    - Manual button: hPanel → Websites → Git → "Deploy" / "Pull"
#    - SSH:           ssh in, then run the redeploy commands below
```

Then **verify**: open the site, hard-refresh (Cmd/Ctrl-Shift-R), and check the
change is live.

---

## Step 1 — Get the latest code onto `main`

The live site only ever reflects what's on the **`main` branch at GitHub**.
Feature branches and unmerged PRs are *not* deployed.

### Via a Pull Request (recommended)

```bash
# from your feature branch
gh pr create --base main --fill        # open the PR
gh pr merge <PR#> --merge --delete-branch   # merge it once you're happy
git checkout main && git pull          # sync your local main
```

### Quick path (small changes, no review)

```bash
git checkout main
git pull
# ...make edits...
git add -A && git commit -m "describe the change"
git push
```

Either way, the goal is the same: **`origin/main` on GitHub now contains the
code you want live.**

---

## Step 2 — Make Hostinger deploy the new `main`

Hostinger can be wired up three ways. **If you're not sure which one you have**,
jump to ["How do I tell which method I have?"](#how-do-i-tell-which-method-i-have)
below, then come back.

### Method A — Auto-deploy (GitHub webhook)

If auto-deploy is enabled, **you're done** — pushing to `main` already kicked off
a rebuild. Watch progress in:

> **hPanel → Websites → (your site) → Git → Deployment history / logs**

Wait for it to finish (it runs your install → build → start commands), then
verify the site.

### Method B — Manual "Deploy" button

1. Go to **hPanel → Websites → (your site) → Git**.
2. Click **Deploy** (sometimes labeled **Pull** or **Deploy latest commit**).
3. Hostinger fetches the newest `main`, then re-runs:
   - Install: `corepack enable && pnpm install --frozen-lockfile`
   - Build: `pnpm build`
   - Start: `pnpm start`
4. Watch the build log until it reports success, then verify the site.

### Method C — SSH + manual git pull

If you deploy by hand over SSH:

```bash
# 1. Connect (get host/port from hPanel → Advanced → SSH Access)
ssh -p <port> u123456789@your-server-ip

# 2. Go to the app directory (path shown in hPanel → Node.js)
cd ~/domains/yourdomain.com/public_html   # adjust to your actual path

# 3. Pull the latest main
git checkout main
git pull origin main

# 4. Reinstall, rebuild, restart
corepack enable
pnpm install --frozen-lockfile
pnpm build

# 5. Restart the Node app
#    Easiest: hPanel → Node.js → "Restart" button.
#    Or if you run it under a process manager (pm2):
pm2 restart hot-sauce-rater   # or: pm2 restart all
```

> The app serves the built frontend (`dist/`) **and** the API from one Node
> process, so a single restart picks up both frontend and backend changes.

---

## Step 3 — Verify the deploy

1. Open your site in the browser.
2. **Hard refresh** (Cmd-Shift-R / Ctrl-Shift-R) to bypass cached assets.
3. Confirm the new behavior is visible (e.g. the heat-tinted bottle icons).
4. Smoke-test the core flow: register/login → rate a sauce → reload (the rating
   should persist, proving the DB survived the redeploy).
5. If something looks broken, check **hPanel → Node.js → Logs** for runtime
   errors and the **Git deployment log** for build errors.

---

## ⚠️ Protect your data before every deploy

Hostinger stores files on a shared filesystem, and **SQLite `.db` files can be
reverted during container restarts or re-deploys.** Real user ratings live in
`data/hot-sauce-passport.db`.

**Before any deploy with live users:**

- **Back up the database** — hPanel → File Manager → navigate to `data/` →
  download `hot-sauce-passport.db`. (Or `scp` it down over SSH.)
- **Avoid deploying while people are actively rating sauces.**
- For a real production app, migrate to **Hostinger MySQL** (hPanel) for
  durable storage — the SQLite file approach is best for low-traffic/personal use.

---

## 🔙 Rolling back a bad deploy

If a deploy breaks the site, get back to a known-good commit:

```bash
git checkout main
git pull
git revert <bad-commit-sha>     # safest: creates a new commit undoing the change
git push
```

Then redeploy (Step 2). `git revert` is preferred over force-pushing because it
keeps history intact and re-triggers a clean build. After rolling back, restore
your most recent database backup if the bad deploy corrupted data.

---

## How do I tell which method I have?

1. Log into **hPanel** and open your site → look for a **Git** section.
   - **No Git section at all?** Your app may be deployed via SSH/manual upload
     only → use **Method C**.
2. Inside **Git**, look for an **"Auto deployment"** toggle:
   - **On** → **Method A** (push to `main` = auto-rebuild).
   - **Off**, but there's a **Deploy/Pull button** → **Method B**.
3. Check **hPanel → Node.js** for your **Application root** path and the
   **Install / Build / Start** commands — these should match:
   - Install: `corepack enable && pnpm install --frozen-lockfile`
   - Build: `pnpm build`
   - Start: `pnpm start`
   - Node version: **22.x** (required for built-in `node:sqlite`).

Once you've identified it, jot it at the top of this file so future-you doesn't
have to rediscover it:

> **My setup:** _Method ___ · Node 22.x · app root: `__________`_

---

## Quick reference

| Task | Command / location |
|---|---|
| Get code live | Merge to `main` → trigger deploy (Step 2) |
| View build logs | hPanel → Websites → Git → deployment history |
| View runtime logs | hPanel → Node.js → Logs |
| Restart server | hPanel → Node.js → Restart (or `pm2 restart`) |
| Back up DB | hPanel → File Manager → `data/` → download `.db` |
| Roll back | `git revert <sha>` → push → redeploy |
| Required Node | **22.x** |
| Install cmd | `corepack enable && pnpm install --frozen-lockfile` |
| Build cmd | `pnpm build` |
| Start cmd | `pnpm start` |
