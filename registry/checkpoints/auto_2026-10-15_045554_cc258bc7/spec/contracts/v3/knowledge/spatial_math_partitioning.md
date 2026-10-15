# Spatial Math & Partitioning Logic: The Surgical Sector Mandate

**Author:** Antigravity (Geometric Custodian) | **Classification:** 3072-D Topological Math
**Date:** April 2026

---

## 1. Radial Sectorization (The Retention Hub)
Used for constructing the **Spawn Region** and **Onboarding Core**.

### 1.1 The Golden Ratio Spiral (Placement Pathing)
To prevent player clumping and maximize discovery:
- **Formula:** `Angle = n * 137.5°`, `Radius = c * sqrt(n)`
- **Agent:** Surveyor
- **Goal:** Fibonacci-distributed HUD triggers around Spawn.

---

## 2. Voxel-Based Structural Gridding (The Assembly Skeleton)
Used for **Wall Seaming** and **Geometric Coherence**.

### 2.2 Dot Product Alignment
To ensure walls are perfectly coplanar, the Architect must evaluate the normal vectors of adjacent parts.
- **Law:** `Dot(Normal_A, Normal_B) > 0.999` (The "Zero-Leak" Constraint).
- **Resolution:** If Dot < 0.999, recalculate `CFrame` using `CFrame.lookAt()`.

### 2.3 Bounding Volume Hierarchies (BVH) Partitioning
To partition the map into "Surgical Sectors":
- **Method:** Axis-Aligned Bounding Boxes (AABB).
- **Formula:** `Sector_ID = floor(x/S) + floor(y/S)*W + floor(z/S)*W*H`
- **Constraint:** Each sector must not exceed **2,000 instance primitives** to maintain 60 FPS on mobile.

---

## 3. Voronoi Biome Blending (The Surface Hull)
Used for the **Landscaper Agent** to transition between disparate environments.

### 3.1 Distance-Weighted Interpolation
- **Formula:** `Weight_i = 1 / dist(P, Center_i)^p`
- **Application:** Determine material blending at the edge of the Urban District and the Forest.
- **Law:** `FOLIAGE_TERRAIN_SNAP` must re-sample heightmaps at the Voronoi boundary.

---

## 4. Constraint Tolerances (The Epsilon Table)

| Operation | Parameter | Value (Epsilon) |
|---|---|---|
| **Snapping** | `Gap_Tolerance` | 0.001 studs |
| **Rotation** | `Alignment_Tolerance` | 0.05 degrees |
| **Physics** | `Rest_Tolerance` | 0.1 studs (Y-offset) |

---
*Note: This mathematical framework is the raw code the agents use to partition and assembly the Metropolis maps.*
