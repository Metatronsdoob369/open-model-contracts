#!/bin/bash
# SHATTER EXECUTION ENTRYPOINT

echo "[SYSTEM] Initiating SHATTER Protocol..."

cd ~/CRON_OS_SANDBOX && npx tsx scripts/lab-shatter-orchestrator.ts

echo "[SYSTEM] SHATTER Protocol Complete."
