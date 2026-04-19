# Idea — VLM Guardrails for Workflow/Manifest QA

Problem: Visual/code or manifest mismatches can slip through after deployment; need fast QA without bypassing contracts/workflow validation.

Hypothesis: Use a multimodal model (LLaVA/Kosmos) to review fixed camera frames + manifest/workflow metadata and emit structured findings (`fault`, `confidence`, `suggested_fix`). Treat outputs as advisory and route through governance/validation.

How
- Capture deterministic frames from target runtime (e.g., Studio render, 3D viz) and attach manifest hash/module IDs.
- Send frame + short summary to VLM; return JSON finding.
- Log finding in audit trail and optionally feed `faultType` into repair/validation pipeline.
- Keep embeddings + references in `notes/research/index.jsonl` for provenance.

Open questions
- Latency/cost thresholds for VLM calls.
- Which findings can auto-gate vs. require human review.
- How many fixed camera angles give acceptable coverage.
