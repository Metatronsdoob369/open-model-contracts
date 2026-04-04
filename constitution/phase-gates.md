# ⚖️ OMC Phase Gates
> Open Model Contracts Constitution v1.0 — Required Artifacts & Validations per Phase

Phase gates are **blocking checkpoints**. An agent or system MUST NOT advance to the next
phase until every requirement in the current gate is satisfied. Gate failures MUST be
recorded in the audit log.

---

## Phase 1 Gate — Intelligence Complete

**Entry Condition:** Agent has read the Level Primer (DNA) and all sovereign RAG documents.

### Required Artifacts

| Artifact | Location | Validation |
|----------|----------|-----------|
| `omc.manifest.json` | `<output_path>/omc.manifest.json` | MUST pass `omc.manifest.schema.json` with zero errors |
| Luau modules | `<output_path>/modules/*.luau` | All files declared in manifest MUST exist |
| SHA-256 hashes | Inside `omc.manifest.json` | Every `files[].sha256` MUST match the actual file hash |

### Validation Checklist

- [ ] `omc.manifest.json` exists at the declared output path
- [ ] `omc.manifest.json` validates against `packs/roblox-game-automator/schemas/omc.manifest.schema.json`
- [ ] All `files[].path` entries exist on disk
- [ ] SHA-256 of every file matches its `files[].sha256` entry in the manifest
- [ ] `pipeline_id` is a valid UUID v4
- [ ] `created_at` is a valid ISO 8601 datetime
- [ ] No specialist module uses `loadstring` (static analysis required)
- [ ] No secrets or raw file paths are embedded in any generated file
- [ ] Audit log contains `phase.started` and `file.written` events for this run

### Gate Decision

| Result | Action |
|--------|--------|
| ✅ All checks pass | Advance to Phase 2 (Escrow) |
| ❌ Any check fails | Abort; emit `phase.aborted` audit event; do NOT submit to Bridge |

---

## Phase 2 Gate — Escrow Armed

**Entry Condition:** Phase 1 gate passed; `omc.manifest.json` is valid.

### Required Artifacts

| Artifact | Source | Validation |
|----------|--------|-----------|
| `session_id` | Bridge server response | MUST be valid UUID v4 |
| `token` | Bridge server response | MUST be present and at least 32 characters |
| `expires_at` | Bridge server response | MUST be in the future |

### Validation Checklist

- [ ] `POST /escrow` returned HTTP 201
- [ ] Response body contains `session_id`, `token`, and `expires_at`
- [ ] `session_id` is a valid UUID v4
- [ ] `token` is at least 32 characters
- [ ] `expires_at` is a datetime in the future
- [ ] Bridge audit log records a `session.created` event
- [ ] Manifest hash sent to Bridge matches the hash of the local `omc.manifest.json`

### Gate Decision

| Result | Action |
|--------|--------|
| ✅ All checks pass | Session is "armed"; share `session_id` + `token` with Studio plugin |
| ❌ Bridge returned an error | Log error; do NOT proceed to Phase 3 |
| ❌ Token or session_id missing | Treat as critical failure; abort pipeline |

---

## Phase 3 Gate — Manifestation Complete

**Entry Condition:** Phase 2 gate passed; Studio plugin has valid `session_id` and `token`.

### Required Artifacts

| Artifact | Source | Validation |
|----------|--------|-----------|
| Plugin diff display | Studio plugin UI | User MUST see create/update/skip summary before Apply is enabled |
| User consent | Studio plugin UI | Explicit click on "Apply" button |
| Consume acknowledgement | `POST /escrow/:sessionId/consume` | MUST return HTTP 200 |

### Validation Checklist

- [ ] Plugin called `GET /escrow/:sessionId/manifest` and received HTTP 200
- [ ] Plugin displayed the install plan diff to the user
- [ ] User explicitly clicked "Apply" (no passive or timed consent)
- [ ] Plugin called `GET /escrow/:sessionId/modules` with valid token
- [ ] SHA-256 of every decoded module matches the install plan entry
- [ ] All declared modules were written to `ReplicatedStorage.OMCModules.<version>`
- [ ] Plugin called `POST /escrow/:sessionId/consume` and received HTTP 200
- [ ] Audit log contains `plugin.user_consented` and `plugin.session_consumed` events

### Gate Decision

| Result | Action |
|--------|--------|
| ✅ All checks pass | Pipeline complete; emit `pipeline.completed` audit event |
| ❌ SHA-256 mismatch | Abort install; do NOT write module; emit `plugin.install_failed` |
| ❌ Session expired or consumed | Show user an error; do NOT install |
| ❌ Consume call fails | Warn user; modules already written — manual cleanup may be needed |

---

## Cross-Phase Invariants

These rules apply at all times, regardless of phase:

| ID | Rule |
|----|------|
| I1 | Every phase transition MUST emit an audit event |
| I2 | `loadstring` MUST never appear in any agent-generated Luau module |
| I3 | Secrets and PII MUST NOT appear in any artifact, log, or escrow payload |
| I4 | All human-approval-required capabilities MUST have a recorded user action |
| I5 | Constitution version used MUST be recorded in the manifest |
| I6 | Expired or consumed escrow sessions are irreversible; a new Phase 1 run is required |

---

*Phase Gates v1.0 — Governed by Open Model Contracts Constitution v1.0*
