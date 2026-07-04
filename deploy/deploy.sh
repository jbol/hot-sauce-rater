#!/usr/bin/env bash
#
# Update Pasaporte Picante to the latest main and restart it.
#
# Run on the VPS as root (or with sudo):
#   sudo /var/www/hot-sauce-passport/deploy/deploy.sh
#
# The frontend (dist/) is committed to the repo and the server has zero runtime
# dependencies, so a deploy is just: back up the DB, sync to origin/main, and
# restart the service. No build, no npm install.

set -euo pipefail

SERVICE="hot-sauce-passport"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Run git as whoever owns the checkout (avoids git's "dubious ownership" guard).
OWNER="$(stat -c '%U' "$REPO_DIR")"

echo "→ Repo:    $REPO_DIR (owner: $OWNER)"
echo "→ Service: $SERVICE"

# Best-effort SQLite backup before we touch anything (data/ is gitignored, so a
# hard reset never deletes it — this is just an extra safety net).
if [ -f "$REPO_DIR/data/hot-sauce-passport.db" ]; then
  sudo -u "$OWNER" mkdir -p "$REPO_DIR/backups"
  sudo -u "$OWNER" cp "$REPO_DIR/data/hot-sauce-passport.db" \
    "$REPO_DIR/backups/hot-sauce-passport.$(date +%Y%m%d-%H%M%S).db"
  echo "→ Backed up DB to backups/"
fi

# Sync to the exact state of origin/main (brings the committed dist/ with it).
sudo -u "$OWNER" git -C "$REPO_DIR" fetch origin main
sudo -u "$OWNER" git -C "$REPO_DIR" reset --hard origin/main

# One process serves both the frontend and API, so one restart does it all.
systemctl restart "$SERVICE"
sleep 1
systemctl --no-pager --lines=12 status "$SERVICE" || true
echo "✓ Deployed. Follow logs with:  journalctl -u $SERVICE -f"
