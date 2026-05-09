#!/bin/bash
# HEARTBEAT EXECUTION ENTRYPOINT

echo "[SYSTEM] Pulsing Lab Heartbeat..."

cd ~/CRON_OS_SANDBOX && npx tsx scripts/lab-heartbeat.ts

echo "[SYSTEM] Heartbeat Pulse Complete."
