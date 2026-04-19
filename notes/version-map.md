# Version Map — UI ↔ Schemas (as of 2026-04-15)

Use this to keep the 3D viz / radar front-end in lockstep with the contract payloads.

- **OMC commit (spec/contracts):** `3236d2a`
- **Refrag UI (a-mem-3072-site) commit:** `f858ba4`
- **API payloads in use:**
  - `/api/memory` → Qdrant collection `cif-memory`, expects 3072-d vectors; payload fields: `vector[0..3071]`, `payload.confidence`, `payload.text`, `payload.source`.
  - `/api/heatmap` → Qdrant collection `spectral-heatmap`, payload fields: `file`, `genre`, `kind`, `position3d`, `heat`, `shatter`, `sectorScores`, `nearestCanonical`, `heatKernelRow`, `eigenvalues`, `deltaVector3d`, `deltaTarget`; plus optional `graph_metadata` entry.

Update this file whenever either repo changes payload shape; include commit hashes and any schema/payload deltas.
