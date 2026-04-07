# OpenClaw Admission Contract

Status: Draft
Owner: Domicile Governance

## Purpose
Allow OpenClaw/Molt agents to operate under Domicile law with explicit affordances, SAFE/ARMED gates, and full auditability.

## Scope
- Applies to all OpenClaw/Molt skill executions from any client (Deck, LiveShell, notebook, CLI).
- Covers skill discovery, selection, input construction, execution, and logging.

## Required Properties (Non‑Negotiable)
1) Enumerated Affordances
- Skills must be pre‑indexed/whitelisted (no runtime tool invention).
- Only skills listed in the SAFE or ARMED allowlists may be called.
- Parameters must be inspectable before execution.

2) Structural Mediation
- All execution is mediated by the OpenClaw server/CLI; no bypass or raw shell unless explicitly whitelisted.

3) Inspectability
- Caller can query: available skills, required inputs, pre/postconditions, reversibility flag.

4) Determinism
- Given same state/inputs, skill behaves deterministically; nondeterminism must be declared.

5) Reversibility Declaration
- Each skill must label reversible/irreversible. Irreversible requires ARMED + scope + expiry + owner.

6) Observability
- Log inputs (redacted), outputs, success/failure, duration, reversible flag, and scope. Silent failure forbidden.

7) Context Freshness
- Skill index must be refreshed per session (no stale capability surfaces).

## Prohibitions
- Runtime tool/skill invention.
- Ambient authority (wildcard shells, unscoped network egress).
- Inline secrets in parameters; use env/vault only.
- Execution without schema/examples.

## Gates
- SAFE (default): discovery, search, render prompts, dry‑run/describe, read‑only fetch. `ENABLE_OPS=false`.
- ARMED: execution allowed within declared scope + expiry + owner; only armed allowlist; irreversible actions must be clearly flagged.

## Target Routing
- Multi-instance routing is allowed only through governed target profiles (for example `local`, `pi`).
- Active target must be selected from a static in-repo allowlist (no ad hoc host/port input at runtime).
- Switching targets must preserve SAFE/ARMED behavior, allowlists, and audit logging.
- Unknown targets or malformed profiles must be refused.

## Data & Creds
- Secrets come from vault/env; never embedded in skill args. Redact before logging.

## Audit
- Every run records: intent, skill name, args (redacted), gate (SAFE/ARMED), scope, owner, expiry, reversible flag, output summary, errors.

## Refusal Rule
- If schema/examples are missing, target unclear, or gate not satisfied → refuse.

## Interpretation
- When ambiguous: choose non‑admission, reduced capability, and reversibility.
