#!/bin/bash
# SCRAPE EXECUTION ENTRYPOINT

URL=$1

# High-fidelity extraction
curl -s "$URL" | \
     python3 -c "import sys, lxml.html; from markdownify import markdownify; print(markdownify(sys.stdin.read()))"

echo "[SYSTEM] Scrape completed for URL: $URL"
