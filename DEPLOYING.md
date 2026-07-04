# 🚀 Deploying updates to Hostinger

> **Two ways to host this app — pick your section:**
> - **Managed Node.js hosting** (hPanel builds/runs it; you push to `main` and
>   deploy from the panel) → this is the flow documented **immediately below**.
> - **A VPS** (you get SSH + root and run the process yourself with systemd +
>   nginx) → jump to **[Deploying on a Hostinger VPS](#-deploying-on-a-hostinger-vps)**
>   at the bottom. Ready-made files live in [`deploy/`](deploy/).
>
> Not sure which you have? In hPanel a **VPS** appears under the **VPS** menu
> with its own IP and root/SSH login; managed hosting shows your app under
> **Websites → Node.js**.

This is the **repeatable update workflow** — how to get the latest code from
GitHub live on Hostinger. For *first-time* setup (Node version, env vars, build
commands), see the **"Deploying to Hostinger"** section in [README.md](README.md).

> **The golden rule:** Hostinger deploys from a **branch on GitHub** (almost
> always `main`), and **it does NOT build the frontend** (its build sandbox is
> mounted noexec, so esbuild/Vite fail with `EACCES`). So "update the live site"
> means: **1) build `dist/` locally and commit it**, **2) get it onto `main` at
> GitHub**, then **3) make Hostinger pull that branch.** Hostinger just serves
> the prebuilt `dist/` + the zero-dependency Node API.

> ⚠️ **The frontend is prebuilt.** `dist/` is committed to the repo on purpose.
> If you change anything under `src/`, you **must** rebuild and commit `dist/`
> (Step 1 below) or the live site won't reflect your change. Backend-only changes
> under `server/` don't need a rebuild.

---

## TL;DR — the routine update

```bash
# 1. (If you touched src/) rebuild the frontend locally and commit dist/.
nvm use 22 && corepack enable      # build needs Node 22 + pnpm 11
pnpm install
pnpm build                         # regenerates dist/
git add dist && git commit -m "Rebuild frontend"

# 2. Get everything onto main (merge a PR, or commit + push directly), then:
git checkout main && git pull && git push

# 3. Trigger the deploy on Hostinger (see "Step 2" below for your method)
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

### First: rebuild `dist/` if you changed the frontend

Hostinger can't build (noexec sandbox), so the compiled frontend lives in the
repo. If you edited anything under `src/`, rebuild and commit it **before**
pushing:

```bash
nvm use 22         # build requires Node 22+ (pnpm 11 needs Node ≥22.13)
corepack enable    # activates the pinned pnpm 11.6.0
pnpm install       # first time / after dependency changes
pnpm build         # regenerates dist/
git add dist
```

> Build on **Node 22**, not 18 — pnpm 11 refuses to run on Node 18, and the repo
> targets the Node 22 runtime Hostinger uses. `nvm install 22` if you don't have
> it. Backend-only (`server/`) changes don't need this step.

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

# 4. No build here — dist/ is already committed. Optionally refresh runtime deps
#    (there are none, so this installs nothing and is safe to skip):
# pnpm install --prod --frozen-lockfile

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
   **Install / Build / Start** commands. The standard Vite/pnpm defaults work
   as-is (the repo handles the noexec sandbox internally — see the box at the
   top), so these are fine even if they're locked/greyed out:
   - Install: `corepack enable && pnpm install --frozen-lockfile`
   - Build: `pnpm build` (auto-skips on the host via `scripts/build.mjs`)
   - Start: `pnpm start`
   - Node version: **22.x** (required for built-in `node:sqlite`).

Once you've identified it, jot it at the top of this file so future-you doesn't
have to rediscover it:

> **My setup:** _Method ___ · Node 22.x · app root: `__________`_

---

## Quick reference

| Task | Command / location |
|---|---|
| Rebuild frontend (local) | `nvm use 22 && corepack enable && pnpm install && pnpm build` → commit `dist/` |
| Get code live | Build/commit `dist/` (if `src/` changed) → push `main` → trigger deploy |
| View build logs | hPanel → Websites → Git → deployment history |
| View runtime logs | hPanel → Node.js → Logs |
| Restart server | hPanel → Node.js → Restart (or `pm2 restart`) |
| Back up DB | hPanel → File Manager → `data/` → download `.db` |
| Roll back | `git revert <sha>` → push → redeploy |
| Required Node (build + runtime) | **22.x** |
| Hostinger install cmd | `corepack enable && pnpm install --frozen-lockfile` |
| Hostinger build cmd | `pnpm build` (auto-skips on host) |
| Hostinger start cmd | `pnpm start` |

---

# 🖥️ Deploying on a Hostinger VPS

A VPS gives you SSH + root, so **you** run the Node process and put nginx in
front of it. This app makes that easy: the server has **zero runtime
dependencies** and the frontend (`dist/`) is **committed**, so there's nothing
to build or `npm install` on the server — you install Node 22, check out the
repo, and run one command.

Ready-made templates are in [`deploy/`](deploy/):

| File | What it is |
|---|---|
| `deploy/hot-sauce-passport.service` | systemd unit that keeps the app running & restarts it on reboot/crash |
| `deploy/nginx.conf` | reverse proxy: public 80/443 → the app on `127.0.0.1:3001` |
| `deploy/hot-sauce-passport.env.example` | template for the secrets file (`JWT_SECRET`, etc.) |
| `deploy/deploy.sh` | one-command update: back up DB → pull `main` → restart |

> These files land on the server when you clone the repo, so they need to be on
> `main` first. If you're deploying from an open PR, **merge it to `main`
> before** the clone step below (or the `deploy/` paths won't exist yet).

Commands below assume **Ubuntu** (the usual Hostinger VPS image) and a domain
`example.com` — replace it with yours throughout, and the app path
`/var/www/hot-sauce-passport`.

## 0. Point your domain at the VPS

In your DNS (Hostinger → Domains → DNS, or wherever the domain is registered),
add two **A records** pointing at the VPS's IP:

| Type | Name | Value |
|---|---|---|
| A | `@` | your VPS IP |
| A | `www` | your VPS IP |

DNS can take a while to propagate; you can do the steps below meanwhile, but
HTTPS (step 7) needs the domain resolving to the VPS first.

## 1. Connect and update the box

```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
```

## 2. Install Node 22, git, nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs git nginx
node -v      # should print v22.x  (needed for the built-in node:sqlite)
```

