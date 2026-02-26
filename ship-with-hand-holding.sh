#!/bin/bash
###############################################################################
# SHIP WITH HAND-HOLDING
#
# For people who just learned GitHub exists today.
# This script will walk you through EVERY step.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SHIP WITH HAND-HOLDING — Open Model-Contracts v1.0       ║"
echo "║                                                            ║"
echo "║  This script will guide you through shipping to GitHub    ║"
echo "║  No prior GitHub knowledge required.                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================================================
# STEP 1: Check directory
# ============================================================================

echo -e "${YELLOW}[STEP 1/7] Checking if we're in the right place...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in the right directory${NC}"
    echo "Please run this from: /Users/joewales/NODE_OUT_Master/open-model-contracts/"
    exit 1
fi

echo -e "${GREEN}✅ We're in the right place!${NC}"
echo ""
sleep 1

# ============================================================================
# STEP 2: Git setup
# ============================================================================

echo -e "${YELLOW}[STEP 2/7] Setting up git...${NC}"

if [ ! -d ".git" ]; then
    git init
    git branch -M main
    echo -e "${GREEN}✅ Git initialized!${NC}"
else
    echo -e "${GREEN}✅ Git already set up!${NC}"
fi
echo ""
sleep 1

# ============================================================================
# STEP 3: Commit files
# ============================================================================

echo -e "${YELLOW}[STEP 3/7] Saving all your files...${NC}"

# Create .gitignore if needed
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
*.log
.env
EOF
fi

git add .

# Check if there's anything to commit
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}✅ Files already saved!${NC}"
else
    git commit -m "feat: open-model-contracts v1.0.0-alpha

First public release of contract-driven AI governance spec.

Includes:
- 6 specification documents
- Reference implementation (AI Operations Manager)
- Domicile governance bundle
- MIT license" || echo -e "${GREEN}✅ Files saved!${NC}"
fi
echo ""
sleep 1

# ============================================================================
# STEP 4: Get GitHub username
# ============================================================================

echo -e "${YELLOW}[STEP 4/7] Let's connect to GitHub...${NC}"
echo ""
echo "First, I need your GitHub username."
echo ""
echo -e "${BLUE}What's your GitHub username?${NC}"
echo "(Example: Metatronsdoob369)"
echo ""
read -p "Username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}❌ You need to enter your GitHub username${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Got it! Username: $GITHUB_USER${NC}"
echo ""
sleep 1

# ============================================================================
# STEP 5: Create GitHub repo
# ============================================================================

echo -e "${YELLOW}[STEP 5/7] Time to create the repo on GitHub...${NC}"
echo ""
echo "I'm going to open GitHub in your browser."
echo "Follow these steps:"
echo ""
echo -e "${BLUE}1. Click 'New repository' (green button)${NC}"
echo -e "${BLUE}2. Repository name: ${GREEN}open-model-contracts${NC}"
echo -e "${BLUE}3. Description: ${GREEN}The legal framework for AI model execution${NC}"
echo -e "${BLUE}4. Make sure 'Public' is selected${NC}"
echo -e "${BLUE}5. DON'T check any boxes (no README, no .gitignore, no license)${NC}"
echo -e "${BLUE}6. Click 'Create repository'${NC}"
echo ""
echo -e "${YELLOW}Opening browser in 3 seconds...${NC}"
sleep 3

open "https://github.com/new"

echo ""
echo -e "${YELLOW}Did you create the repo?${NC}"
echo ""
read -p "Type 'yes' when done: " REPO_CREATED

if [[ ! "$REPO_CREATED" =~ ^[Yy] ]]; then
    echo -e "${RED}OK, go create it and come back. Run this script again when ready.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Repo created!${NC}"
echo ""
sleep 1

# ============================================================================
# STEP 6: Push to GitHub
# ============================================================================

echo -e "${YELLOW}[STEP 6/7] Uploading your code to GitHub...${NC}"
echo ""

REPO_URL="https://github.com/$GITHUB_USER/open-model-contracts.git"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add remote
git remote add origin "$REPO_URL"

echo "Pushing to: $REPO_URL"
echo ""
echo -e "${YELLOW}Note: GitHub might ask for your password.${NC}"
echo -e "${YELLOW}If you haven't set up authentication, see GITHUB_BABY_STEPS.md${NC}"
echo ""

# Try to push
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✅ Code uploaded to GitHub!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Push failed. This is usually an authentication issue.${NC}"
    echo ""
    echo "Quick fix:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Check the 'repo' box"
    echo "4. Generate token and copy it"
    echo "5. Run this command:"
    echo ""
    echo -e "${BLUE}   git push -u origin main${NC}"
    echo ""
    echo "When asked for password, paste your token (not your actual password)"
    echo ""
    exit 1
fi

sleep 1

# ============================================================================
# STEP 7: Create release tag
# ============================================================================

echo -e "${YELLOW}[STEP 7/7] Creating release tag...${NC}"
echo ""

git tag -a v1.0.0-alpha -m "v1.0.0-alpha - First public release" 2>/dev/null || echo "Tag already exists"
git push origin v1.0.0-alpha 2>/dev/null || echo "Tag already pushed"

echo -e "${GREEN}✅ Release tag created!${NC}"
echo ""
sleep 1

# ============================================================================
# SUCCESS!
# ============================================================================

clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              🎉 YOU JUST SHIPPED TO GITHUB! 🎉             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Your repo is live at:"
echo -e "${BLUE}https://github.com/$GITHUB_USER/open-model-contracts${NC}"
echo ""
echo "What you just did:"
echo "  ✅ Created a GitHub repo"
echo "  ✅ Uploaded all your code"
echo "  ✅ Tagged version v1.0.0-alpha"
echo "  ✅ Made it public and open source"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a release on GitHub (optional but cool):"
echo "   https://github.com/$GITHUB_USER/open-model-contracts/releases/new"
echo "   - Tag: v1.0.0-alpha"
echo "   - Title: v1.0.0-alpha — First Public Release"
echo "   - Copy description from CHANGELOG.md"
echo ""
echo "2. Share it on social media:"
echo "   - Tweet templates are in TWEET.md"
echo "   - Post to LinkedIn, Twitter, Reddit"
echo ""
echo "3. Add to your portfolio"
echo ""
echo "4. Go back to domicile_live and build cool stuff without guilt"
echo ""
echo -e "${GREEN}The balloon is reinflated and airborne. 🎈🚀${NC}"
echo ""

# Open repo in browser
open "https://github.com/$GITHUB_USER/open-model-contracts"
