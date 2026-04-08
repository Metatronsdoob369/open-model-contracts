# 🧠 AMEM v3.5 & O.M.C. Sovereignty (Memory Session)
*Date: 2026-04-08*

### 1. The Core Architecture Shift
We completed Phase 1, Phase 2, and Phase 3 of the **OMC Migration Plan**. Domicile's execution engines are now completely decoupled from local, implicit configurations. 
* **The "Law" now purely mathematical**: By extracting logic into `omc.v3` schemas, we stripped the garage of its legacy `governance/` folder policies.
* **The Sentry Watcher (`sentry-watcher.ts`)**: We achieved autonomous interception. When the remote partner drops Superbullet `.rbxlx` files, Sentry extracts and Zod-validates them locally against the pipeline before merging.

### 2. A-MEM Payload Evolution (The Brain Loadout)
We evolved standard Zod validation into a fully holistic `AMEM.IngestionPayload` structure (v3.5.0).
* **MemPalace Indexing**: Variables natively map to spatial rooms (e.g., `ROOM-01: PlayerState`). If a Superbullet script touches state outside the explicitly declared `spatialMemory` mapping, it throws a `RegistryMismatch`.
* **Physics Thresholds (The Vagus Nerve)**: Parameters like `maxVelocity: 0.20` and `minSignificance` were ripped out of Domicile's `governance-skill_engine.ts` and placed into `omc.v3.physics-threshold`. OMC now completely regulates Domicile's rate of mutation autonomously.

### 3. "Getting Paid To Have Problems": Heuristic Safety
* **The Problem**: MCPs are inherently vulnerable to prompt-injection or hijacking where stray agents deviate from their intended scope.
* **The Solution**: We developed **Phylogenetic Signatures (`HeuristicSafetySchema`)**. We require a `provenanceHash` and `intentSignature` (vector mapping). If entropy pushes past `maxEntropy (0.15)`, it triggers a `[PROVENANCE_FAILURE]`. It's a literal immune system for AI intent.

### 4. Git-Level Cryptographic Securing (Husky)
* **The Problem**: A human or rogue agent could bypass OMC rules by simply commiting to Git. 
* **The Solution**: We replaced deprecated Husky `install` logic with `npx husky init`. We wrote `validate-registry.ts` as a `pre-commit` hook that halts `git commit` if the AMEM payload violates physical bounds or entropy thresholds. 

### 5. Demolition & Curation (Phase 4/5)
* Instead of blindly purging the `domicile_live` execution logic, we successfully salvaged the master architectures (like `eve_v1.py`, `governance.sql`, and `router.ts`) directly into `/open-model-contracts/reference-architecture/` before the final tear-down.

### Next Steps & Insights
* **Argon vs. Rojo Context**: Attempting CLI `.rbxlx` extractions is fragile. Default to the Rojo "Sync In" loop from Studio directly to the synced Google Drive folder.
* **The Diamond Refiner**: We proved the LLM can use the Dissection Report + `AMEM Payload` to dynamically route variables properly. 
