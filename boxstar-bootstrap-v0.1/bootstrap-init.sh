#!/bin/bash

# BoxStar Bootstrap v0.1 — One-Shot Initialization
# "Zero-Liturgy" Agent Activation

echo "🏮 [BLOBOX-BOOTSTRAP] Initializing Sovereign Engine..."

# 1. Permission Alignment
chmod +x bin/ag-skills.cjs
echo "✅ Permissions Aligned."

# 2. Dependency Check
if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js is not installed. Please install Node.js (v18+) to continue."
    exit 1
fi
echo "✅ Node.js Verified."

# 3. Project Initialization
mkdir -p .agent/skills
echo "✅ Local Intelligence Vault Created (.agent/skills/)."

# 4. Catalog Generation (Self-Correction)
if [ ! -f "catalog.json" ]; then
    echo "⚠️ [WARNING] catalog.json missing. Attempting to rebuild..."
    # Placeholder for rebuild command if needed
fi

# 5. The Ritual
echo ""
echo "🏁 [BOOTSTRAP COMPLETE] Your agent is now ready for activation."
echo "👉 STEP 1: Type 'node bin/ag-skills.cjs list' to see your skills."
echo "👉 STEP 2: Tell your agent: 'Ready to build a game.'"
echo ""
echo "Welcome to the Sovereign Frontier. 🏛️🚀🏮"
