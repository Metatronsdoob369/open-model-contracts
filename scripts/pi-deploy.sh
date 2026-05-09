#!/bin/bash
# pi-deploy.sh: Grafts the complete Sovereign Intelligence stack onto Broseidon (Pi)

set -e

TARGET_HOST="bottleneck-15"
TARGET_USER="joewales"

# Source Paths
FRAMEWORK_SRC="Sovereign_WhiteGlove_Framework"
ARCHIVE_SRC="/Volumes/ARCHIVE/Emergency_Information"

# Target Paths
FRAMEWORK_DEST="~/Sovereign_WhiteGlove_Framework"
ARCHIVE_DEST="~/Emergency_Information"
BIN_DEST="~/bin/whiteglove"

echo "🛰️  GRAFTING DUAL-PROJECT STACK TO BROSEIDON ($TARGET_HOST)..."

# 1. Create target directories
echo "📁 Preparing remote directories..."
ssh $TARGET_USER@$TARGET_HOST "mkdir -p $FRAMEWORK_DEST $ARCHIVE_DEST ~/bin"

# 2. Sync Project 1: Sovereign_WhiteGlove_Framework
echo "📦 Syncing Project 1: Framework..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  "$FRAMEWORK_SRC/" \
  $TARGET_USER@$TARGET_HOST:"$FRAMEWORK_DEST/"

# 3. Sync Project 2: Emergency_Information
echo "📚 Syncing Project 2: Full Archive..."
rsync -avz --progress \
  --exclude '.git' \
  --exclude '.DS_Store' \
  "$ARCHIVE_SRC/" \
  $TARGET_USER@$TARGET_HOST:"$ARCHIVE_DEST/"

# 4. Sync the bin wrapper
echo "🚀 Syncing CLI wrapper..."
rsync -avz bin/whiteglove $TARGET_USER@$TARGET_HOST:"$BIN_DEST"
ssh $TARGET_USER@$TARGET_HOST "chmod +x $BIN_DEST"

# 5. Remote Environment Audit
echo "🧪 Auditing Pi environment..."
ssh $TARGET_USER@$TARGET_HOST "
  export PATH=\$PATH:~/bin
  cd $FRAMEWORK_DEST
  
  echo '--- NPM Install ---'
  npm install --omit=dev
  
  echo '--- Path Configuration ---'
  if ! grep -q '~/bin' ~/.bashrc; then
    echo 'export PATH=\"\$PATH:~/bin\"' >> ~/.bashrc
    echo 'Added ~/bin to .bashrc'
  fi
  
  echo '--- WhiteGlove Doctor ---'
  ~/bin/whiteglove doctor
"

echo "✅ MISSION COMPLETE: Sovereign Stack is now isolated on Broseidon."
