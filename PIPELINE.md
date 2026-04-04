# 📜 The OMC Pipeline — Intelligence → Escrow → Manifestation
### *The Mechanics of Autonomous Manifestation.*

This document maps the three-phase execution model of **Open Model Contracts**, from agent
intelligence through governed escrow to live domain installation.

---

## 🗺️ The 3-Phase Execution Map

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INTELLIGENCE  (Agent → MCP → Files)                           │
│                                                                          │
│  1. Agent reads LEVEL_PRIMER.md (DNA) + sovereign RAG docs              │
│  2. Agent writes Luau modules to local repo via MCP write_file tools    │
│  3. Agent computes SHA-256 hashes for every file                        │
│  4. Agent produces omc.manifest.json (schema-validated)                 │
│                                                                          │
│  Gate: manifest passes omc.manifest.schema.json validation              │
│  Artifact: omc.manifest.json                                            │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ omc.manifest.json
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: ESCROW  (Agent → Bridge Server)                               │
│                                                                          │
│  1. Agent POSTs manifest + module bundle to Bridge server               │
│     POST http://localhost:3099/escrow                                   │
│  2. Bridge validates payload against escrow-envelope.schema.json        │
│  3. Bridge stores session in memory (TTL + one-time token)              │
│  4. Bridge returns { session_id, token, expires_at }                    │
│                                                                          │
│  Gate: session_id + token received; session is "armed"                  │
│  Artifact: EscrowEnvelope (in Bridge memory)                            │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ session_id + token
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: MANIFESTATION  (Bridge → Roblox Studio Plugin)                │
│                                                                          │
│  1. Plugin fetches install plan:                                         │
│     GET /escrow/:sessionId/manifest                                     │
│  2. Plugin displays diff to user (create / update / skip summary)       │
│  3. User clicks "Apply" (explicit consent — no auto-apply)              │
│  4. Plugin pulls modules:                                               │
│     GET /escrow/:sessionId/modules?token=<token>                        │
│  5. Plugin verifies SHA-256 of each module                             │
│  6. Plugin writes ModuleScripts → ReplicatedStorage.OMCModules         │
│  7. Plugin consumes session:                                            │
│     POST /escrow/:sessionId/consume                                     │
│                                                                          │
│  Gate: user consent + consume acknowledgement                           │
│  Artifact: ModuleScripts in Roblox Studio hierarchy                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🌉 Bridge Server (Local Reference Implementation)

The Bridge server lives at `server/bridge/`. It is a Node.js/TypeScript Express server.

### Running the Bridge

```bash
# One-time install
npm run bridge:install

# Build TypeScript
npm run bridge:build

# Start server (default port: 3099)
npm run bridge:start

# Or run directly
cd server/bridge && npm install && npm run build && npm start
```

The server listens on `http://localhost:3099` by default.  
Set `PORT=<n>` to override. Set `OMC_AUDIT_LOG=<path>` to change the audit log file.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/escrow` | Create escrow session. Body: `EscrowEnvelope` (minus server-assigned fields). Returns `session_id`, `token`, `expires_at`. |
| `GET` | `/escrow/:sessionId/manifest` | Retrieve the stored manifest. |
| `GET` | `/escrow/:sessionId/modules` | Retrieve the module bundle. Requires `?token=<token>`. Optional: `?capability=<tag>` or `?ids=<id1,id2>` to filter. |
| `POST` | `/escrow/:sessionId/consume` | Mark session consumed. Body: `{ token }`. |
| `GET` | `/health` | Health check. |

### Session Security

- Each session receives a **unique UUID v4** session id and a **64-char random hex token**.
- The token is required for `/modules` and `/consume` (one-time replay guard).
- Sessions expire after `ttl_seconds` (default min: 60s, max: 86400s).
- Expired sessions return **HTTP 410 Gone** or **404 Not Found**.

### Audit Log

Every action writes a JSONL record to stdout **and** to `$OMC_AUDIT_LOG` (default:
`<tmpdir>/omc-bridge-audit.jsonl`). Record fields: `session_id`, `timestamp`,
`event_type`, `manifest_hash`, `pipeline_id`, `pack_id`, `ip_address`.

---

## 📦 Artifacts

| Artifact | Phase | Schema |
|----------|-------|--------|
| `omc.manifest.json` | 1 (Intelligence) | `packs/roblox-game-automator/schemas/omc.manifest.schema.json` |
| `EscrowEnvelope` | 2 (Escrow) | `packs/roblox-game-automator/schemas/escrow-envelope.schema.json` |
| `PluginPullResponse` | 3 (Manifestation) | `packs/roblox-game-automator/schemas/plugin-pull-response.schema.json` |

---

## 🔌 Roblox Studio Plugin — Compliant Pull + Consent Install

The Studio plugin interacts with the Bridge via standard HTTP (`HttpService` or a
custom plugin HTTP implementation). The workflow is:

1. User enters the `session_id` and `token` in the plugin UI (copy-pasted from the agent output).
2. Plugin calls `GET /escrow/:sessionId/manifest` to load the install plan.
3. Plugin renders a **diff view** in its widget: which modules will be created, updated, or skipped.
4. User reviews and clicks **"Apply"**. This is the explicit consent gate — no writes happen before this.
5. Plugin calls `GET /escrow/:sessionId/modules?token=<token>`.
6. Plugin decodes each module (base64), verifies SHA-256, and writes `ModuleScript` instances
   into `game.ReplicatedStorage.OMCModules.<packVersion>`.
7. Plugin calls `POST /escrow/:sessionId/consume` with the token.
8. Plugin reports success or failure in its widget.

**Constraints (from `phase3.manifestation.policy.yaml`):**
- MUST NOT use `loadstring` or dynamic code execution.
- MUST NOT write outside `ReplicatedStorage.OMCModules`.
- MUST verify SHA-256 of every module before writing.
- MUST present diff to user before enabling the Apply button.

---

## 🏮 Telegram Governance Add-on (Legacy / Optional)

The Telegram command centre remains an optional extension for remote sovereign control:

| Command | Effect |
|---------|--------|
| `/manifest [Prompt]` | Triggers Phase 1 Intelligence from a text prompt |
| `/primer [Filename]` | Pushes a pre-saved Level Primer JSON to start Phase 1 |
| `/status [ID]` | Reports generation state (0 / N modules complete) |
| `/evidence` | Requests a Studio screenshot as Phase 3 verification |

The Telegram bot posts the **Contract ID** and **Manifest hash** to the channel on
ARMED state, creating an auditable record of every agent action.

---

*Pipeline v1.0 — Governed by Open Model Contracts Constitution v1.0*

