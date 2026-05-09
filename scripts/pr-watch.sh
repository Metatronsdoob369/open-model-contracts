#!/bin/bash
# OMC PR Watcher — polls for new feat/marsh-* PRs, fires Telegram when found
# Runs every 60s. Tracks seen PRs in /tmp/omc-seen-prs.txt

BOT_TOKEN="8617712008:AAE-VYqYbT4m4lTDtf7mAGpDgr5qpQGV1Bw"
CHAT_ID="-1003916301703"
SEEN_FILE="/tmp/omc-seen-prs.txt"
REPO="Metatronsdoob369/open-model-contracts"

touch "$SEEN_FILE"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\": \"${CHAT_ID}\", \"text\": \"$1\", \"parse_mode\": \"Markdown\"}" > /dev/null
}

while true; do
  # Get open PRs from feat/marsh-* branches
  PRS=$(gh pr list --repo "$REPO" --state open --json number,title,url,headRefName \
    --jq '.[] | select(.headRefName | startswith("feat/marsh-")) | "\(.number)|\(.title)|\(.url)"' 2>/dev/null)

  while IFS='|' read -r number title url; do
    [ -z "$number" ] && continue
    if ! grep -q "^${number}$" "$SEEN_FILE"; then
      echo "$number" >> "$SEEN_FILE"
      MSG="👀 *New PR from Marsh — ready to review*\n\n*#${number}:* ${title}\n\n[Open PR](${url})"
      send_telegram "$MSG"
      echo "[PR Watch] New PR #${number}: ${title}"
    fi
  done <<< "$PRS"

  sleep 60
done
