# 🏛️ OPEN-MODEL-CONTRACTS (OMC)

**Autonomous Governance for Agentic Simulations.**

Open Model Contracts (OMC) is the constitutional layer for autonomous game development. It defines the "law" under which AI agents operate, moving from fragile prompts to hardened, Zod-validated contracts that are enforceable in any runtime (Roblox, Unity, Web).

---

## 🕋 OMNI-REGISTRY: MISSION MEMORY

**Philosophy:** Memory is an asset. This repository is a self-archiving laboratory. Every contract iteration and logic shift is automatically captured—no manual effort required.

### 🚀 ELITE TEAM ONBOARDING (Quick Start)

To join the registry protocol and activate high-fidelity mission tracking, run these three commands:

1. **Activate Memory Hooks:**

   ```bash
   chmod +x scripts/install-hooks.sh && ./scripts/install-hooks.sh
   ```

2. **Standard Shipping (Enforces Memos):**

   ```bash
   ./scripts/ship.sh -m "What we built/learned on this mission."
   ```

3. **Manual Checkpoint (Optional):**

   ```bash
   ./scripts/checkpoint.sh -m "Snapshotting current contract state."
   ```

---

## 🧠 Memory & Versioning (The Registry)

We use a **Registry-first** approach to versioning. Every "game attempt" or contract iteration is archived to provide a clear path backwards and a "Memory" of lessons learned.

### 🛠️ Versioning Tools

- **`./scripts/checkpoint.sh`**: Captures a snapshot of all contract directories into `/registry/checkpoints/`.
- **`./scripts/ship.sh`**: The only way to push to GitHub. It forces a checkpoint and a "Lesson Learned" memo.
- **`./scripts/rollback.sh`**: Restores the repository to any previous checkpoint state.
- **`./scripts/install-hooks.sh`**: Distributed hook installation via `core.hooksPath`.

### 📂 Structure

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

## 🏛️ Repository Architecture

- **`popsim-contract/`**: The core simulation and population governance definitions.
- **`spec/`**: Formal Zod-specifications for asset generation and agent behavior.
- **`src/`**: Bridge logic and escrow systems (TypeScript).
- **`registry/`**: The permanent archive of all missions and snapshots.
- **`lm_test_script/`**: Universal LLM Switcher (The Pilot's HUD).

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
Every pipeline is a **Pack** that plugs into the **Constitution**, executed through **MCP-enforced phase gates**: Intelligence &rarr; Escrow &rarr; Manifestation.

One constitution. Many projects. No swelling.

---

## 🕋 The Three-Phase Lifecycle

1. **Phase 1: Intelligence** (The Plan)
   - Agent generates a Program Design Review (PDR).
   - Contracts are drafted in Zod and validated against the Domain Spec.

2. **Phase 2: Escrow** (The Forge)
   - Draft code is held in a bridge-server (Local Node.js).
   - Validation scripts ensure logic parity before deployment.

3. **Phase 3: Manifestation** (The Game)
   - Code is pushed to the client runtime (Roblox Studio) via Rojo/Argon.
   - The contract becomes "The Law" of the simulation.

---

## 🤝 CONTRIBUTING

This is a **Director-01 Sovereign Manifestation**. Contribution is by mission invitation only.

---

**Last Updated:** 2026-04-06
**Status:** Diamond-Stable v2.5
