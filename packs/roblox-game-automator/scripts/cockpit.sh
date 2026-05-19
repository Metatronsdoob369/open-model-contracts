#!/usr/bin/env bash
set -euo pipefail

BRIDGE_URL="${OMC_BRIDGE_URL:-http://127.0.0.1:3099}"

echo "[cockpit] bridge=${BRIDGE_URL}"
if curl -sf "${BRIDGE_URL}/health" >/dev/null; then
  echo "[cockpit] bridge health: ok"
else
  echo "[cockpit] bridge health: unreachable"
fi

echo "[cockpit] running canonical audit..."
npm run audit:canon

echo "[cockpit] entering live escrow audit loop..."
exec npm run audit:live-escrow
