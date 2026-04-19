# Open Model Contracts — Agent Operating Guide

## Read This First
- `packs/roblox-game-automator/primer/LEVEL_PRIMER.md` — Phase‑1 DNA for game automation.
- `constitution/omc.constitution.v1.yaml` + `constitution/phase-gates.md` — global law + required artifacts per phase.
- `packs/roblox-game-automator/policies/phase*.policy.yaml` — enforcement rules for phases 1/2/3.
- MCP Informant (`src/informant/mcp-server.ts`): use `list_contracts`, `get_contract`, `validate_payload` instead of guessing schemas.
- Research/context: `notes/research/index.jsonl` + `notes/research/summaries/` hold cited papers; reference them when policies/contracts rely on external sources.

## What Makes This Stack Different
- **Contract-as-law, spec-over-impl**: the spec in `spec/` + committed JSON Schemas in `spec/json-schema/` outrank code opinions.
- **Edge governance, not trust**: Bridge (default 3099) + Roblox plugin enforce TTL, one-time tokens, manifest hashes, and explicit user consent.
- **Numerical gates**: TriadGAT / GSI checks and other validators (see `gsi-gate/`, `governance_handoff.ts`) can hard-stop bad simulations before they render.
- **Registry-first memory**: `./scripts/checkpoint.sh` snapshots to `registry/`; `./scripts/ship.sh` is the only allowed push path and forces a memo.
- **Domain swaps are normal**: packs/domains can rotate (racing → flight → market → population → swarm) as long as contracts are updated and validated.

## Operating Order (Three-Phase)
- **Phase 1 — Intelligence**: write modules only after a contract exists; generate `omc.manifest.json`; validate via `npm run check:schema` or MCP `validate_payload`.
- **Phase 2 — Escrow**: POST manifest + modules to the Bridge; honor TTL/token; no valid manifest → no escrow.
- **Phase 3 — Manifestation**: Roblox plugin must show diff + get explicit consent before writing to `ReplicatedStorage/OMCModules`; tokens are one-time.

## Prompt Pause Protocol
- If intent is ambiguous or not covered by a contract, **stop and ask**. Restate the issue, propose the contract change, wait for confirmation.
- For faulty prompts, slow down: re-read Phase DNA + policies, then continue only with clarified intent.

## Safety & Quality
- No secrets or PII in code, manifests, or escrow envelopes; use env vars.
- Validate every generated module (e.g., `luau-analyze`) and include SHA-256 hashes in the manifest.
- Fail closed on contract violations; log every phase-gate transition; prefer typed schemas and automated checks over intuition.

## Do / Do Not
- Do: cite contract source (`spec/contracts/` or MCP) in PRs and commits; keep `REPOSITORY_CATALOG.md` up to date when governance changes.
- Do: use bridge + plugin flows; keep audit IDs from runs when available.
- Do not: bypass MCP law, skip the pause step for ambiguous prompts, or ship code without a prior or updated contract.
