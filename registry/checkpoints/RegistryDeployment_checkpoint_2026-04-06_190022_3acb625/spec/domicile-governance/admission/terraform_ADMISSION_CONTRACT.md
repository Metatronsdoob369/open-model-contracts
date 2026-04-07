# Terraform Admission & Execution Policy

Status: Draft
Owner: Domicile Governance

## Purpose
Set the conditions for running Terraform (CLI or MCP server) inside Domicile, with explicit affordances, SAFE/ARMED gates, and auditable changes.

## Scope
- Terraform CLI runs (plan/apply/destroy/import/state).
- Terraform MCP server tool calls.
- Applies to all workspaces/environments unless otherwise noted.

## Allowed Affordances (Enumerated)
- SAFE (default): `init`, `fmt`, `validate`, `plan`, `show`, `state list`, `state pull`.
- ARMED (requires explicit scope+owner+expiry): `apply`, `destroy`, `state rm`, `state mv`, `import`, provisioners that can mutate.
- Module sources: Terraform Registry, or vetted git domains only (no arbitrary SSH/HTTP origins).
- Providers: pinned versions required; deny "latest".

## Prohibitions
- Runtime tool invention or arbitrary exec via provisioners in SAFE.
- Unpinned providers or modules with unknown origin.
- Writing secrets into `*.tfvars` or state; use data sources or vault.
- Wildcard network egress from provisioners; must whitelist hosts when ARMED.
- Apply/destroy without remote state locking.

## Gating & Mediation
- Default gate is SAFE; ARMED must specify: workspace, target resources (if possible), owner, expiry, reversibility.
- MCP server must expose only enumerated tools (`--tools` or `--toolsets`), with `ENABLE_TF_OPERATIONS=false` in SAFE.
- No direct execution paths that bypass MCP mediation.

## State & Backends
- Remote state with locking required (e.g., S3+Dynamo, TFE/TFC, PG backend). If backend is missing or unlocked, refuse ARMED actions.
- State must be encrypted at rest; no local state in production.

## Credentials & Secrets
- Terraform credentials (TFE_TOKEN, cloud creds) come from env/vault, not committed files.
- Validate that required creds exist before ARMED actions; refuse otherwise.

## Observability & Audit
Every run must log: user, gate (SAFE/ARMED), workspace, backend, command, plan/apply outputs (redacted), provider/module hashes, state lock info, start/end time, success/failure, reversible flag.

## Reversibility
- Mark operations as reversible/irreversible; irreversible (destroy, imports, state edits) require ARMED + confirmation.

## Refusal Rules
- If backend missing/unlocked, providers unpinned, module origin unvetted, or creds absent → refuse.
- If tool schema/examples are missing for MCP calls → refuse.

## Interpretation
When ambiguous: choose non-admission, reduced capability, and reversibility.
