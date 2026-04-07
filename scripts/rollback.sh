#!/bin/bash

###############################################################################
# ROLLBACK — Restore a prior checkpoint.
#
# Usage: ./scripts/rollback.sh <CheckpointID>
#
# This script:
# 1. Backs up current state (just in case)
# 2. Replaces active contract/spec directories with the archived versions.
#
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CHECKPOINT_ID=$1

if [ -z "$CHECKPOINT_ID" ]; then
    echo "❌ Error: Specify a Checkpoint ID."
    echo "Usage: ./scripts/rollback.sh InitialRegistrySetup_checkpoint_..."
    echo ""
    echo "Check registry/MANIFEST.md for IDs."
    exit 1
fi

ARCHIVE_PATH="registry/checkpoints/$CHECKPOINT_ID"

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Error: Checkpoint '$CHECKPOINT_ID' not found in registry/checkpoints/.${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  PROCEEDING TO ROLLBACK TO: $CHECKPOINT_ID${NC}"
echo "--------------------------------------------------------"

# 1. Backup current state (Safety first!)
BACKUP_ID="pre-rollback-snapshot-$(date +"%Y%m%d-%H%M%S")"
echo -e "${GREEN}[1/3]${NC} Creating safety snapshot: $BACKUP_ID..."
./scripts/checkpoint.sh -m "Auto-backup before rolling back to $CHECKPOINT_ID" -n "$BACKUP_ID"

# 2. Clear current directories
echo -e "${GREEN}[2/3]${NC} Clearing active directories (popsim-contract, spec, src)..."
# Careful selection here
for dir in "popsim-contract" "spec" "src"; do
    if [ -d "$dir" ] && [ -d "$ARCHIVE_PATH/$dir" ]; then
        echo "   - Deleting active $dir..."
        rm -rf "$dir"
    fi
done

# 3. Restore from archive
echo -e "${GREEN}[3/3]${NC} Restoring from $ARCHIVE_PATH..."
for dir in "popsim-contract" "spec" "src"; do
    if [ -d "$ARCHIVE_PATH/$dir" ]; then
        echo "   - Restoring $dir..."
        cp -R "$ARCHIVE_PATH/$dir" .
    fi
done

echo ""
echo -e "${GREEN}✅ ROLLBACK COMPLETE!${NC}"
echo "Your project is now in the state of $CHECKPOINT_ID."
echo "Note: node_modules were NOT restored. Run 'npm install' if needed."
echo ""
