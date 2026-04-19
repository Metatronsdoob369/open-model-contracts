#!/usr/bin/env bash
set -euo pipefail

# Wrapper to run graphify against this repo.
# Requires `graphify` on PATH. Outputs to graphify-out/GRAPH_REPORT.md

OUT_DIR="graphify-out"
OUT_FILE="$OUT_DIR/GRAPH_REPORT.md"

mkdir -p "$OUT_DIR"

graphify --repo . --output "$OUT_FILE"

echo "Graphify report written to $OUT_FILE"
