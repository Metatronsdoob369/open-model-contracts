#!/bin/bash
# OMC Studio Watcher — fires pre-session checklist when RobloxStudio opens

STUDIO_PROCESS="RobloxStudio"
WAS_RUNNING=false

while true; do
    if pgrep -x "$STUDIO_PROCESS" > /dev/null 2>&1; then
        if [ "$WAS_RUNNING" = false ]; then
            WAS_RUNNING=true
            /usr/bin/osascript <<'APPLESCRIPT'
display dialog "🎮 OMC PRE-SESSION CHECKLIST

1. BRIDGE RUNNING?
   curl http://localhost:8080/health
   → should return {\"status\":\"ok\"}
   If not: cd .../server/bridge && npx tsx src/index.ts

2. ROJO SERVING?
   rojo serve --port 7777
   No Rojo = Studio not synced.

3. PULL MAIN FIRST
   git checkout main && git pull origin main
   Marsh may have merged something.

4. OPEN PRs?
   gh pr list
   If green → merge before you start." buttons {"Let's go"} default button 1 with title "OMC — Before You Build"
APPLESCRIPT
        fi
    else
        WAS_RUNNING=false
    fi
    sleep 5
done
