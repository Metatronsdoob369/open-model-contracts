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

## 8. GovernanceGate (Escrow Circuit Breaker)
- **Role:** Pre-escrow sovereignty validator on `POST /escrow`.
- **Location:** `server/bridge/src/governance-gate.ts`
- **Function:** Blocks hostile or low-quality modules from entering the escrow pipeline before any session ID is issued.

### Scoring Formula
```
score = (distTS × 0.4) + (distLua × 0.4) + (1.0 - heat) × 0.2
```
- `distTS` / `distLua` — L2 distance from the module's 3072-D vector to the canonical TypeScript and Lua anchor vectors.
- `heat` — complexity signal from `SpectraMappingService.calculateHeat()`. High heat = dense, structured code.

### Penalty & Credit Modifiers (applied after base score)
| Modifier | Condition | Effect |
|---|---|---|
| **Vacuity Penalty** | `heat < 0.15` | `+0.30v` (low-complexity noise punished) |
| **Loyalty Credit** | Code contains any OMC marker¹ | `−0.30v` (canonical patterns rewarded) |
| **Score Floor** | Always | `max(0, score)` — loyalty cannot go negative |

¹ Loyalty markers: `SafeFire`, `OMC_Bridge_`, `WaitForChild`, `capability:`, `REFRAG_SIGNATURE`

### ⚠️ Compound Behavior — Vacuity + Heat Term (Discovered in Testing)
> **The effective score delta between low-heat and high-heat code is NOT simply +0.30v.**
>
> The `(1.0 - heat) × 0.2` term also varies with heat, compounding the vacuity penalty:
> ```
> Low-heat  (0.05): vacuity +0.30  +  (1-0.05)×0.2 = 0.19  →  net contribution: 0.49
> High-heat (0.50): no penalty     +  (1-0.50)×0.2 = 0.10  →  net contribution: 0.10
> Delta = 0.39v  (not 0.30v)
> ```
> This means near-vacuous code is scored ~0.39v harder than average-complexity code,
> even before the explicit `+0.30` vacuity line fires. **Do not assume the penalty is additive-only.**

### Tier Decision
| Score | Tier | Authorized | Action |
|---|---|---|---|
| `≤ 0.65v` | `TRUSTED` | ✅ Yes | Proceeds to escrow |
| `0.65–0.95v` | `STAGED` | ✅ Yes | Proceeds, flagged for review |
| `> 0.95v` | `BREACH` | ❌ No | Blocked; `governance.violation` audit event written |

---
*Live context maintained by Antigravity in the OMC Registry.*
