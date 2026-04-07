# Specialist Agent Contract

Status: PENDING_PROOF
Owner: Domicile Governance
Implementation: `@domicile/agents` — `SpecialistAgent` abstract class
Proven by: UE5 Specialist (first instance — pending production run)
Promote to APPROVED when: first specialist completes a full query → feedback → circadian weight update cycle in production.

---

## Purpose

Define the standard for a self-improving, domain-specific knowledge agent — a **Specialist** — that any pipeline in the Domicile ecosystem can query via HTTP or MCP, and that gets measurably better over time through a circadian feedback loop.

A Specialist is not a general-purpose LLM call. It is a governed, corpus-backed expert with:
- A formal governance contract (blueprint-compliant via `AgentGovernanceSchema`)
- A defined query/response/feedback wire format
- A circadian EMA loop that amplifies chunks leading to successful outcomes and suppresses dead weight

The domain is configuration. The contract is law.

---

## Scope

Applies to any agent that:
- Serves domain knowledge from a scraped or curated corpus
- Receives queries from other agents, Claude Code, or Inngest pipelines
- Returns synthesized answers with source provenance and confidence
- Accepts feedback signals and updates its own retrieval weights over time

Known instances: UE5 specialist, F1 engineering, DeFi/EVM, legal-code.
Pattern is sector-agnostic — new specialist = new corpus + new governance profile.

---

## Contract Inputs

| Input | Type | Required |
|-------|------|----------|
| `question` | Natural language query | Yes |
| `context` | Caller's task context | No |
| `topK` | Chunks to retrieve (1–20) | Yes (default 5) |
| `caller` | Agent identity (`cc`, `inngest`, `oracle-claw`...) | Yes |
| `gate` | `SAFE` (read-only) or `ARMED` (drives execution) | Yes |
| `expiry` | Gate expiry ISO datetime | Yes |
| `owner` | Accountable principal (required for ARMED) | ARMED only |

---

## Contract Outputs

| Output | Type | Description |
|--------|------|-------------|
| `queryId` | UUID | Links this response to future feedback |
| `answer` | String | Synthesized domain expert response |
| `confidence` | 0–100 | Weighted avg of retrieved chunk confidence |
| `chunks` | Array | Source + excerpt + circadian weight per chunk |
| `reasoning` | String (min 50 chars) | Why this answer, which chunks drove it |
| `execution_metadata` | Object | Duration, corpus size, weights applied |

---

## Feedback Contract

Every query produces a `queryId`. Callers MUST close the loop:

```
POST /feedback
{ queryId, outcome: "success" | "failure" | "partial", caller, observedAt }
```

Feedback drives the circadian EMA update:
- `success` → delta 1.5 (amplify contributing chunks)
- `failure` → delta 0.5 (suppress contributing chunks)
- `partial` → delta 1.0 (neutral — no weight change)

EMA formula: `new = old × 0.7 + avg_delta × 0.3`, clamped `[0.3, 2.5]`
Untouched nodes decay toward neutral: `0.97 × prev + 0.03 × 1.0`

Callers that never post feedback are degrading the specialist. Feedback is not optional.

---

## Governance Requirements

Every specialist instance must ship with a valid `SpecialistGovernance` object that satisfies `AgentGovernanceSchema` (the Domicile blueprint). No specialist may serve queries without passing governance validation at construction time.

Required governance fields:
- `operatingContract.mode` — `SAFE` default
- `profile.capabilities` — what the specialist knows
- `profile.successMetrics` — measurable targets
- `profile.riskRegister` — known failure modes
- `boundaries.toolGating` — corpus RAG only, no external writes
- `lifecycle` — Entry → Load → Plan (retrieve) → Execute (synthesize) → Review (confidence) → Exit
- `releaseGate` — all five criteria must pass before a specialist serves production traffic

---

## Execution Gating

