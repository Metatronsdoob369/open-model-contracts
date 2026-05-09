#!/bin/bash
# RESEARCH ORCHESTRATOR ENTRYPOINT

TOPIC=$1

echo "[SYSTEM] Initiating Research Pulse for: $TOPIC"

# 1. Dork for targets
DORK_RESULTS=$(openclaw skill run g-dork "$TOPIC")

# 2. Scrape findings
# (Looping through dork results and scraping - simplified for entrypoint)
echo "$DORK_RESULTS" | grep -o 'http[^"]*' | while read -r URL; do
    openclaw skill run scrape "$URL" >> ~/domicile_live/research/raw_intel.md
done

# 3. Index & Summarize
openclaw skill run grok-indexer ~/domicile_live/research/raw_intel.md

echo "[SYSTEM] Research Pulse Complete. Brief available in Open Notebook."
