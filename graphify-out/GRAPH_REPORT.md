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

### Cluster 2: The Circadian Life-Cycle (Synaptic Memory)
**Nodes:** `DREAM_CYCLE.md`, `dream-cycle.sh`, `SynapticPruningEngine`, `MemoryLifecycleState`, `CIRCADIAN_LOG.md`, `VampireDnaSchema`
**Theme:** Biological self-improvement. This cluster manages the transition from short-term "Garage" logic to long-term "Canonical" law. It is the "Brain Tissue" of the system.

## ⚡ Surprising Connections

* **`omc.skill.audit` (Sentry Auditor) ↔ `HeuristicSafetySchema`**  
  *Why:* The audit skill was designed to evaluate Lua code structurally. However, graph traversal shows it cannot execute unless the `HeuristicSafetySchema` confirms the agent's intent signature hasn't experienced high entropy. The auditor cannot be hijacked.

* **`ROOM-01: PlayerState` ↔ `AMEM.RiskLevel.CRITICAL`**
  *Why:* If code modifies `PlayerState` directly without validating against the MemPalace integrity bounds, the Risk Mitigation matrix automatically tags it as a `MemoryViolation` and enforces a `Quarantine`. 

* **`dream-cycle.sh` (The Garage) ↔ `VampireDnaSchema` (The DNA)**
  *Why:* Nightly reflection isn't just for logging. Graph analysis proves that the **SynapticPruningEngine** extracts high-signal patterns from the Domicile "Archives" and injects them into the **Vampire DNA** mapping. This is how the system "Wakes up smarter"—by converting historical "Slop" into future "Law."

## 🗺️ Suggested Node Traversals
1. Navigate from `sentry-watcher.ts` → `Dissection Report` → `AMEM.IngestionPayload` to understand the standard failure loop.
2. Filter the graph by `isArmed: true` to visualize which skills require human approval.
3. Trace from `CIRCADIAN_LOG.md` (Jan 17) → `SynapticPruningEngine` → `src/canonical` to see the complete "Handoff" from history to production.

