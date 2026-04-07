#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${BLUE}🔧 INSTALLING OMC REGISTRY HOOKS (v2.4)...${NC}"

# Universal Configuration: Points Git to our versioned 'scripts/hooks/' dir
# This is more scalable than copying files into .git/hooks/
git config core.hooksPath scripts/hooks

echo -e "${GREEN}✅ Git hooks path set to 'scripts/hooks/'${NC}"
echo -e "${YELLOW}Mission status: Every push to 'main' now triggers a registry checkpoint automatically.${NC}"
echo ""
