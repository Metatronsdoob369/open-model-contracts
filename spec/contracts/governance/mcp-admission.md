# MCP_ADMISSION_CONTRACT

**Status:** CANONICAL
**Version:** 1.0.0
**Domain:** Governance

## 1. Intent
Ensure all MCP (Model Context Protocol) tool interactions are safe, transparent, auditable, and contract-bound within the Domicile ecosystem.

## 2. The Law
1. **No Execution Without Contract**: Tools must match a Zod schema before they are exposed.
2. **SAFE by Default**: All tools start in `SAFE` mode. Destructive actions (ARMED) require explicit authorization.
3. **Auditability**: Every tool call must generate a 'Minimal Output Schema' log.

## 3. Minimal Output Schema (JSON)
```json
{
  "intent": "string",
  "tools": [
    {
      "server": "string",
      "tool": "string",
      "args": { "...": "..." },
      "requires_arm": true
    }
  ],
  "gate": {
    "state": "SAFE|ARMED",
    "expires_at": "ISO8601"
  },
  "result": {
    "ok": true,
    "summary": "string",
    "verification": "pass|fail",
    "errors": []
  }
}
```

## 4. Execution Gates
- **SAFE**: Read-only, diagnostic, or non-destructive actions.
- **ARMED**: File writes, de-registration, or state-changing executions. Requires explicit 'ARM' flag and audit log.

## 5. Non-Negotiables
- No hidden tool calls.
- Schema match mandatory.
- Audit history is immutable.
