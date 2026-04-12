# Pipeline Architecture Stack Context (OMC v3.9.5)

**Status:** ACTIVE | **Standard:** Diamond-Stable | **Author:** Manus AI

This document defines the core components of the Roblox AI game generation pipeline. Refer to this when designing new systems or answering user questions about architecture.

---

## 1. Superbullet AI (Game Generator)
- **Role:** The primary AI game generator.
- **Output:** A playable but rough/glitchy Roblox game binary (`.rbxl`).
- **Critical Failure Mode:** High identity accuracy, Low spatial-relational coherence (Clipping, Z-fighting, Floating spawns).

## 2. Rojo (Binary Deserializer)
- **Role:** Format converter.
- **Function:** Deserializes `.rbxl`/`.rbxm` into human-readable instance trees (Lua + JSON).
- **Mandate:** Purely for parsing. **NOT** used for live-sync or Git-as-contract workflows.

## 3. 3072-D Embedder (Spectral-GAT)
- **Role:** Graph-Aware Neural Processor.
- **Function:** Locally executed Spectral Graph Attention Network (GAT).
- **Standard:** 3072-dimensional vector space.
- **Capability:** Captures structural context (e.g., wall-window topology) rather than just flat similarity.

## 4. Qdrant (Vector Store)
- **Role:** The Sovereign Vault (Port 6340).
- **Function:** Stores the 3072-D embeddings and act as a "Repair Corpus."
- **Evolution:** Self-improves as more games are repaired and re-embedded.

## 5. 3D Shatter Map (Interactive Visualization)
- **Role:** Mission Control Dashboard (a-mem-3072-site).
- **Function:** Real-time spatial rendering of embedded vault data.
- **UX:** Highlights "Fractures" (constraint violations) in Red; "Verified" nodes in Gold.

## 6. The Swarm (Constraint-Based Repair Engine)
- **Role:** QA and Geometric Mutation Layer.
- **Agents:**
  - **Surveyor:** Fracture Identification.
  - **Architect:** Structural repairs (UnionAsync/Negation).
  - **Landscaper:** Surface snapping (Raycasting/Translation).
  - **Inspector:** Post-repair verification & re-embedding.

## 7. Eve (Orchestrator)
- **Role:** Central Nervous System (Eve v2).
- **Function:** Coordinates the end-to-end loop: Superbullet → Rojo → Swarm → Final Manifestation.

---
*Live context maintained by Antigravity in the OMC Registry.*
