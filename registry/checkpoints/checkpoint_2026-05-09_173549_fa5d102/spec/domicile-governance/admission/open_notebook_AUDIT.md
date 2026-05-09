# Open Notebook Audit & Affordance Policy

Status: Draft
Owner: Domicile Governance

## Purpose
Govern use of interactive notebooks/LLM notebooks (e.g., Jupyter, Claude/Notebook-style) that can execute code or access Domicile data.

## Scope
- Applies to any notebook runtime (local/remote/container) used by Domicile contributors.
- Covers kernel selection, data access, code execution, and sharing/export.

## Required Properties
1) Enumerated Affordances
- Approved kernels/languages must be listed; arbitrary shells/disallowed kernels are forbidden unless explicitly ARMED.
- Allowed data mounts/volumes and network egress destinations must be enumerated.

2) Structural Mediation
- Execution must go through the notebook runtime; no hidden sidecar exec.

3) Inspectability
- Notebook must allow inspection of cells, variables, and outbound calls before execution.

4) Determinism
- Randomness must be seeded/declared when results matter; hidden randomness is disallowed for critical ops.

5) Reversibility Declaration
- Mark cells/flows as reversible or irreversible; irreversible needs ARMED + scope/expiry.

6) Observability
- Execution logs with cell ID, inputs (redacted), outputs/errors, data sources touched, and network calls.

7) Context Freshness
- Mounted data/catalog enumerated at session start; stale mounts forbidden.

## Prohibitions
- Inline secrets in notebooks; use env/vault injection.
- Unscoped network egress (no wildcard hosts).
- Persisting secret data in outputs or exported notebooks.

## Gates
- SAFE: analysis/read-only; no external writes, no infra changes.
- ARMED: writes allowed within declared scope (target resource), owner, expiry.

## Data Handling
- Tag data classes; secret data must not be written to disk or shared outputs.
- Exports (HTML/PDF) must scrub outputs containing secrets.

## Audit
- Keep per-session audit: user, kernel, data mounts, network egress, cells run, gate state, irreversible actions.

## Refusal Rule
- If data class, target, or network destination is unclear → refuse.

## Interpretation
- Favor reduced capability and reversibility when ambiguous.
