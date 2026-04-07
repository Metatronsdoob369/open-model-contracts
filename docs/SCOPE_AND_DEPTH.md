# Scope and depth — the pickle (and how to get continuity)

**Why this file exists:** Too many agent surfaces, one big `domicile_live` with dangerously similar names, and a need for continuity across Mac ↔ Pi and across tools. This doc is the map. Update it as things change.

---

## The pickle (one paragraph)

You have **multiple agent entry points** (OpenClaw on Mac + Pi, Claude Code, Codex, Ollama), **one giant monorepo** (`domicile_live` — 118+ top-level items) that mixes real **projects** (med-supply-tracker, OMS SHEETS, Domicile_Deck), **Domicile core** (governance, MOS, packages), and **similar-looking names** (domicile vs domicile-core vs Domicile_Deck vs domicile_HYDRA). That makes scope and depth hard to grasp. You want **continuity** (one “brain” across machines and sessions) using what you already have — Telekenesis (MEMORY sync), Open Notebook (read-first memory), TARS learning — without adding more moving parts. The folly is understood; the goal is to **leverage** this topology for continuity instead of drowning in it.

---

## Agent surfaces (where work happens)

| Surface | Where | Role |
|--------|--------|------|
| **OpenClaw (Mac)** | `~/.openclaw` | Workspace SOUL/IDENTITY/AGENTS/TOOLS; project-scope; skills. |
| **OpenClaw (Pi)** | Pi5 via Tailscale | Execution plane; syncs MEMORY via Telekenesis. |
| **Claude Code** | Cursor / Claude Code | Session memory; can use domicile_live as workspace. |
| **Codex** | Spawned by OpenClaw | Coding subagent. |
| **Ollama** | Local Mac / Pi | Local inference (e.g. qwen, codellama). |

Continuity flows: **Telekenesis** (MEMORY.md Mac ↔ Pi), **Open Notebook MCP** (notebook-as-memory, Domicile-compliant), **TARS** (learning from outcomes; lives in open-notebook-domicile / personal-memory-engine).

---

## domicile_live — what’s actually in it

**Not a flat list.** Think in layers:

### 1. Real projects (things you ship or run)

- **med-supply-tracker** — App/project.
- **OMS SHEETS** — Sheets/ops project.
- **domicile-core** — Domicile packages/monorepo; **Domicile_Deck** lives under here (`domicile-core/Domicile_Deck`) — connector / UI.
- **domicile_HYDRA** — FSM multi-agent demo + reference (Mermaid, README, CLAUDE.MD).
- **ai-agent-office** — Agent office / UI project.
- **Triad-GAT-** — Another project.

### 2. Domicile “platform” (governance, MOS, shared code)

- **domicile/** — (Folder; distinct from domicile-core.)
- **domicile-core/** — Monorepo (packages, Deck, etc.).
- **governance/** — MCP admission, Open Notebook design, policies (e.g. OPEN_NOTEBOOK_MCP_DESIGN.md).
- **packages/** — Shared packages.
- **scripts/** — OpenClaw scripts, Telekenesis (e.g. `scripts/openclaw/`, memory-sync).
- **master-orchestration-system.ts** — MOS entry.
- **project-template.ts** — Template for new projects.

### 3. Naming trap

| Name | What it is |
|------|------------|
| **domicile** | Folder (lowercase) — part of platform. |
| **domicile-core** | Monorepo — packages + Domicile_Deck. |
| **Domicile_Deck** | App under domicile-core — connector potential. |
| **domicile_HYDRA** | Operation Hydra — FSM demo + reference. |

So: **domicile** ≠ **domicile-core** ≠ **Domicile_Deck** ≠ **domicile_HYDRA**. Keep this table; it’s the antidote to the illusion of “one domicile.”

### 4. Everything else (logs, docs, one-offs)

- **Skills/** (capital S), **docs/**, **index_thoughts/**, **intel/**, **logs/**, **supabase/**, **Just_to_communicate/**, **Bots/**, etc. — Support, logs, or standalone areas. Don’t treat as “projects” unless you explicitly do.

---

## Three resources you called out

| Path | What it is | Use it for |
|------|------------|------------|
| **domicile_live/governance/OPEN_NOTEBOOK_MCP_DESIGN.md** | Spec for Open Notebook MCP server (11 tools, SAFE/context/exit, read-first notebook memory). | When wiring notebook-as-memory into agents; Domicile compliance. |
| **NODE_OUT_Master/open-notebook-domicile** | Separate repo: Open Notebook stack (API, frontend, personas, TARS_LEARNING_FLOW, learning DB). | TARS learning, dream cycles, personas; “replace Notebook LM” experiments. |
| **domicile_live/scripts/openclaw/TELEKENESIS_README.md** | MEMORY.md sync Mac ↔ Pi via Redis pub/sub over Tailscale (Worker services, sync daemon, OpenClaw plugin). | Continuity between Claude Code (Mac) and OpenClaw (Pi); one MEMORY.md per workspace. |

---

## How to get continuity (without rewriting the world)

1. **One “current project” at a time** — Already in OpenClaw TOOLS.md. Use it everywhere you can: when you’re in domicile_live, set path to the **specific** subfolder (e.g. `domicile_live/med-supply-tracker` or `domicile_live/domicile-core`) so agents don’t treat the whole monorepo as one blob.
2. **This file is the map** — When you (or an agent) ask “what’s in domicile_live?” or “where do I work?”, open SCOPE_AND_DEPTH.md first. Update it when you add projects or rename things.
3. **Continuity = Telekenesis + one MEMORY.md** — Get Telekenesis running so Mac and Pi share the same MEMORY.md for the workspace(s) you care about. That’s “one brain” without merging repos.
4. **Open Notebook / TARS when you’re ready** — OPEN_NOTEBOOK_MCP_DESIGN tells you how notebook memory fits. open-notebook-domicile is where TARS learning and “replace Notebook LM” live. Tie them in when you want that sprint; don’t block continuity on them.
5. **Deck as connector** — Domicile_Deck (under domicile-core) is the “connector potential.” Use it as the single UI that can point at “current project,” show scope, or trigger agents, so you’re not switching 10 UIs.

---

## Quick “where do I work today?” rule

- **If “I’m in domicile_live”** → You’re not; you’re in **one** of: med-supply-tracker, OMS SHEETS, domicile-core, domicile_HYDRA, ai-agent-office, … Set that path explicitly (TOOLS.md, or your head).
- **If “which agent?”** → OpenClaw (Mac) = primary workspace + project-scope. Pi = execution. Claude Code = when you’re in Cursor on a repo. Codex = when OpenClaw spawns it. Don’t blend them in one conversation.
- **If “where’s memory?”** → MEMORY.md in the workspace (Telekenesis syncs it). Open Notebook = notebook-shaped memory when you wire it. TARS = learning DB in open-notebook-domicile / personal-memory-engine.

---

*Update this doc when you add a project, rename something, or change how continuity works. One source of truth for scope and depth.*
