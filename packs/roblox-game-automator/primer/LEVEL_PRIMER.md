# 🏮 Roblox Game Automator — Level Primer (DNA)
> **Phase 1 Intelligence Entrypoint** | Pack v1.0 | Open Model Contracts

---

## 1. Purpose & Identity

The **Roblox Game Automator** pack enables an AI agent (under OMC governance) to design,
generate, validate, and deliver Luau module code for a Roblox Studio project through a
three-phase lifecycle: **Intelligence → Escrow → Manifestation**.

This document is the **DNA** every agent MUST read before writing a single byte. It defines
the goals, file layout, specialist team concept, naming conventions, and hard constraints.

---

## 2. Goals

| # | Goal | Priority |
|---|------|----------|
| G1 | Generate surgically precise, validated Luau modules for a target Roblox level | CRITICAL |
| G2 | Produce a signed `omc.manifest.json` that governs all file outputs | CRITICAL |
| G3 | Package the module bundle into a schema-compliant `EscrowEnvelope` | HIGH |
| G4 | Deliver modules via Bridge → Studio Plugin with explicit user consent | HIGH |
| G5 | Maintain an append-only audit trail for every tool call and phase transition | HIGH |
| G6 | Keep domain-specific logic isolated; never pollute the OMC constitution | MEDIUM |

---

## 3. Project File Layout

```
packs/roblox-game-automator/
├── primer/
│   └── LEVEL_PRIMER.md            ← THIS FILE (Phase 1 entrypoint / DNA)
├── schemas/
│   ├── omc.manifest.schema.json   ← Phase 1 output manifest schema
│   ├── escrow-envelope.schema.json ← Phase 2 escrow payload schema
│   └── plugin-pull-response.schema.json ← Phase 3 plugin pull schema
├── policies/
│   ├── phase1.intelligence.policy.yaml
│   ├── phase2.escrow.policy.yaml
│   └── phase3.manifestation.policy.yaml
├── examples/
│   ├── example.manifest.json      ← Minimal valid manifest
│   ├── example.escrow-envelope.json ← Minimal valid escrow envelope
│   └── modules/
│       └── ExampleModule.luau     ← Placeholder Luau module
└── pack.yaml                      ← Pack metadata
```

Agent-produced outputs land in the **user's local repository** (not inside this spec folder):
```
<user-project-root>/
└── generated/
    └── roblox-game-automator/
        ├── omc.manifest.json
        └── modules/
            ├── StructureGenerator.luau
            ├── AtmosphereManager.luau
            └── ...
```

---

## 4. Specialist Team Concept

Each Luau module corresponds to a **Specialist** on the "Board". A Specialist has:

| Field | Description |
|-------|-------------|
| `id` | Unique slug, e.g. `architect-01` |
| `role` | Human-readable role name |
| `output_module` | Expected Luau file name |
| `capabilities` | OMC capability tags this specialist may use |
| `dependencies` | Other specialist IDs this module requires at runtime |

### Default Specialist Roster

| ID | Role | Module |
|----|------|--------|
| `architect-01` | Volumetric Construction | `StructureGenerator.luau` |
| `atmosphere-01` | Environmental Atmosphere | `AtmosphereManager.luau` |
| `traffic-01` | Traffic & Motion | `TrafficController.luau` |
| `sonic-01` | Ambient Audio & Reverb | `SoundscapeManager.luau` |
| `signage-01` | Signage & Visual Branding | `SignageManager.luau` |
| `system-01` | Player Mechanics | `PlayerMechanics.luau` |
| `monetize-01` | Monetisation & Rewards | `MonetizationBridge.luau` |

Agents MAY define additional specialists; they MUST register them in the manifest.

---

## 5. Naming Conventions

### Files
- Luau modules: `PascalCase.luau` (e.g. `StructureGenerator.luau`)
- JSON artifacts: `kebab-case.json` (e.g. `omc.manifest.json`)
- Schemas: `kebab-case.schema.json`
- Policies: `phaseN.name.policy.yaml`

