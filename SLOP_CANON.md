# THE SLOP CANON (Paid to have Problems)
*A ledger of technical debt, anatomy failures, and sovereign corrections.*

---

## [SC-001] ROJO ANATOMY: THE MODULE-SCRIPT COLLISION
- **Date**: 2026-05-05
- **Status**: CANONIZED
- **Problem**: Attempted to `require` a file named `*.server.luau`.
- **Anatomy Failure**: In the Rojo file-mapping protocol, `.server.luau` explicitly maps to a **Script** object. Roblox Scripts are execution threads and *cannot* be required by other scripts.
- **Correction**: Reusable logic (Factories, Services) MUST be named `*.luau` to map to a **ModuleScript**.
- **Impact**: Total failure of the CyberPredatorFactory until renamed.
- **Lesson**: Theoretical beauty (the render) does not bypass Technical Anatomy (the sync).

---

## [SC-002] BRIDGE HANDSHAKE: HTTP PERMISSION BLOCK
- **Date**: 2026-05-05
- **Status**: CANONIZED
- **Problem**: Rehydrator fails with "Bridge handshake failed."
- **Technical Gap**: Roblox Studio blocks all outbound HTTP traffic by default for local development.
- **Requirement**: `Game Settings -> Security -> Allow HTTP Requests` must be toggled manually in the Studio UI. 
- **Lesson**: Code-based rehydration has a manual security dependency that must be explicitly checked before every manifestation strike.

---

## [SC-003] ASSET PIPELINE: PILLOW ENVIRONMENT PATH
- **Date**: 2026-05-05
- **Status**: CANONIZED
- **Problem**: `pip install pillow` failed due to path alias collision.
- **Correction**: Use `python3 -m pip install` to bypass local shell alias issues.
- **Lesson**: Direct module execution is safer than relying on shell PATH variables in complex Mac environments.

---

## [SC-004] ARCHITECTURAL CHAOS: THE ORDER-LESS MANIFEST
- **Date**: 2026-05-05
- **Status**: CANONIZED
- **Problem**: Attempted to manifest 40+ assets, complex entities, and UI simultaneously.
- **Anatomy Failure**: Ignored the Roblox Service Model (Workspace, Lighting, StarterGui). Manifestation was unordered, causing race conditions between lighting, purging, and object creation.
- **Correction**: Adopted the **12-Stage VCS Build Plan**. Manifestation must follow the sequence: Reset -> Lighting -> Geometry -> Assets -> Interactables -> Logic -> UI -> Spawn -> Audit.
- **Lesson**: High-fidelity vision is impossible without low-level staged orchestration. Proving "One Block + One Light" is the mandatory gate before scaling.

---

## ⚙️ The Slop Canon Pipeline (Fully Automatic)

The Slop Canon Pipeline operates via 3 hooks to ensure every failure is captured, embedded, and made searchable:

### 1. During Session (Capture)
* **User Prompt Hook**: When you type a message with failure keywords, the `UserPromptSubmit` hook fires. `slop-canon-logger.py` detects it and appends a structured entry to `SLOP_CANON.md`.
* **Weppy Log Hook**: When Weppy returns Studio logs containing errors, the `PostToolUse` hook fires. `slop-canon-tool-watcher.py` detects them and appends them to `SLOP_CANON.md`.

### 2. Session Ends (Embed)
* **Stop Hook**: When the session ends, the `Stop` hook triggers `slop-canon-embed.sh`.
* **Parsing & Upsert**: `embed-slop-canon.js` parses `SLOP_CANON.md`. A sidecar tracks state, so it only embeds **NEW/changed** entries.
* **Zero Cost Vectorization**: Entries are upserted into the Qdrant `slop-canon` collection using local Ollama embeddings (zero cloud, zero cost).

### 3. Query Phase (Retrieval)
You can query past failures at any time:
```bash
node scripts/embed-slop-canon.js search "player falling through floor"
node scripts/embed-slop-canon.js search "WeldConstraint separation"
node scripts/embed-slop-canon.js search "spawn race condition"
```

> **The Moat**: Every failure from every session becomes a searchable data point. We don't make the same mistake twice.
---
### [2026-05-07 17:03] Auto-logged failure

**Symptom:** no dice

