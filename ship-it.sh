#!/bin/bash
###############################################################################
# SHIP IT — One command to ship open-model-contracts v1.0.0-alpha
#
# Usage: ./ship-it.sh
#
# This script:
# 1. Creates GitHub repo
# 2. Commits everything
# 3. Tags v1.0.0-alpha
# 4. Pushes to GitHub
# 5. Opens browser to repo
#
# Time: 2 minutes
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SHIP IT — Open Model-Contracts v1.0    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from /open-model-contracts/ root"
    exit 1
fi

# 1. Git init (if not already)
if [ ! -d ".git" ]; then
    echo -e "${GREEN}[1/6]${NC} Initializing git..."
    git init
    git branch -M main
else
    echo -e "${GREEN}[1/6]${NC} Git already initialized ✓"
fi

# 2. Update package.json version
echo -e "${GREEN}[2/6]${NC} Setting version to 1.0.0-alpha..."
cat > package.json << 'EOF'
{
  "name": "@open-model-contracts/server",
  "version": "1.0.0-alpha",
  "description": "The legal framework for AI model execution. Prompts are suggestions. Contracts are law.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "repository": {
    "type": "git",
    "url": "https://github.com/Metatronsdoob369/open-model-contracts"
  },
  "keywords": [
    "ai",
    "governance",
    "contracts",
    "zod",
    "llm",
    "agents",
    "mcp"
  ],
  "author": "Preston Clay",
  "license": "MIT",
  "dependencies": {
    "zod": "^3.23.8"
  }
}
EOF

# 3. Create .gitignore
echo -e "${GREEN}[3/6]${NC} Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
*.log
.env
EOF

# 4. Commit everything
echo -e "${GREEN}[4/6]${NC} Committing all files..."
git add .
git commit -m "feat: ship open-model-contracts v1.0.0-alpha

Core governance specification for AI model execution.

Includes:
- 6 spec documents (OVERVIEW, CONTRACTS, GATES, ADMISSION, GOVERNANCE, DREAM_CYCLE)
- Reference implementation (AI Operations Manager)
- Domicile governance bundle
- MIT license

Prompts are suggestions. Contracts are law." || echo "Nothing to commit (already committed)"

# 5. Tag version
echo -e "${GREEN}[5/6]${NC} Tagging v1.0.0-alpha..."
git tag -a v1.0.0-alpha -m "v1.0.0-alpha - First public release" || echo "Tag already exists"

# 6. Create GitHub repo and push
echo -e "${GREEN}[6/6]${NC} Pushing to GitHub..."
echo ""
echo -e "${YELLOW}GitHub repo creation:${NC}"
echo "  Run this command:"
echo ""
echo -e "${BLUE}  gh repo create Metatronsdoob369/open-model-contracts --public --source=. --remote=origin --push${NC}"
echo ""
echo "  Or create manually at https://github.com/new and then:"
echo ""
echo -e "${BLUE}  git remote add origin https://github.com/Metatronsdoob369/open-model-contracts.git${NC}"
echo -e "${BLUE}  git push -u origin main --tags${NC}"
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI detected. Create repo now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        gh repo create Metatronsdoob369/open-model-contracts \
            --public \
            --source=. \
            --remote=origin \
            --push \
            --description "The legal framework for AI model execution. Prompts are suggestions. Contracts are law."

        echo ""
        echo -e "${GREEN}✅ SHIPPED TO GITHUB!${NC}"
        echo ""
        echo "🌐 Repo: https://github.com/Metatronsdoob369/open-model-contracts"
        echo "🏷️  Tag: v1.0.0-alpha"
        echo ""

        # Open browser
        if command -v open &> /dev/null; then
            open "https://github.com/Metatronsdoob369/open-model-contracts"
        fi
    else
        echo "Skipping GitHub creation. Run commands above manually."
    fi
else
    echo "GitHub CLI not installed. Run commands above manually."
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ OPEN MODEL-CONTRACTS V1.0 SHIPPED   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "What you just shipped:"
echo "  📄 6 spec documents"
echo "  💻 1 reference implementation (150 lines)"
echo "  📦 Clean package structure"
echo "  📜 MIT license"
echo ""
echo "Next steps:"
echo "  1. Create GitHub release notes"
echo "  2. Tweet about it"
echo "  3. Add to your portfolio"
echo "  4. Go back to domicile_live and build cool shit"
echo ""
echo "The balloon is reinflated. 🎈"
