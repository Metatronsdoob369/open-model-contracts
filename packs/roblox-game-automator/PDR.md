# PROGRAM DESIGN REVIEW
## Open Model Contracts — Roblox Game Automation Pipeline
**Classification:** Internal Working Document
**Status:** Active Development
**Date:** 2026-04-05

---

## 1. MISSION STATEMENT

Build an end-to-end automation pipeline that converts a natural language prompt into
a published, playable, enterprise-grade Roblox game — with no human steps in between.

A user speaks or types a prompt. A game exists on Roblox. That is the product.

---

## 2. CURRENT STATE (Honest Baseline)

```
What exists and works today:
  ✅  Director-01 parses NL prompt → structured SwarmBrief
  ✅  Specialist swarm (architect-01, sonic-01, system-01) generates Luau modules
  ✅  Bridge server (port 3099) stores, validates, and serves contracts
  ✅  Disk persistence — contracts survive bridge restarts
  ✅  Auto-polling Loader in Studio — detects new contracts, hot-loads them
  ✅  Geometry lands in Workspace (buildings, SpawnLocation, lighting)
  ✅  GET /v1/delivery/latest — Loader needs no hardcoded contract ID
  ✅  Telegram bot infrastructure exists (wired for SARN, not yet Roblox)
  ✅  Redis cache + audit trail per contract

What is broken or incomplete:
  ❌  Generated Luau code quality — specialist prompt rules still produce errors
  ❌  Client-side execution — no LocalScript, so input/FX/dash never run
  ❌  No RemoteEvents — server and client cannot communicate
  ❌  No HUD — player has no UI feedback (score, tag status, timer)
  ❌  No automated validation gate — broken code reaches Studio
  ❌  No Telegram → Roblox trigger
  ❌  No Roblox Open Cloud publishing — Studio is still required
  ❌  Single genre only (gothic-cyber tag game)
  ❌  No player data persistence (DataStore)
  ❌  No monetization layer
```

---

## 3. END GOAL — ENTERPRISE AUTOMATION PIPELINE

```
┌─────────────────────────────────────────────────────────────────┐
│                     THE PRODUCT AT SCALE                        │
│                                                                 │
│  TRIGGER          PIPELINE              OUTPUT                  │
│                                                                 │
│  Telegram msg  →  Director-01       →  Published Roblox game    │
│  API call      →  Specialist swarm  →  Unique per prompt        │
│  Web dashboard →  Validation gate   →  Auto-monetized           │
│  Scheduled     →  Open Cloud push   →  Analytics tracked        │
│                →  Audit trail       →  Revenue reported         │
└─────────────────────────────────────────────────────────────────┘
```

Enterprise level means:
- Any prompt → playable game in under 5 minutes
- Zero human steps after prompt submission
- Code quality high enough to pass Roblox moderation
- Multiple simultaneous game generations
- Monitored, auditable, governable output
- Revenue-generating (game passes, Robux, subscriptions)
- Multi-genre (tag, obby, tycoon, simulator, roleplay, horror)

---

## 4. PHASES

---

### PHASE 1 — CLOSE THE LOOP
**Goal:** One complete playable game cycle, no human steps inside Studio
**Timeline:** Next session

```
4.1  ClientLoader (StarterPlayerScripts)
     — Reads OMC_Hub in ReplicatedStorage
     — Executes client modules (input, dash, visual FX)
     — Auto-reloads when OMC_Hub changes

4.2  RemoteEvents scaffold
     — net-01 specialist generates RemoteEvent wiring
     — Server fires events (tag, dash confirmed, round state)
     — Client listens and responds (FX, UI updates)

4.3  HUD (StarterGui)
     — Who is tagged
     — Round timer
     — Score / leaderboard
     — Injected by Loader, not hardcoded in Studio

4.4  Code quality gate (automated)
     — After generation, scan each .lua file before storing contract
     — Reject contracts containing: require(), deprecated APIs,
       LocalPlayer on server, forward references, fake asset IDs
     — If rejected: auto-retry generation once, then flag to operator
     — Gate runs inside bridge-server.ts, transparent to user

4.5  Verified base templates per specialist
     — architect-01: locked structural skeleton (SpawnLocation,
       grid loop, lighting) — LLM fills aesthetic only
     — system-01: locked mechanic skeleton (PlayerAdded, CharacterAdded,
       Heartbeat loop) — LLM fills rules only
     — sonic-01: locked audio skeleton (SoundService, looped drone)
       — LLM fills mood/frequency only
```

**Exit criteria:** Submit prompt via curl → playable game in Studio
with character, movement, basic tag mechanic, and HUD. Zero errors.

---

### PHASE 2 — AUTOMATION
**Goal:** Remove the human from the loop entirely
**Timeline:** Phase 1 + 1-2 sessions

```
4.6  Telegram → Roblox trigger
     — @robloxsdk_bot receives prompt
     — Bridge generates contract
     — Studio polls and loads automatically
     — Bot replies with contract ID + game status

4.7  Roblox Open Cloud API integration
     — Publish generated game to Roblox without opening Studio
     — Bridge calls Open Cloud after contract is validated
     — Returns live game URL
     — Studio becomes optional (dev preview only)

4.8  Phase 2 Escrow (standalone)
     — SAFE gate: auto-publish
     — ARMED gate: Telegram confirmation from Joe before publish
     — Audit record sealed with directiveId through all phases
```

**Exit criteria:** Send Telegram message → receive live Roblox game URL.
No Studio required.

---

### PHASE 3 — SPECIALIST EXPANSION
**Goal:** Support multiple game genres and richer mechanics
**Timeline:** Phase 2 + 2-3 sessions

