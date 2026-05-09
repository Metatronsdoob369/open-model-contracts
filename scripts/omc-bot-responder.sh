#!/bin/bash
# OMC Bot Responder — @claudeblox_bot listens in 40 4D Creations
# Any message → Claude API via curl → reply posted back to group

BOT_TOKEN="8455991343:AAEGI-I7-VCc9Rb-nhqEyl2ox0631ue_tow"
GROUP_ID="-1003916301703"
XAI_KEY="xai-TV3vowiSkrURLe47F4FB8cexBAfLJYgG360fdRRB0n7EZRxxd76flrC4uWlb1DdbQUXrJqbO4G1FlvIC"
OFFSET_FILE="/tmp/omc-claudeblox-offset.txt"
BRIDGE_URL="http://localhost:8080"
OMC_KEY="d3d7986c8b8623c4f2a8cecebda22fa89c6a36ecbfa3404bbd760966454a7bed"

get_offset() { cat "$OFFSET_FILE" 2>/dev/null || echo "0"; }
save_offset() { echo "$1" > "$OFFSET_FILE"; }

send_to_group() {
  local TEXT="$1"
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\": \"${GROUP_ID}\", \"text\": $(echo "$TEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'), \"parse_mode\": \"Markdown\"}" > /dev/null
}

ask_claude() {
  local SENDER="$1" TEXT="$2"
  local PAYLOAD
  PAYLOAD=$(python3 -c "
import json, sys
sender = sys.argv[1]
text = sys.argv[2]
print(json.dumps({
    'model': 'grok-3-fast',
    'max_tokens': 400,
    'messages': [
        {'role': 'system', 'content': 'You are Preston\\'s agent in the OMC Roblox game collaboration. Joe (Preston) and Marsh are building a Roblox game together. You are the technical agent on Preston\\'s side. Keep replies short and direct — this is a group chat. Do not use markdown headers.'},
        {'role': 'user', 'content': f'{sender} says: {text}'}
    ]
}))
" "$SENDER" "$TEXT" 2>/dev/null)

  curl -s -X POST "https://api.x.ai/v1/chat/completions" \
    -H "Authorization: Bearer ${XAI_KEY}" \
    -H "content-type: application/json" \
    -d "$PAYLOAD" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(data.get('choices', [{}])[0].get('message', {}).get('content', ''))
" 2>/dev/null
}

post_to_bridge() {
  local FROM="$1" BODY="$2"
  local PAYLOAD
  PAYLOAD=$(python3 -c "import json,sys; print(json.dumps({'from':sys.argv[1],'to':'group','body':sys.argv[2],'type':'message','topic':'omc-group'}))" "$FROM" "$BODY" 2>/dev/null)
  curl -s -X POST "${BRIDGE_URL}/message" \
    -H "Content-Type: application/json" \
    -H "x-omc-key: ${OMC_KEY}" \
    -d "$PAYLOAD" > /dev/null
}

echo "[OMC Responder] Started — @claudeblox_bot listening in 40 4D Creations"

while true; do
  OFFSET=$(get_offset)
  UPDATES=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${OFFSET}&timeout=20")

  NEXT_OFFSET=$(echo "$UPDATES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
results = data.get('result', [])
if results:
    print(results[-1]['update_id'] + 1)
else:
    print('${OFFSET}')
" 2>/dev/null)

  echo "$UPDATES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for u in data.get('result', []):
    msg = u.get('message') or {}
    chat = msg.get('chat', {})
    text = (msg.get('text') or '').strip()
    name = (msg.get('from') or {}).get('first_name', 'unknown')
    is_bot = (msg.get('from') or {}).get('is_bot', False)
    # Only respond to humans in our group
    if chat.get('id') == -1003916301703 and text and not is_bot:
        print(f'{name}|||{text}')
" | while IFS='|||' read -r sender body; do
    [ -z "$body" ] && continue
    echo "[OMC Responder] ${sender}: ${body}"

    REPLY=$(ask_claude "$sender" "$body")

    if [ -z "$REPLY" ]; then
      echo "[OMC Responder] Claude API returned empty"
      continue
    fi

    echo "[OMC Responder] Replying: ${REPLY:0:80}..."
    send_to_group "$REPLY"
    post_to_bridge "preston-agent" "$REPLY"
  done

  [ -n "$NEXT_OFFSET" ] && save_offset "$NEXT_OFFSET"
  sleep 2
done