## 3. Create an app user and clone the repo

Run the app as a dedicated non-root user:

```bash
adduser --system --group --home /var/www/hot-sauce-passport hotsauce
git clone https://github.com/jbol/hot-sauce-rater.git /var/www/hot-sauce-passport
chown -R hotsauce:hotsauce /var/www/hot-sauce-passport
```

## 4. Create the secrets file

The server refuses to start in production without `JWT_SECRET`:

```bash
cp /var/www/hot-sauce-passport/deploy/hot-sauce-passport.env.example /etc/hot-sauce-passport.env
# generate a strong secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
nano /etc/hot-sauce-passport.env      # paste the secret in as JWT_SECRET=...
chmod 600 /etc/hot-sauce-passport.env
```

## 5. Install & start the systemd service

Edit the two placeholders in the unit (`User`/`Group` → `hotsauce`,
`WorkingDirectory` → the app path), then install it:

```bash
sed -e 's/__APP_USER__/hotsauce/g' \
    -e 's#__APP_DIR__#/var/www/hot-sauce-passport#g' \
    /var/www/hot-sauce-passport/deploy/hot-sauce-passport.service \
    > /etc/systemd/system/hot-sauce-passport.service

systemctl daemon-reload
systemctl enable --now hot-sauce-passport
systemctl status hot-sauce-passport      # should be "active (running)"
```

If it isn't running: `journalctl -u hot-sauce-passport -n 40` shows why (most
often a missing/empty `JWT_SECRET`).

## 6. Put nginx in front

```bash
sed 's/__DOMAIN__/example.com/g' \
    /var/www/hot-sauce-passport/deploy/nginx.conf \
    > /etc/nginx/sites-available/hot-sauce-passport

ln -s /etc/nginx/sites-available/hot-sauce-passport /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default      # remove the default welcome page
nginx -t && systemctl reload nginx
```

At this point `http://example.com` should show the passport.

## 7. Turn on HTTPS (required for login)

In production the auth cookie is set `Secure`, so **login only works over
HTTPS.** Get a free Let's Encrypt certificate:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```

Certbot edits the nginx config to add the TLS block and an HTTP→HTTPS redirect,
and auto-renews via a systemd timer. Now `https://example.com` is live.

## 8. Lock down the firewall

Expose only SSH and the web ports (the app's 3001 stays internal):

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## ✅ Verify

Open `https://example.com`, register an account, add a sauce, and reload — it
should persist (proving the SQLite DB is writing to `data/`). If anything's off:

```bash
journalctl -u hot-sauce-passport -f     # app logs
tail -f /var/log/nginx/error.log        # proxy/TLS logs
```

## 🔁 Updating later

Once new code is on `main` (merge a PR, or push directly), from the VPS:

```bash
sudo /var/www/hot-sauce-passport/deploy/deploy.sh
```

It backs up the database, hard-syncs to `origin/main` (bringing the committed
`dist/`), and restarts the service — one process serves both the frontend and
API, so a single restart picks up everything.

## Notes & gotchas

- **Database persistence.** The SQLite file lives in `data/` (gitignored), so
  it survives deploys — `deploy.sh` never deletes it and also drops a timestamped
  copy in `backups/` first. Still, back it up off-box periodically:
  `scp root@YOUR_VPS_IP:/var/www/hot-sauce-passport/data/hot-sauce-passport.db .`
- **You don't build on the VPS.** The committed `dist/` is what's served. If you
  change `src/`, rebuild locally (`nvm use 22 && pnpm install && pnpm build`),
  commit `dist/`, push to `main`, then run `deploy.sh`. *(Alternatively you could
  build on the VPS — `corepack enable && pnpm install && pnpm build` — but that
  pulls in the dev toolchain; the committed-`dist/` flow keeps the server lean.)*
- **Rate-limit accuracy behind nginx.** The auth rate limiter keys on the socket
  IP, which is nginx (`127.0.0.1`) for every request, so the 20-attempts/15-min
  cap is currently global rather than per-visitor. Harmless for a personal app;
  tell me if you want it switched to read `X-Forwarded-For`.
- **`node:sqlite` flag.** If your Node 22 build errors that `node:sqlite` is
  unknown, add `--experimental-sqlite` to `ExecStart` in the service file and
  `systemctl daemon-reload && systemctl restart hot-sauce-passport`.
