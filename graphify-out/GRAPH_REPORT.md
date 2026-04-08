# OMC Architecture: Graphify Report

## 🌌 The God Nodes
The highest-degree concepts that bind the Open Model Contracts system together:

1. **`AMEM.IngestionPayload` (Degree: 24)** 
   - *Why:* This is the absolute center of gravity. Every Phase Gate, Risk Trigger, Skill Manifest, and Physics Parameter ultimately rolls into this single Brain Loadout. The entire Sentry Watcher pipeline halts unless this payload validates.
2. **`ScriptAuditSchema` (Degree: 16)**
   - *Why:* The core judicial engine. Connects directly to Lua AST nodes, MemPalace `spatialMemory`, and rejects legacy globals (`_G`, `shared`, `spawn`).
3. **`MemoryPalaceIndex` (Degree: 12)**
   - *Why:* Bridges raw Roblox state to agentic inference. `ROOM-01` and `ROOM-02` act as the spatial anchors for all game mechanic logic.

## 🕸️ Community Clusters
*Clustered via Leiden algorithm based on edge density.*

### Cluster 0: The Vagus Nerve (Physics & Heuristics)
**Nodes:** `PhysicsThresholdSchema`, `HeuristicSafetySchema`, `maxVelocity`, `intentSignature`, `provenanceHash`
**Theme:** This cluster entirely isolates runtime physics limits from prompt injection defenses. It is the mathematical immune system.

### Cluster 1: The Frontier Law (Sentry Watcher)
**Nodes:** `sentry-watcher.ts`, `luaparse`, `chokidar`, `Argon`, `OMC_REGISTRY`
**Theme:** Focuses exclusively on external system ingestion. It acts as the border patrol for incoming drops from the field (Superbullet `.rbxlx` files).

## ⚡ Surprising Connections

* **`omc.skill.audit` (Sentry Auditor) ↔ `HeuristicSafetySchema`**  
  *Why:* The audit skill was designed to evaluate Lua code structurally. However, graph traversal shows it cannot execute unless the `HeuristicSafetySchema` confirms the agent's intent signature hasn't experienced high entropy. The auditor cannot be hijacked.

* **`ROOM-01: PlayerState` ↔ `AMEM.RiskLevel.CRITICAL`**
  *Why:* If code modifies `PlayerState` directly without validating against the MemPalace integrity bounds, the Risk Mitigation matrix automatically tags it as a `MemoryViolation` and enforces a `Quarantine`. 

## 🗺️ Suggested Node Traversals
1. Navigate from `sentry-watcher.ts` → `Dissection Report` → `AMEM.IngestionPayload` to understand the standard failure loop.
2. Filter the graph by `isArmed: true` to visualize which skills require human approval.