### Roblox Hierarchy Target
- All agent-installed ModuleScripts land under: `ReplicatedStorage > OMCModules > <PackVersion>`
- Never modify `game.Workspace` directly; use `game.ReplicatedStorage` as staging area.
- Player-side scripts go under `StarterPlayerScripts > OMCBootstrap`.

### Variables & Services
- Services obtained via `game:GetService()` at top of every module.
- Use `local RunService = game:GetService("RunService")` style (never global).
- Module exports: `return {}` table pattern.

---

## 6. Constraints (Hard Rules)

These constraints are enforced by Phase policies. Violations MUST cause the agent to abort
and emit an error manifest entry.

| ID | Constraint |
|----|-----------|
| C1 | MUST NOT write files outside the declared `output_path` in the manifest |
| C2 | MUST NOT use `loadstring` or dynamic code execution in generated Luau |
| C3 | MUST NOT embed raw file paths, secrets, or PII in the escrow envelope |
| C4 | MUST validate every generated Luau module with `luau-analyze` or equivalent before escrow |
| C5 | MUST compute SHA-256 hash of every module and include it in the manifest |
| C6 | MUST NOT advance to Phase 2 (Escrow) without a valid `omc.manifest.json` |
| C7 | MUST NOT advance to Phase 3 (Manifestation) without a valid escrow session token |
| C8 | MUST present a diff/summary to the user in Studio before applying any changes |
| C9 | MUST respect the TTL of the escrow session; expired sessions MUST be rejected |
| C10 | MUST record every phase-gate transition in the audit log |

---

## 7. Sovereign RAG Sources

Agents SHOULD consult (in priority order):

1. `packs/roblox-game-automator/primer/LEVEL_PRIMER.md` (this file)
2. `constitution/omc.constitution.v1.yaml`
3. `constitution/capabilities.schema.json`
4. `constitution/phase-gates.md`
5. `packs/roblox-game-automator/policies/phase*.policy.yaml`
6. [Roblox Creator Hub — Luau Reference](https://create.roblox.com/docs/luau) (external)

---

## 8. Phase Summary

```
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: INTELLIGENCE                                            │
│   Agent reads this primer + sovereign docs                       │
│   Agent uses MCP write_file tool(s) to write Luau modules        │
│   Agent computes hashes + produces omc.manifest.json             │
│   Gate: manifest passes schema validation                        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ validated manifest
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: ESCROW                                                  │
│   Agent POSTs manifest + module bundle to Bridge server          │
│   Bridge validates against escrow-envelope.schema.json           │
│   Bridge stores session in memory with TTL + one-time token      │
│   Gate: Bridge returns sessionId + token; session is "armed"     │
└───────────────────────────┬──────────────────────────────────────┘
                            │ sessionId + token
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: MANIFESTATION                                           │
│   Roblox Studio Plugin polls Bridge for manifest + modules       │
│   Plugin displays diff + install plan to user                    │
│   User clicks "Apply" (explicit consent)                         │
│   Plugin writes ModuleScripts into ReplicatedStorage/OMCModules  │
│   Bridge session marked consumed; audit record written           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Color & Aesthetic Defaults (Roblox)

The default aesthetic for Metropolis-class levels:

| Element | Value |
|---------|-------|
| Primary palette | Obsidian (`#1A1A2E`) / Teal (`#0F3460`) / Violet (`#533483`) |
| Accent / neon | Cyber-blue (`#00D4FF`), Radiant-magenta (`#FF006E`) |
| Lighting | `game.Lighting.Ambient = Color3.fromRGB(10, 10, 30)` |
| Time of day | Pre-dawn (3 AM equivalent: `ClockTime = 3`) |
| Atmosphere | `FogEnd = 500`, `FogColor = Color3.fromRGB(20, 20, 40)` |

Specialists MUST honour these defaults unless the Level Primer JSON explicitly overrides them.

---

*End of Level Primer v1.0 — Governed by Open Model Contracts Constitution v1.0*
