# Tri-Map Shatter Architecture: Memory Governance Law

**Author:** Antigravity (Sovereign Architect) | **Inspiration:** Metropolis Partitioning Protocol
**Date:** April 2026
**Classification:** Restricted Memory Partitioning

---

## Executive Summary
To ensure surgical precision and prevent cross-domain contamination in the Roblox AI pipeline, memory is partitioned into three distinct **Semantic Maps**. Each map is restricted to its corresponding specialist agent.

---

## 1. The Three Maps (Qdrant Collections)

### MAP 1: CONCEPTUAL (Logic & State)
- **Scope:** Scripts, Events, Variables, ModuleScripts, RemoteEvent bindings.
- **Collection Name:** `roblox_map_conceptual`
- **Authorized Agent:** **Logic Agent**
- **Surgical Intent:** Managing the functional "Brain" of the game.

### MAP 2: SPATIAL (Placement & Surface)
- **Scope:** SpawnLocations, Foliage, NPCs, Props, Terrain heightmaps, Decals.
- **Collection Name:** `roblox_map_spatial`
- **Authorized Agent:** **Landscaper Agent**
- **Surgical Intent:** Managing the "Physical Surface" and world atmosphere.

### MAP 3: STRUCTURAL (Architecture & Coherence)
- **Scope:** Walls, Floors, Windows, Doors, Roofs, CSG Unions, Solid Geometry.
- **Collection Name:** `roblox_map_structural`
- **Authorized Agent:** **Architect Agent**
- **Surgical Intent:** Managing the "Skeleton" and structural integrity.

---

## 2. Ingestion & Classification Protocol

1. **Superbullet → Rojo**: Raw Luau/JSON source.
2. **3072-D Embedder**: High-dimensional vector generation.
3. **Instance Classifier**:
    - IF `ClassName == "Script"` OR `ClassName == "ModuleScript"` → **MAP 1**
    - IF `ClassName == "SpawnLocation"` OR `ClassName == "Decoration"` OR `ClassName == "Decal"` → **MAP 2**
    - IF `ClassName == "Part"` (Structural Tags) OR `ClassName == "Model"` (Building) → **MAP 3**

---

## 3. The Surveyor & Eve (Self-Routing)

- **The Surveyor**: Scans all 3 maps for fractures.
- **Eve Router**:
    - `CONCEPTUAL_FRACTURE` → Task: **Logic Agent**
    - `SPATIAL_FRACTURE` → Task: **Landscaper Agent**
    - `STRUCTURAL_FRACTURE` → Task: **Architect Agent**

---

## 4. Query Isolation (The Wall)

**Agents are strictly prohibited from querying outside their assigned map.** An Architect cannot query the Logic Map to "fix" a wall. They must request a Logic Mutation from the Eve Router if a structural change requires a script update.

---
*Note: This law is the foundation of the 'Shatter Map' methodology. It ensures that complex systems are broken into logical, manageable primitives.*
