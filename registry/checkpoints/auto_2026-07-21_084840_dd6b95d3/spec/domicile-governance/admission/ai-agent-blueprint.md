## Standardized Agent Operations (Proposed)

This section turns the blueprint into a single, repeatable operating standard that every agent must pass before it is considered deployable. It is designed to encode trust, safety, and business impact as defaults, not afterthoughts.

### 0) Operating Contract (Always-On)
- **Mode**: SAFE by default. No execution without explicit arming.
- **Scope**: Context is explicit; nothing is assumed.
- **Authority**: Actions are bounded by contract and revocable.
- **Auditability**: Every action is logged with inputs, outputs, and reasoning traces.
- **Exit**: Operator can stop, disarm, and leave at any time.

### 1) Agent Profile (Required Artifact)
Every agent ships with a one-page profile:
- **Problem & Owner**: The exact business problem and accountable owner.
- **User**: The primary user persona and acceptance criteria.
- **Capabilities**: What the agent can do, and what it refuses to do.
- **Dependencies**: Models, tools, data stores, and external systems.
- **Success Metrics**: Target KPIs and acceptable thresholds.
- **Risk Register**: Known risks, mitigations, and escalation rules.

### 2) Capability Boundaries (Non-Negotiable)
- **Tool gating**: Tools require explicit enablement per contract.
- **Data gating**: Access is least-privilege and purpose-bound.
- **Execution gating**: Write/delete/side-effect actions require ARM.
- **Output gating**: Safety checks run before user-visible responses.

### 3) Governance Lifecycle (State Machine)
1. **Entry**: Operator declares intent. Context is empty.
2. **Load**: Explicitly load files, datasets, and tools.
3. **Plan**: Agent proposes steps, scope, and risk level.
4. **Arm**: Operator approves scope/time/impact.
5. **Execute**: Actions are performed with logging and guardrails.
6. **Review**: Results are summarized; errors are surfaced.
7. **Exit**: Memory is offered, not assumed.

### 4) Observability and Evidence
- **Action log**: Tool calls, parameters, and responses.
- **Decision log**: Why a tool or action was chosen.
- **Context log**: What was loaded, when, and by whom.
- **Integrity log**: Hashes of outputs and artifacts for audit.

### 5) Reliability Rules
- **Failure is local**: Errors do not cascade.
- **Recovery is single-step**: Return to SAFE on failure.
- **Retries are explicit**: No silent retries.
- **Hallucination control**: Require citation or source for claims.

### 6) Trust, Ethics, and Compliance
- **Bias checks**: Known bias vectors are tested and documented.
- **Explainability**: Provide a concise rationale for key decisions.
- **Privacy**: PII handling is explicit and logged.
- **Security**: Secrets never leave the allowed boundary.

### 7) Performance and Business Value
Each agent must report:
- **Task success rate**
- **Latency and cost per task**
- **Error rate and recovery rate**
- **User satisfaction score**
- **Revenue impact or cost savings**

### 8) Human-AI Collaboration
- **Humans own intent and approval**.
- **Agents own execution within bounds**.
- **Escalation routes** are defined and fast.

### 9) Release Gate (Minimum Bar)
An agent cannot ship unless it passes:
- **Safety**: SAFE/ARM enforced, logs enabled, exit works.
- **Scope**: Tool and data boundaries validated.
- **Reliability**: Error handling and recovery tested.
- **Business**: KPI baseline established.
- **Governance**: Profile, contract, and risk register complete.

### 10) Standard Artifacts (Always Present)
- Agent Profile
- Governance Contract
- Tool & Data Scope Map
- Audit Log Spec
- KPI Dashboard Definition
- Rollback Plan

---
*Governance v1.0 — Derived from the Open Model Contracts Constitution*
