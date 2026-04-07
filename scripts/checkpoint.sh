#!/bin/bash

###############################################################################
# CHECKPOINT (v2.5 - Final Release)
#
# Usage: ./scripts/checkpoint.sh -m "Lesson Learned" [-n "Version Name"]
#
# Motto: Getting paid to have problems.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'

# Defaults
MEMO=""; NAME=""; TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S"); GIT_HASH=$(git rev-parse --short HEAD || echo "no-git")

# Parse arguments
while getopts m:n: flag; do
    case "${flag}" in
        m) MEMO=${OPTARG};;
        n) NAME=${OPTARG};;
        *) echo "Usage: $0 -m \"Memo\" [-n \"Name\"]"; exit 1;;
    esac
done
shift $((OPTIND-1))

# STRICT ENFORCEMENT: Memo is mandatory
[ -z "$MEMO" ] && { echo -e "${RED}❌ Error: A memo (-m) is required.${NC}"; exit 1; }

# Sanitize Memo: Escape pipes to avoid breaking Markdown tables
MEMO=$(echo "$MEMO" | sed 's/|/\\|/g')

CHECKPOINT_ID="checkpoint_${TIMESTAMP}_${GIT_HASH}"
[ -n "$NAME" ] && CHECKPOINT_ID="${NAME}_${CHECKPOINT_ID}"

echo -e "${BLUE}💾 CAPTURING MISSION MEMORY: ${CHECKPOINT_ID}${NC}"

# 1. Physical Archive
ARCHIVE_ROOT="registry/checkpoints/${CHECKPOINT_ID}"
mkdir -p "$ARCHIVE_ROOT"
DIRS=("popsim-contract" "spec" "src" "lm_test_script")
for d in "${DIRS[@]}"; do
    [ -d "$d" ] && tar --exclude='node_modules' --exclude='.git' --exclude='.next' -cf - "$d" | (cd "$ARCHIVE_ROOT" && tar xf -)
done

# 2. Assertive AWK Regional Insertion (v2.5 Fix: Explicit error handling)
DATE=$(date +"%Y-%m-%d")
NEW_ROW="| ${CHECKPOINT_ID} | ${DATE} | ${GIT_HASH} | ${MEMO} | ✅ ARCHIVED |"
MANIFEST="registry/MANIFEST.md"; TEMP="registry/MANIFEST.md.tmp"

# High-fidelity Regional Insertion + Assertion Loop
if ! awk -v row="$NEW_ROW" '
    { print $0 }
    /## 🕒 CHECKPOINTS/ { found=1 }
    found && /\| :--- \| :--- \|/ { print row; found=0; inserted=1 }
    END { if (!inserted) exit 1 }
' "$MANIFEST" > "$TEMP" && mv "$TEMP" "$MANIFEST"; then
    echo -e "${RED}❌ Error: Could not find '## 🕒 CHECKPOINTS' table header in registry/MANIFEST.md.${NC}"
    rm -f "$TEMP" 2>/dev/null
    exit 1
fi

# 3. Git Persistence (Tags & Commits)
git add registry/
if ! git diff-index --quiet HEAD -- registry/; then
    git commit -m "chore(registry): snapshot $CHECKPOINT_ID
    
Memo: $MEMO"
fi
git tag -a "checkpoint-$(date +"%Y%j")-${GIT_HASH}" -m "OMC Checkpoint $CHECKPOINT_ID: $MEMO" || true
echo -e "${GREEN}✅ MISSION MEMORY SECURED: registry/checkpoints/${CHECKPOINT_ID}${NC}"
echo "--------------------------------------------------------"
