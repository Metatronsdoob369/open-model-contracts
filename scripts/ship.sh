#!/bin/bash

###############################################################################
# SHIP (v2.0 - High Fidelity)
#
# Usage: ./scripts/ship.sh -m "What we built/learned" [-n "Name"]
#
# Motto: Getting paid to have problems.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check for root
if [ ! -d "registry" ]; then
    echo -e "${RED}❌ Error: Run from /open-model-contracts/ root.${NC}"
    exit 1
fi

# 1. Enforce -m (Memo) Flag
MEMO=""
while getopts m:n: flag
do
    case "${flag}" in
        m) MEMO=${OPTARG};;
    esac
done

if [ -z "$MEMO" ]; then
    echo -e "${RED}❌ Error: A memo (-m) is REQUIRED before shipping.${NC}"
    echo "Usage: ./scripts/ship.sh -m \"Description of changes / Lesson learned\""
    exit 1
fi

# 2. Run Checkpoint FIRST (Pass all flags through)
echo -e "${BLUE}🚀 PREPARING SHIPMENT...${NC}"
./scripts/checkpoint.sh "$@"

# 3. Synchronize to GitHub
echo -e "${BLUE}🛰️  SHIPPING TO GITHUB (origin main)...${NC}"
git push origin main --tags

echo ""
echo -e "${GREEN}✅ MISSION DEPLOYED!${NC}"
echo "--------------------------------------------------------"
echo "🌐 Remote: https://github.com/Metatronsdoob369/open-model-contracts"
echo "🧩 Memory: registry/MANIFEST.md"
echo "--------------------------------------------------------"
echo ""
