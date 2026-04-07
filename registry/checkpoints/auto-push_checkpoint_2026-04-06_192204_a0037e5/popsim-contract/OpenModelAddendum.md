# Open Model-Contracts Addendum
## Schedule A: Population Simulation Domain Contract (v1.0)

**Package:** `@popsim/contract`
**Contract Ref:** [open-model-contracts](https://github.com/Metatronsdoob369/open-model-contracts)
**Domicile:** State of Delaware, USA
**Governing Law:** Laws of the State of Delaware
**Effective:** On first valid instantiation of `PopSimFullContractSchema`

---

## What This Is

This package is the first published domain extension for the open-model-contracts framework. It demonstrates the core thesis of that project in practice: **contracts are law, not suggestions. MCP is the enforcement layer, not a tool caller.**

The population simulation domain provides a natural stress-test for contract-first AI architecture. Agent swarms with heterogeneous personas, multi-round execution, SAFE/ARMED gate transitions, and mandatory human review queues — all validated at runtime by Zod schemas before any output is produced or posted.

---

## Compliance Statement

This package fully implements the governance requirements of open-model-contracts:

| Requirement | Implementation |
|---|---|
| Zod-validated schemas | `PopSimFullContractSchema`, `SimOutputSchema`, all sub-schemas |
| SAFE/ARMED gate enforcement | `GateSchema` on contract metadata, agent tasks, crew config |
| ARMED gate field requirements | `owner`, `expiry`, `scope` validated by `.refine()` |
| Audit trail | `AuditEventSchema` embedded in every `PopSimContractOutput` |
| Human review queue | `humanReviewRequired: z.literal(true)` — cannot be set false |
| Disclaimer on all outputs | `SimOutputSchema.disclaimer` is a `z.literal()` — exact string enforced |
| Domicile compliance | `contractMetadata.domicile: z.literal("State of Delaware, USA")` |
| Contract ref | `openModelContractRef: z.literal(...)` — pinned to repo URL |

---

## Schema Architecture

```
PopSimFullContractSchema (Schedule A)
├── contractMetadata          ← gate declaration, domicile, signedBy
├── config
│   ├── llmConfig             ← provider, model, temperature
│   ├── agents[]              ← SovereignScientistPersonaSchema[]
│   ├── interpopulationDynamics[]  ← trust levels, interaction patterns
│   ├── crewConfig            ← process: hierarchical | sequential | swarm
│   ├── dashboardIntegration  ← humanReviewRequired: true (non-negotiable)
│   └── safetyAndContingency  ← humanReviewGate: true, maxRiskScoreBeforeFlag
├── contractInput             ← PopSimContractInputSchema (SAFE/ARMED validated)
└── contractOutput            ← PopSimContractOutputSchema (discriminated union)
    ├── { status: 'completed', outputs[], auditTrail[] }
    ├── { status: 'requires_approval', pendingOutputs[], reason }
    └── { status: 'failed', error, auditTrail[] }
```

---

## Gate Protocol

**SAFE gate** — read-only, reversible simulation operations. Runs without additional approval fields.

**ARMED gate** — state-changing operations (posting, persisting, archiving). Requires:
- `owner: string` — who authorized this run
- `expiry: datetime` — contract expires after this timestamp
- `scope: string` — explicit scope declaration

ARMED operations that produce outputs with `riskScore >= maxRiskScoreBeforeFlag` automatically transition to `status: requires_approval` and halt. Nothing posts until a human clears the queue.

---

## Approved Use Cases

- Internal scenario planning and capability horizon forecasting
- Sovereign/ungoverned frontier agent swarm simulation with mandatory disclaimers
- AI capability red-teaming in isolated lab environments
- 5-year research paradigm migration modeling
- Interpopulation belief propagation and coalition dynamics research

---

## Prohibited Without Additional Governance

- Direct production deployment without human oversight gate active
- Disabling `humanReviewRequired` (schema enforces `z.literal(true)` — it cannot compile false)
- Posting simulation outputs to public platforms without human review
- Removing the `disclaimer` field from any `SimOutput` (enforced as `z.literal()`)

---

## The Thesis

> *Prompts are suggestions. Contracts are law.*

MCP has been treated as a tool-calling interface. This project treats it as a governance substrate. The schema *is* the policy. Zod `.refine()` *is* the compliance check. The SAFE/ARMED gate *is* the access control layer. Nothing runs outside the contract.

This package is proof that contract-first AI architecture scales to real domain complexity — sovereign agent swarms, multi-archetype populations, multi-round execution, risk-scored outputs, and auditable trails — without sacrificing the expressive power that makes the simulation valuable.

---

*This addendum ensures seamless integration with `@open-model-contracts/core` while demonstrating that domain-specific contract packages can be published, composed, and enforced independently.*
