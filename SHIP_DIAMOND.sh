#!/usr/bin/env bash
# SHIP_DIAMOND.sh — Orion one-shot: purge cache, commit, push.
# Run from repo root: bash SHIP_DIAMOND.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "==> [1/6] Killing stale index lock (if any)"
rm -f .git/index.lock

echo "==> [2/6] Unstaging graphify-out/cache/ (773 MB of regenerable blobs)"
git rm --cached -rf --quiet graphify-out/cache || true

echo "==> [3/6] Unstaging regenerable artifacts"
git rm --cached -rf --quiet generated/vampire_drops || true
git rm --cached -rf --quiet mochawesome-report || true

echo "==> [4/6] Dropping duplicate root gothtag_v1_HARDENED.rbxl (canonical lives in baselines/SectorAlpha_Tag/)"
if [ -f gothtag_v1_HARDENED.rbxl ]; then
  git rm --cached --quiet gothtag_v1_HARDENED.rbxl || true
  rm -f gothtag_v1_HARDENED.rbxl
fi

echo "==> [5/6] Staging updated .gitignore"
git add .gitignore

echo "==> [6/6] Staged summary"
echo "Files staged: $(git diff --cached --name-only | wc -l | tr -d ' ')"
echo "Staged size: $(git diff --cached --stat | tail -1)"

echo ""
echo "==> COMMIT"
git commit -m "$(cat <<'EOF'
feat(omc): Diamond-Stable baseline — Sovereign Pipeline + REFRAG 3072 + Pre-Flight

Locks in the hardened Spatio-Temporal Movement DNA (95%) and Round-State
governance (85%) tiers from the Capability-Finishline roadmap.

Highlights:
- AMEM_LANDER Sovereign Pipeline (TS) + honest architecture refactor
- Capability-Finishline roadmap + PRE_FLIGHT_CHECKLIST for Diamond-Stable
- Tag/Chase genre hardened: TagArena, TagBot, TagLogic, Telemetry, MetropolisLighting
- Sovereign dashboard (dashboard/nexus.html)
- Canonical hardened baseline moved to baselines/SectorAlpha_Tag/
- REFRAG 3072-D embedder site, heatmap/memory APIs, SpectralRadar, ImmuneGauge
- Repaired + shattered Lua artifact corpus
- Graphify GRAPH_REPORT updated (regenerable cache now gitignored)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

echo ""
echo "==> PUSH"
git push origin main

echo ""
echo "==> DONE. Diamond-Stable baseline shipped."
