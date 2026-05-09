# HEARTBEAT SKILL v0.1
**Type**: Resilience (SAFE)
**Target**: CRON_OS_SANDBOX
**Intelligence**: xAI grok-4-fast

## Purpose
Automated lab resilience check and service health monitoring.

## Admission Contract
- Executes `scripts/lab-heartbeat.ts`.
- Reports status to Telegram via @BroJoe_Bot (Broseidon) every 30m.
- SAFE gate only (read-only health check).
