# MCP RAG Specialist Contract

Status: Draft
Owner: Domicile Governance

## Purpose
Provide a governed, retrieval-augmented specialist that maps intent to MCP tool calls with verified inputs, explicit permissions, and auditable outcomes.

## Scope
- Applies to any agent that selects, composes, or executes MCP tools using retrieved context.
- Covers tool selection, input construction, execution gating, and post-run verification.

## Contract Inputs
- User intent (task request)
- Allowed tool list (by server and tool name)
- Active policy state (SAFE/ARMED, duration, blast radius)
- Retrieval corpus (MCP specs, examples, policies)

## Contract Outputs
- Selected tool(s) and arguments
- Execution plan with gates (confirm/arm requirements)
- Result summary with provenance
- Audit log entry (inputs, tool calls, outputs, errors)

## Retrieval Corpus Requirements
Include, at minimum:
- MCP server tool schemas and descriptions
- Server-specific authentication and limits
- Canonical examples (known-good calls)
- Error/edge-case patterns
- Governance policies and arming rules
- Change logs and version notes

## Retrieval Policy
- Prefer the most recent, authoritative tool schema.
- Retrieve at least one example payload for every tool call.
- If schema or example is missing, the agent must refuse or request clarification.
- No execution without explicit schema match and parameter validation.

## Tool Selection Rules
- Choose the minimal tool set that satisfies the intent.
- Prefer deterministic tools over generative tools for critical operations.
- Disallow tool chaining unless each step is validated and gated.

## Execution Gating
- SAFE: tool selection and dry-run only; no execution.
- ARMED: execution allowed within stated scope and duration.
- Dangerous tools require explicit confirmation and arming.
- If scope is ambiguous, halt and request clarification.

## Validation & Verification
- Validate tool arguments against schema before execution.
- Verify outputs against expected types or postconditions.
- On mismatch, mark as failed and do not proceed to downstream steps.

## Failure Behavior
- Fail closed. No retries without updated context or user confirmation.
- Record the failure with error details and tool inputs.
- Offer a minimal, safe alternative if available.

## Audit Log Requirements
Every run must record:
- Intent and constraints
- Retrieved sources (IDs/paths)
- Chosen tool(s) and arguments
- Execution gate state (SAFE/ARMED)
- Output summary and verification results
- Errors and remediation steps

## Minimal Output Schema (JSON)
```
{
  "intent": "string",
  "tools": [
    {
      "server": "string",
      "tool": "string",
      "args": { "...": "..." },
      "requires_arm": true
    }
  ],
  "gate": {
    "state": "SAFE|ARMED",
    "expires_at": "ISO8601"
  },
  "result": {
    "ok": true,
    "summary": "string",
    "verification": "pass|fail",
    "errors": []
  }
}
```

## Evaluation Metrics
- Tool selection accuracy
- Argument validity rate
- Execution success rate
- Verification pass rate
- Average time to resolve
- Refusal correctness (when data is missing or unsafe)

## Non-Negotiables
- No execution without schema match and gate compliance.
- No hidden tool calls.
- All runs are auditable.

