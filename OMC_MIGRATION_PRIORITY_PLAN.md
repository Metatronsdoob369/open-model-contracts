# OMC & Domicile Migration: Prioritized Implementation Plan

**Objective:** Fully separate Open-Model-Contracts (The Sovereign Law & DNA) from Domicile (The Garage Workspace / Execution Environment). Domicile's future state is completely dependent on OMC for its operational constraints, becoming a pure execution "snake skin".

## Architectural Posture
*   **OMC:** "Non-Garage". Stores the pure legislation, the Zod Schemas (`input/output_contracts`), the blueprints, and the constitutional markdown files. Served dynamically via the Informant MCP.
*   **Domicile Live:** "The Garage Workspace". Holds the physical node.js scripts, the `Triad-GAT` execution routers, the `Eve_v2` concepts, the PostgreSQL connections, and the `Skills/` folders. It physically computes, but it does not *create* the rules.

---

## Phase 1: Extract Core Constitutional Blueprints
**Goal:** Rip the remaining "Law" out of the physical garage so that the Informant MCP has complete sovereignty.

1.  **Migrate the `ai-agent-blueprint.md`**
    *   *Action:* Move from `domicile_live/` to `open-model-contracts/spec/domicile-governance/admission/`.
    *   *Value Added:* This 10-point standard becomes the definitive, global required operating procedure. By residing in OMC, any future garage or feeder repo automatically inherits these expectations.
2.  **Migrate Specialist Contracts (`MCP_RAG_SPECIALIST.md`)**
    *   *Action:* Move from `domicile_live/governance/contracts/` to `open-model-contracts/spec/domicile-governance/agents/`.
    *   *Value Added:* Defines exactly how a RAG Specialist behaves. If a new capability is built into the garage, it will read this contract from OMC to know if it's allowed to run in "ARMED" mode.

## Phase 2: Formalize the "Skills Canon"
**Goal:** Turn Domicile's implicit `SKILLS_CANON.md` into explicit machine-readable law in OMC.

1.  **Extract `SKILLS_CANON.md` to OMC**
    *   *Action:* Move the standard definition document from `domicile_live/Skills` to `open-model-contracts/spec/domicile-governance/`.
2.  **Generate `omc.v3.skill` Zod Schema**
    *   *Action:* Create a strict Zod contract in `open-model-contracts/spec/contracts/v3/skill.ts` that enforces the exact shape required of `MANIFEST.json` (requiring `skill`, `version`, `entry_point`, `tools`, etc.).
    *   *Value Added:* Domicile continues to house the actual physical `Skills/` folders (the scripts and templates), but before the Domicile `semantic-router` or `Triad-GAT` attempts to load a skill, it validates the `MANIFEST.json` against the OMC schema. This eliminates runtime crashes caused by misconfigured tools in the garage.

## Phase 3: Connect the Engines to the Law
**Goal:** Domicile execution logic becomes decoupled from local configurations and instead dynamically requests boundaries from OMC.

1.  **Update `Triad-GAT/semantic-router.ts` (CA-CAO Cortex)**
    *   *Action:* The router already sets `governance: { mode: 'STRICT', source_physics_id: 'active_strategy_matrix_v1' }`. We ensure this validation step calls the OMC Informant MCP to verify the payload shape before passing it to the fallback LLM.
2.  **Dynamic Parameterization of `governance-skill_engine.ts`**
    *   *Action:* The "Vagus Nerve" currently hardcodes configurations like `maxVelocity: 0.20` and `minSignificance: 0.05`. We will define an `omc.v3.physics-threshold` schema over in OMC.
    *   *Value Added:* If the physics of the environment need to change, you change the law in OMC. The Domicile garage automatically adjusts its mutation threshold.

## Phase 4: Purge & Maintain
**Goal:** Completely remove duplicate traces of governance from the garage.

1.  *Action:* Finalize the deletion of the `domicile_live/governance/` folder entirely.
2.  *Action:* Ensure `REPOSITORY_CATALOG.md` is updated to clearly reflect that Domicile is simply the runtime feeder for the Sovereign OMC.

## Phase 5: Curate Reference Architecture & Canonical Examples
**Goal:** Preserve "The Goodness". Domicile contains incredible, battle-tested execution mechanics that shouldn't be lost in the purge. We will extract them into an OMC `examples/` or `reference-architecture/` library to seed future environments.

1.  **Migrate Routing Memory Mechanics (`ROUTING_MEMORY.md`)**
    *   *Action:* Extract Clay's pgvector-based LLM caching and TARS Dream Cycle auto-mutations into OMC as an advanced Agentic Pattern.
2.  **Migrate Database Autonomics (`governance.sql` & schemas)**
    *   *Action:* Extract the Supabase edge functions (`mos-orchestrator`) and SQL triggers that enforce statistical bounds into an OMC reference module.
3.  **Migrate Living RAG Patterns (`hk101-living-rag`)**
    *   *Action:* Formalize the Living RAG folder into an open standard for dynamic knowledge injection.
    *   *Value Added:* Other developers (or future you) can clone these references directly from OMC to jumpstart new applications, turning OMC into an industry-grade pattern library rather than just a dry rulebook.

---
**Status:** Ready to execute Phase 1 and initiate Phase 2 `omc.v3.skill` schema creation.
