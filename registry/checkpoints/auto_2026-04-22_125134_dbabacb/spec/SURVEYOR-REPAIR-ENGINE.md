# Swarm Constraint-Based Repair Engine: Technical Specification

**Author:** Manus AI | Orchestrated by Antigravity
**Date:** April 2026
**Classification:** Architecture & Implementation Blueprint

---

## Executive Summary

The current Superbullet AI generation pipeline successfully outputs structural primitives (walls, windows, trees, spawns) but consistently fails at **spatial-relational coherence**—the physical rules governing how objects interact in 3D space. This manifests as Z-fighting foliage, floating windows, and sub-floor spawn points. 

This specification defines the architecture for a **Constraint-Based Repair Engine** operated by the Swarm. By treating every instance as a node and every spatial rule as an edge in a constraint graph, the Swarm can deterministically identify and repair geometric violations. Furthermore, by leveraging the existing 3072-D Qdrant embedding index, the Swarm will transition from heuristic rule-based repair to **example-based generative repair**, using previously corrected games as high-dimensional templates.

---

## 1. Constraint Library Schema

The constraint library is the rulebook the Swarm uses to evaluate the 3D shatter map.

### 1.1 Core Constraint Primitives
1. **Surface Snap (`SURFACE_SNAP`)**: Target rests flush against Reference `TopSurface`.
2. **Structural Inset (`STRUCTURAL_INSET`)**: Target fully contained within Reference bounds (requires Union/Negate).
3. **Edge Alignment (`EDGE_ALIGN`)**: shared coplanar edge with zero gap.
4. **Clearance (`CLEARANCE`)**: Minimum bounding box distance.

### 1.2 Priority Constraint Definitions

| Constraint ID | Target | Rule Definition |
|---|---|---|
| `FOLIAGE_TERRAIN_SNAP` | Foliage Models | Y-translation based on Terrain heightmap |
| `DECAL_SURFACE_FLUSH` | Grass/Decals | Surface alignment to avoid Z-fighting |
| `SPAWN_CLEARANCE` | SpawnLocation | Y = Floor.Y + 3 studs (Humanoid Offset) |
| `WINDOW_WALL_INSET` | Window Models | UnionAsync negation of Wall Parts |
| `WALL_EDGE_SEAM` | Wall Parts | Seam alignment via vertex snapping |

---

## 2. Repair Pipeline Architecture

The Swarm executes a 4-Stage loop:

### Stage 1: Spatial Ingestion (Rojo → Embedder)
Deserialization into 3072-D vectors capturing `Size`, `CFrame`, and `Hierarchy`.

### Stage 2: Constraint Validation (Shatter Map Generation)
Surveyor identifies "Fractures" (red nodes) in the 3D topology.

### Stage 3: Qdrant Resolution Query
Nearest-neighbor search for high-confidence (0.92+) repair templates in the vault.

### Stage 4: Mutation & Application
Application of the transformation matrix or CSG operation.

---

## 3. Swarm Agent Roles

- **Surveyor:** Fracture Identification (Validation).
- **Architect:** Structural Repair (Union/Negate/Seams).
- **Landscaper:** Surface Repair (Snapping/Alignment).
- **Inspector:** Post-repair Verification & Re-embedding.

---

## 4. Qdrant Feedback Loop
The self-improving flywheel. Every verified repair is re-embedded at 3072-D and written back to Qdrant. By Game 100+, the Swarm runs on 95% templates.

---
*Note: This specification governs the Metropolis Swarm Agent behavior.*