```
4.9  New specialists
     — ui-01:    Generates full HUD and menu systems
     — net-01:   Generates RemoteEvent/RemoteFunction wiring
     — econ-01:  Generates currency, shop, game pass structure
     — data-01:  Generates DataStore (player progress persistence)
     — vfx-01:   Generates particle effects, tweens, visual polish

4.10 Multi-genre support
     — Genre catalog: tag, obby, tycoon, simulator, roleplay, horror
     — Director-01 selects appropriate specialists per genre
     — Genre-specific base templates per specialist
     — Primer library expanded (one primer per genre)

4.11 Two-pass dispatch
     — Pass 1: specialists generate modules
     — Pass 2: net-01 reads all other outputs and generates
       the RemoteEvent wiring that connects them
     — Closes the negotiation loop between specialists
```

**Exit criteria:** Three distinct genres generate and publish
without error. Tag game, obby, tycoon all work from prompt alone.

---

### PHASE 4 — ENTERPRISE SCALE
**Goal:** Production-grade pipeline serving multiple concurrent users
**Timeline:** Phase 3 + 3-4 sessions

```
4.12 Multi-tenancy
     — Multiple users/prompts running simultaneously
     — Contract queue with priority and rate limiting
     — Per-user audit trail and contract history

4.13 Monetization layer
     — econ-01 generates Roblox game passes
     — Price points set by prompt or config
     — Revenue tracking per published game
     — Robux → real money conversion reporting

4.14 Quality scoring
     — Each generated contract gets a GSI (Game Structure Index) score
     — Score based on: error-free execution, mechanic completeness,
       aesthetic coherence, performance (part count)
     — Contracts below threshold are regenerated, not published

4.15 Analytics and monitoring
     — Player count per published game
     — Session length, retention, revenue per game
     — Feedback loop: high-performing games inform specialist prompts
     — Dashboard (existing popsim-dashboard can be extended)

4.16 Open Model Contracts marketplace
     — Game templates published as OMC packs
     — Third-party specialists can be registered
     — Clients pay per generation or per published game
     — Revenue split: platform / specialist authors
```

**Exit criteria:** 10 simultaneous game generations, all published,
all revenue-tracked, all monitored. Human only approves ARMED gates.

---

## 5. ARCHITECTURE AT FULL SCALE

```
                        CONTROL PLANE
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │ Telegram │    │   API    │    │  Dashboard   │
    │   bot    │    │ endpoint │    │  (web UI)    │
    └────┬─────┘    └────┬─────┘    └──────┬───────┘
         └───────────────┴──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    Bridge Server     │  ← port 3099
              │    (bridge-server)   │
              │                      │
              │  Phase 1: Intel      │
              │  Phase 2: Escrow     │
              │  Phase 3: Manifest   │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Director-01        │
              │   + Zod schema law   │
              └──────────┬───────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    architect-01     sonic-01      system-01
    ui-01            net-01        econ-01
    vfx-01           data-01
          │              │              │
          └──────────────┴──────────────┘
                         │
              ┌──────────▼───────────┐
              │  Validation Gate     │
              │  (auto-scan, score)  │
              └──────────┬───────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Redis cache    Disk audit     Telegram alert
     (live state)   (AI-MCP-       (ARMED gate)
                    PLUGIN-
                    Creations/)
                         │
              ┌──────────▼───────────┐
              │  Open Cloud API      │  ← Phase 2
              │  (auto-publish)      │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Roblox Platform    │
              │                      │
              │  ServerScriptService │
              │  └── Loader.lua   ✅ │
              │  StarterPlayerScripts│
              │  └── ClientLoader    │
              │  StarterGui          │
              │  └── HUD             │
              │  ReplicatedStorage   │
              │  └── OMC_Hub      ✅ │
              └──────────────────────┘
```

---

## 6. PRIORITY STACK (WHAT TO BUILD NEXT, IN ORDER)

```
  PRIORITY 1  — Verified base templates per specialist      (kills code quality issues)
  PRIORITY 2  — ClientLoader + RemoteEvents                 (closes client loop)
  PRIORITY 3  — Automated validation gate in bridge         (no broken contracts)
  PRIORITY 4  — Telegram → bridge → Studio trigger          (removes human from loop)
  PRIORITY 5  — Roblox Open Cloud publishing                (removes Studio dependency)
  PRIORITY 6  — ui-01, net-01, econ-01 specialists          (richer games)
  PRIORITY 7  — Multi-genre support + primer library        (scale)
  PRIORITY 8  — Analytics, monitoring, GSI scoring          (enterprise)
  PRIORITY 9  — Marketplace / multi-tenancy                 (product)
```

---

## 7. WHERE WE ARE

```
  PHASE 1   ████████████░░░░░░░░  60% — Pipeline fires, Loader polls,
                                        geometry lands. Client loop open.

  PHASE 2   ██░░░░░░░░░░░░░░░░░░  10% — Infrastructure exists (Telegram,
                                        Redis). Not wired to Roblox yet.

  PHASE 3   ░░░░░░░░░░░░░░░░░░░░   0% — Not started.

  PHASE 4   ░░░░░░░░░░░░░░░░░░░░   0% — Not started.

  OVERALL   ███░░░░░░░░░░░░░░░░░  15% toward enterprise pipeline
```

You are not in the middle of the ocean.
You have a functioning pipeline that fires real AI-generated Luau into a live
Roblox session automatically. That is further than almost anyone has gotten.
The foundation is real. The path is clear. The work remaining is execution.

---

*PDR — Open Model Contracts / roblox-game-automator*
*Owner: MetatronScoob_369 / Joe Wales*
