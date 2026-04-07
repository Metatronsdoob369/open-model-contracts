# ⚖️ Open Model Contracts (OMC)
### *A Constitution for Autonomous Manifestation.*

Open Model Contracts (OMC) is a domain-agnostic framework designed to govern AI agent swarms through structured, typed agreements. It transforms AI labor from "probabilistic prompts" into "deterministic contracts."

---

## 🗺️ The 3-Phase Execution Model

OMC governs AI-assisted work through three mandatory, gated phases:

| Phase | Name | Description | Key Artifact |
|-------|------|-------------|-------------|
| 1 | **Intelligence** | Agent reads Level Primer (DNA) + sovereign docs; writes Luau modules to local repo; produces validated manifest | `omc.manifest.json` |
| 2 | **Escrow** | Agent POSTs manifest + module bundle to Bridge server; Bridge arms a session with TTL + one-time token | `EscrowEnvelope` (in-memory) |
| 3 | **Manifestation** | Studio plugin pulls escrowed modules; displays diff to user; user consents; plugin installs ModuleScripts | ModuleScripts in Studio |

See [`PIPELINE.md`](./PIPELINE.md) for the full execution map, Bridge server usage, and plugin workflow.

---

## 📦 Repository Layout

```
open-model-contracts/
├── constitution/                   ← Global governance law (never duplicated)
│   ├── omc.constitution.v1.yaml   ← Core constitution
│   ├── capabilities.schema.json   ← Canonical capability taxonomy
│   └── phase-gates.md             ← Required artifacts + validations per phase
│
├── packs/                         ← Domain-specific contract packs
│   └── roblox-game-automator/     ← Roblox Game Automator pack
│       ├── primer/LEVEL_PRIMER.md ← DNA entrypoint (agent reads this first)
│       ├── schemas/               ← JSON Schemas for all phase artifacts
│       ├── policies/              ← Phase 1/2/3 policy YAML
│       └── examples/             ← Example manifest, envelope, Luau module
│
├── spec/
│   ├── contracts/                 ← Zod "Law" schemas (no src/ imports allowed)
│   │   ├── index.ts               ← OMC_REGISTRY — single source of truth
│   │   └── v3/                    ← v3.x contract schemas (asset, agent, task, …)
│   └── json-schema/               ← Committed JSON Schemas (generated from Zod Law)
│
├── scripts/
│   └── export-json-schema.ts      ← Generator: Zod → spec/json-schema/*.schema.json
│
├── src/
│   └── informant/
│       └── mcp-server.ts          ← v3.x Contract Informant MCP server
│
├── server/
│   ├── src/                       ← MCP server (governance enforcement)
│   └── bridge/                    ← Bridge escrow reference server (Phase 2)
│
├── spec/                          ← Governance specification documents
├── constitution/                  ← OMC constitution + capability taxonomy
└── PIPELINE.md                    ← 3-phase execution model + how-to
```

---

## 🏙️ Sector A: Roblox Game Automator Pack

Located in [`packs/roblox-game-automator/`](./packs/roblox-game-automator).

The **Roblox Game Automator** is the first full OMC pack. It implements the 3-phase execution
model for generating and delivering Luau modules into a live Roblox Studio session via the Bridge
escrow server.

**Quick start for the pack:**
1. Read [`packs/roblox-game-automator/primer/LEVEL_PRIMER.md`](./packs/roblox-game-automator/primer/LEVEL_PRIMER.md)
2. Run the Bridge: `npm run bridge:install && npm run bridge:build && npm run bridge:start`
3. Use an agent to complete Phase 1 (Intelligence) and POST to the Bridge (Phase 2)
4. Use the Studio plugin to pull and install (Phase 3)

## 🏛️ Sector B: Governance & Spec
Located in [`/spec`](./spec).
The "Law" of the system. Defines how **Sovereign Agents** are admitted and audited.

## 🌉 Sector C: Bridge Escrow Server
Located in [`server/bridge/`](./server/bridge/).
Reference Node.js/TypeScript implementation of the Phase 2 escrow service.
Provides `POST /escrow`, `GET /escrow/:id/manifest`, `GET /escrow/:id/modules`,
and `POST /escrow/:id/consume` with TTL + one-time token enforcement.

## 🔧 Sector D: MCP Governance Server
Located in [`server/src/`](./server/src/).
The Zod-based contract engine and MCP server that enforces policy at tool-call time.

## 🧠 Sector E: v3.x Contract Informant
Located in [`src/informant/`](./src/informant/).
A purpose-built MCP server that exposes the OMC contract registry as callable tools for agents.

**Tool surface:**
| Tool | Description |
|---|---|
| `list_contracts()` | Returns all contract ids, versions, descriptions, and capabilities |
| `get_contract(id)` | Returns full metadata + live JSON Schema for a specific contract |
| `validate_payload(contract_id, payload)` | Validates a payload against a Zod contract; returns `{ok, errors[], normalized?}` |
| `recall_checkpoint(ref)` | Retrieves registry checkpoint metadata by id, tag, or `"latest"` |

**Zod Law:**
Canonical schemas ("Law") live in [`spec/contracts/`](./spec/contracts/) and are the single source of truth.
They **must never import from `src/`** (Law vs Runtime separation).

**Committed JSON Schemas:**
Pre-generated JSON Schemas live in [`spec/json-schema/`](./spec/json-schema/) and are committed to the repo.
They are built from the Zod Law and kept in sync by CI.

### Regenerating JSON Schemas

When you add or modify a Zod contract under `spec/contracts/`, regenerate the committed schemas:

```bash
npm run gen:schema
```

To verify schemas are in sync without writing (what CI does on PRs):

```bash
npm run check:schema
```

If `check:schema` exits non-zero, the schemas are out of sync — run `gen:schema` and commit the result.

---

## 🚀 The Vision
Open Model Contracts moves from "informal prompting" to **"Hardened Manifestation."**
Every pipeline is a **Pack** that plugs into the **Constitution**, executed through
**MCP-enforced phase gates**: Intelligence → Escrow → Manifestation.

One constitution. Many projects. No swelling.
## 🕋 The Three-Phase Lifecycle
Every manifestation in the OMC ecosystem follows the **Sovereign Pipeline**:

1.  **Phase I: Intelligence**: A specialist board members (the AI swarm) translates a **Level Primer (DNA)** into a signed **omc.manifest.json**.
2.  **Phase II: Escrow**: The manifest and generated modules are escrowed into a **Bridge Service**, secured by TTL and one-time tokens.
3.  **Phase III: Manifestation**: The target domain (e.g., Roblox Studio) pulls the manifest, reviews the diff, and installs the assets with explicit user consent.

---

## 🏛️ Repository Structure

### `/constitution`
The "Supreme Law." Defines the **Capability Taxonomy** and **Phase Gates** that all packs must obey.

### `/packs`
Sector-specific implementations of the OMC DNA.
*   [`/roblox-game-automator`](./packs/roblox-game-automator): Manifests high-fidelity Gothic-Cyber environments.
*   *Coming Soon*: /telegram-governance, /logistics-fleet.

### `/server/bridge`
The reference implementation of the **OMC Escrow Service.** (Node.js/TypeScript).

---

## 🚀 Mission: The Metropolis
The current reference manifestation is a **High-Fidelity Gothic Metropolis** featuring:
- **Procedural Obsidian Skyscrapers** 🏙️
- **11-Arch Central Cathedral** ⛪️
- **Radiant Cyber-Movement Mechanics** 💨✨

---
### ⚖️ *Getting Paid to Have Problems. Manifesting Solutions.*
*The future is not prompted; it is Contracted.*

