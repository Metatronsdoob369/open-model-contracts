#!/usr/bin/env bash
set -euo pipefail

# Run Rojo using the cargo-installed binary to match Studio plugin (protocol 5).
ROJO_BIN="$HOME/.cargo/bin/rojo"

if [ ! -x "$ROJO_BIN" ]; then
  echo "Rojo binary not found at $ROJO_BIN. Install with: cargo install rojo@7.7.0-rc.1 --locked --force" >&2
  exit 1
fi

exec "$ROJO_BIN" "$@"
