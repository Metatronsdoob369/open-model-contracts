#!/usr/bin/env bash
# sovereign-submit.sh — One-command handoff for Marsh or Joe.
# Usage: ./scripts/sovereign-submit.sh "what you built"
# The pipeline does the rest.

set -euo pipefail

INTENT="${1:-update}"
AUTHOR="${GIT_AUTHOR_NAME:-$(git config user.name 2>/dev/null || echo "contributor")}"
SLUG=$(echo "$AUTHOR" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
BRANCH="feat/${SLUG}-$(date +%Y%m%d-%H%M%S)"
TOKEN=$(openssl rand -hex 6 2>/dev/null || echo "$(date +%s)")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OMC SOVEREIGN SUBMIT"
echo "  Author : $AUTHOR"
echo "  Branch : $BRANCH"
echo "  Intent : $INTENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Sanity — make sure we are not on main
CURRENT=$(git branch --show-current)
if [ "$CURRENT" = "main" ]; then
  echo ""
  echo "⚠️  You are on main. Creating feature branch first..."
  git checkout -b "$BRANCH"
fi

# 2. Stage everything in src/ and generated/ — never node_modules or .env
git add src/ generated/ scripts/ server/ dashboard/ packs/ \
        default.project.json ARCHITECTURE.md COLLABORATION.md 2>/dev/null || true

# 3. Commit
git commit -m "feat(${SLUG}): ${INTENT}

OMC-Sync-Token: ${TOKEN}
Canonical-Validation: Pending-CI
" 2>/dev/null || { echo "Nothing new to commit — already up to date."; exit 0; }

# 4. Push to feature branch
git push origin "HEAD:${BRANCH}" --set-upstream 2>/dev/null || \
git push --set-upstream origin "${BRANCH}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ SUBMITTED"
echo "  The CI pipeline is now running."
echo "  • Syntax check on all .luau files"
echo "  • Governance gate on bridge modules"
echo "  • Auto-PR opened against main"
echo ""
echo "  Track it:"
echo "  https://github.com/Metatronsdoob369/open-model-contracts/pulls"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