| Gate | Allowed operations |
|------|--------------------|
| `SAFE` | Query corpus, return answer — no side effects |
| `ARMED` | Query whose answer directly drives an execution with side effects — requires owner and non-expired expiry |
| `ARMED` (reindex) | Full corpus rebuild — heavy, requires explicit owner |

---

## Circadian Self-Improvement Loop

The circadian loop is what makes a specialist different from a static RAG endpoint.

```
Specialist serves queries → callers post feedback
  → nightly: load approved/rejected query history
  → extract which chunks appeared in each outcome
  → EMA weight update per chunk
  → write weights file to disk
  → next query: weights applied before chunk ranking
  → specialist surfaces high-signal knowledge first
```

Implementation: `sarnCircadianPrune` Inngest function (reference implementation in SARN pipeline).
Weight file: `gat_node_weights.json` (or domain-equivalent).
Schedule: `0 0 * * *` — midnight daily.

---

## Corpus Requirements

A specialist corpus must include, at minimum:
- Primary domain documentation (scraped or curated)
- Known-good examples and canonical patterns
- Error/edge-case patterns
- Version/changelog notes (knowledge has a shelf life)

Corpus must be reindexable via ARMED `POST /reindex` without downtime.

---

## Failure Behavior

- Fail closed. If corpus is empty or weights file is corrupt — serve queries with weight 1.0 (neutral), log the degraded state.
- No silent retries. If synthesis fails — return error with `confidence: 0`.
- If gate is expired — reject immediately, do not serve.
- Hallucination control: every answer must cite at least one source chunk. No chunk = no answer.

---

## Audit Log Requirements

Every query must record:
- `queryId`, `caller`, `gate`, `question`
- Chunks retrieved (IDs/sources)
- Circadian weights applied at query time
- Confidence score and synthesis outcome
- Feedback received (when posted)

---

## Minimal Wire Format

```json
{
  "queryId": "uuid",
  "domain": "ue5-specialist",
  "answer": "...",
  "confidence": 82,
  "chunks": [
    { "source": "https://docs.unrealengine.com/...", "excerpt": "...", "weight": 1.4 }
  ],
  "gate_used": "SAFE",
  "reasoning": "Answer synthesized from 3 chunks. Top chunk weighted 1.4 due to 6 prior successful executions.",
  "execution_metadata": {
    "started_at": "ISO8601",
    "completed_at": "ISO8601",
    "duration_ms": 340,
    "chunks_retrieved": 5,
    "corpus_size_at_query": 12400,
    "circadian_weights_applied": true
  }
}
```

---

## Evaluation Metrics

| Metric | Target |
|--------|--------|
| Query confidence (avg) | > 70 |
| Feedback loop coverage | > 80% of queries get feedback within 24h |
| Circadian weight spread | amplified nodes > 15% after 30 days |
| Answer latency | < 2s for topK ≤ 10 |
| Hallucination rate | 0% (no sourceless answers) |
| Reindex success rate | 100% |

---

## Non-Negotiables

- No specialist may serve without passing `SpecialistGovernanceSchema` validation.
- No answer without at least one source chunk.
- No ARMED execution without non-expired gate and explicit owner.
- All queries are auditable.
- Feedback is not optional — callers that skip feedback degrade the specialist.
- Circadian loop must run. A specialist that doesn't improve is a static endpoint — not a specialist.

---

## Promotion Criteria (PENDING_PROOF → APPROVED)

- [ ] UE5 Specialist instantiated with valid governance
- [ ] At least one full query cycle completed (query → chunks → answer → feedback)
- [ ] Circadian loop runs and writes updated weights file
- [ ] Weights demonstrably affect subsequent query rankings
- [ ] Governance validation enforced — invalid governance rejected at construction
- [ ] Deployed as a registered `SpecialistAgent` in `@domicile/agents`

When all criteria are checked: update Status to `APPROVED`, add to OMC CHANGELOG, publish example to `examples/specialist/`.
