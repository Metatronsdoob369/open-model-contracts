#!/bin/bash
# OMC Group Listener — polls @robloxsdk_bot for /omc messages in 40 4D Creations
# Routes them to the bridge message log so Preston's Claude can read and reply

BOT_TOKEN="8617712008:AAE-VYqYbT4m4lTDtf7mAGpDgr5qpQGV1Bw"
GROUP_ID="-5177857862"
BRIDGE_URL="http://localhost:8080"
OMC_KEY="d3d7986c8b8623c4f2a8cecebda22fa89c6a36ecbfa3404bbd760966454a7bed"
OFFSET_FILE="/tmp/omc-group-offset.txt"

get_offset() { cat "$OFFSET_FILE" 2>/dev/null || echo "0"; }
save_offset() { echo "$1" > "$OFFSET_FILE"; }

send_to_group() {
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\": \"${GROUP_ID}\", \"text\": \"$1\", \"parse_mode\": \"Markdown\"}" > /dev/null
}

post_to_bridge() {
  local FROM="$1" BODY="$2"
  curl -s -X POST "${BRIDGE_URL}/message" \
    -H "Content-Type: application/json" \
    -H "x-omc-key: ${OMC_KEY}" \
    -d "{\"from\":\"${FROM}\",\"to\":\"preston-agent\",\"body\":$(echo "$BODY" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"type\":\"message\",\"topic\":\"omc-group\"}"
}

echo "[OMC Listener] Started — watching 40 4D Creations for /omc commands"

while true; do
  OFFSET=$(get_offset)
  UPDATES=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${OFFSET}&timeout=30&allowed_updates=message")

  echo "$UPDATES" | python3 -c "
import sys, json, subprocess, os

data = json.load(sys.stdin)
results = data.get('result', [])

for u in results:
    uid = u.get('update_id', 0)
    msg = u.get('message') or {}
    chat = msg.get('chat', {})
    text = msg.get('text', '')
    user = msg.get('from', {}).get('first_name', 'unknown')
    username = msg.get('from', {}).get('username', user)

    # Only process /omc messages from our group
    if chat.get('id') == -5177857862 and text.startswith('/omc'):
        body = text[4:].strip()
        sender = 'joe' if username in ('joecwales','phooten4') else 'marsh'
        print(f'ROUTE|{uid}|{sender}|{body}')
    else:
        print(f'SKIP|{uid}')
" | while IFS='|' read -r action uid sender body; do
    if [ "$action" = "ROUTE" ] && [ -n "$body" ]; then
      echo "[OMC Listener] /omc from ${sender}: ${body}"
      post_to_bridge "${sender}" "${body}"
      send_to_group "👁 *OMC received* — logged to bridge. Preston's agent will reply shortly."
    fi
    save_offset "$((uid + 1))"
  done

  sleep 3
done