**Matched signals:** `no dice`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-07 17:18] Auto-logged failure

**Symptom:** no floor,   17:17:22.793  [LIGHTING] Dusk set — bloom tamed  -  Server - SetDuskLighting:25   17:17:22.794  Generated High-Fid 3D Lizard Enemy. Audit hash: k9j8h7g6f5e4d3c2b1a0  -  Server - high_fid_lizard_enemy:3   17:17:22.797  High-Fid 3D Jacked Lizard Enemy spawned at (0,6,0). Muscular Komodo anthro with scales, claws, tail, and procedural details.  -  Server - high_fid_lizard_enemy:99   17:17...

**Matched signals:** `HTTP.*not enabled`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-07 17:22] Auto-logged failure

**Symptom:** 17:19:54.495  [GROUND-ENEMIES] Script loaded  -  Server - BuildGroundEnemies:12   17:19:54.495  [LIGHTING] Dusk set — bloom tamed  -  Server - SetDuskLighting:25   17:19:54.498  [HAWK] Script loaded — ENABLE_ON_BOOT: true  -  Server - BuildAerialHawkChassis:12   17:19:54.498  [ARENA-FLOOR] Created — top surface Y=59, size 140x140, base pillar to Y=0  -  Server - BuildArenaFloor:48   17:19:54.499  ...

**Matched signals:** `HTTP.*not enabled`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-07 17:26] Auto-logged failure

**Symptom:** And you shouldn't even have to have me print the game logs............ Save what you need like do not save any of this sideways BS where we can't even figure out how to get a thing inside of a game that I understand it's not normally an easy thing, but like we have crossed this bridge and going back way far this back to like the absolute beginning it feels like is difficult 🏮 [JANITOR] Frequency S...

**Matched signals:** `HTTP.*not enabled`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-15 13:08] Auto-logged failure

**Symptom:** Why do we have two separate memories on the same project where you can't find stuff this is a vicious problem

**Matched signals:** `can'?t (?:see|find|stop|start)`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-15 14:54] Auto-logged failure

**Symptom:** closer, but not there yet ---->**[VERIFICATION GATE ENGAGED]**  I can build you a case — but not on sand. The following assertions couldn't be verified against the available statutes, library items, or evidence board:  • R1: fact claim "Model output did not conform to DraftResponseSchema JSON structure..." has no supporting evidence (severity: high).  To proceed with verified counsel, provide: • A...

**Matched signals:** `not (?:there|working|spawning|loading)`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-15 16:32] Auto-logged failure

**Symptom:** no dice [Image #6]

**Matched signals:** `no dice`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-15 21:00] Auto-logged failure

**Symptom:** /**       * Spectral Heatmap Lab — Real Embeddings, Real Math, Real Qdrant       *       * Embeds 8 Lua game files (6 canonical + 2 shattered) via OpenAI      text-embedding-3-large,       * computes 5 heat map representations per Eve_v2 spectral config,      stores in Qdrant.       */       import fs from 'fs';      import path from 'path';      import OpenAI from 'openai';      import dotenv fro...

**Matched signals:** `broken`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-19 01:20] Auto-logged failure

**Symptom:** looking good This is a flawless, reference-grade implementation—your approach is exactly what’s expected of a compliance-ready, regulated, or buyer-facing software org.  You have achieved:  Fully automated docs hygiene enforcement—every PR, every branch, every push runs and must pass your bespoke docs:release:check in CI. No accidental stale SHA, TODO/WIP marker, or missing artifact path will ever...

**Matched signals:** `broken`

**Status:** UNRESOLVED — awaiting root cause + fix documentation


---
### [2026-05-19 04:45] Auto-logged failure

**Symptom:** 117    | 'submit.success'  • Edited Users/joewales/NODE_OUT_Master/open-model-contracts/server/bridge/src/metropolis-gate.ts (+8 -7)      32       */      33 -    async validateSovereignty(fileId: string, code: string): Promise<{ authorized: boolean; tier: Sove          reigntyTier; resonanceScore: number; status?: string }> {      33 +    async validateSovereignty(fileId: string, code: string): P...

**Matched signals:** `sync.*stop(?:ped)?`

**Status:** UNRESOLVED — awaiting root cause + fix documentation

