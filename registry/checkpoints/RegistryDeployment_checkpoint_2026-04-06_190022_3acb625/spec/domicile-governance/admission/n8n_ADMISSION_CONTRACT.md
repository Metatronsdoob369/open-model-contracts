# n8n Admission Contract

Status: Draft
Owner: Domicile Governance

## Purpose
Define the conditions under which n8n workflows may operate inside Domicile, ensuring explicit affordances, safe gating, and auditable execution.

## Scope
- Applies to all n8n instances (local, cloud, containers) that touch Domicile resources.
- Covers workflow creation, modification, execution, and credential use.

## Required Properties (Non-Negotiable)
1) Enumerated Affordances
- Allowed node types must be explicitly listed per environment.
- No dynamic node execution (e.g., arbitrary code/exec) unless explicitly whitelisted and ARMED.
- Webhook and HTTP Request nodes must be scoped to approved domains.

2) Structural Mediation
- All executions flow through n8n’s engine; no out-of-band scripts triggered by n8n credentials.

3) Inspectability
- Inputs, node configs, and creds sources are inspectable before run.
- Preconditions/postconditions must be expressible for critical nodes.

4) Determinism
- Same inputs → same outputs. Non-deterministic side effects must be declared.

5) Reversibility Declaration
- Each workflow labels whether its actions are reversible; irreversible actions require ARMED + explicit scope/owner/expiry.

6) Observability
- Every run emits logs: intent, inputs (redacted), node list, outputs, errors, trace ID.
- Silent failure is forbidden.

7) Context Freshness
- Workflow affordances re-evaluated at session start; stale caches are forbidden.

## Prohibitions
- Ambient authority (unscoped creds shared across flows).
- Inline secrets in nodes; use vault/TS env only.
- Wildcard network egress; must list allowed domains/IPs.
- Unvalidated exec/SSH nodes in SAFE.

## Gates
- SAFE (default): read-only, test, plan; no writes/side effects.
- ARMED: writes allowed within declared scope + expiry + owner. Require confirmation for irreversible actions.

## Data & Creds
- Secrets pulled from vault/TS env; rotation tracked.
- Data classes must be tagged (public/internal/secret); secret data cannot be persisted in n8n execution logs.

## Change Control
- New workflows or new creds require review/PR.
- Node type whitelist changes require governance approval.

## Audit
- Store per-run audit: intent, nodes, inputs (redacted), outputs, errors, gate state, scope, owner, expiry, reversibility flag.
- Retention policy must be documented.

## Refusal Rule
- If schema/cred/target is unclear or unvalidated → refuse/stop.

## Interpretation
- Choose non-admission if ambiguous; prefer reduced capability and reversibility.
