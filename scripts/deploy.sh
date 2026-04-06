#!/bin/bash
set -euo pipefail

# Reverse AI Deploy Script
# Completely isolated from wai-web (/var/www/waiuni)
# Usage: cd /var/www/reverse-ai && bash scripts/deploy.sh

APP_DIR="/var/www/reverse-ai"

echo "=== Reverse AI Deploy ==="

cd "$APP_DIR"

# --- Pull latest code ---
echo ">>> Pulling latest code..."
git checkout -- .
git pull origin main

# --- Install dependencies ---
echo ">>> Installing dependencies..."
npm install --production=false

# --- Verify .env exists (NEVER overwrite — created manually) ---
if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found at $APP_DIR/.env.local"
  echo "Create it manually: echo 'ANTHROPIC_API_KEY=sk-ant-...' > $APP_DIR/.env.local"
  exit 1
fi

# --- Build ---
echo ">>> Building app..."
npx next build

# --- Restart ONLY reverse-ai PM2 process (not waiuni) ---
echo ">>> Restarting reverse-ai PM2 process..."
if pm2 list | grep -q "reverse-ai"; then
  pm2 restart reverse-ai
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

# --- Reload nginx (safe — validates config first) ---
echo ">>> Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx || echo "Warning: nginx reload failed"

echo ""
echo "=== Reverse AI Deploy Complete ==="
echo "Site: https://reverse-ai.waiwai.is"
echo "Status: pm2 status reverse-ai"
echo "Logs: pm2 logs reverse-ai"
echo ""
