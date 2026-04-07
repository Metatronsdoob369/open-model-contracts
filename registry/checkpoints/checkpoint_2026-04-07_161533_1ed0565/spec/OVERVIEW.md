# Open Model-Contracts: Overview

## What Is Open Model-Contracts?

Open Model-Contracts is a constitutional framework for governing AI model execution. It provides:

- **Contract schemas** instead of informal prompts
- **Gate enforcement** (SAFE/ARMED) for risk management
- **MCP admission criteria** for tool governance
- **Constitutional evolution** through dream cycles
- **Complete audit trails** for all operations

## The Core Problem

AI systems fail in predictable ways:

1. **Informal contracts**: Prompts are suggestions, not law
2. **No risk gates**: Dangerous operations execute without approval
3. **Untrusted tools**: External services bypass governance
4. **Static behavior**: Systems don't learn from mistakes
5. **No audit trails**: Can't trace decisions

## The Solution

Open Model-Contracts provides **governance as code**:

### 1. Contracts (Not Prompts)

```typescript
// Before: Prompt (informal, unreliable)
"Please analyze the sales data and generate a report"

// After: Contract (formal, validated)
const AnalyzeData = z.object({
  dataset: z.string(),
  operations: z.array(z.enum(["filter", "aggregate", "visualize"])),
  outputFormat: z.enum(["json", "csv", "chart"])
});
```

**Result:** Type-safe, validated, auditable.

### 2. Gates (SAFE vs ARMED)

```typescript
// Read-only operation (SAFE)
const analysis = await execute({
  contract: AnalyzeData,
  gate: "SAFE",
  input: { dataset: "sales.csv", operations: ["aggregate"], outputFormat: "json" }
});

// State-modifying operation (ARMED)
const deletion = await execute({
  contract: DeleteRecords,
  gate: "ARMED",
  scope: "database: customers, records > 2 years old",
  expiry: "2026-02-08T00:00:00Z",
  owner: "admin@example.com",
  input: { table: "customers", condition: "created_at < '2024-01-01'" }
});
// User sees approval prompt before execution
```

**Result:** Dangerous operations require explicit approval.

### 3. MCP Admission (Tool Governance)

Before any MCP server can execute, it must pass 8 criteria:

1. Enumerated affordances (no runtime tool invention)
2. Structural mediation (no bypass paths)
3. Inspectability (query before execution)
4. Determinism (repeatable behavior)
5. Reversibility declaration (explicit labels)
6. Observability surface (no silent failures)
7. Context freshness (current state reflection)
8. Explanatory obligation (explain failures)

**Result:** Only trusted, well-behaved tools execute.

### 4. Constitutional Evolution (Dream Cycles)

Systems self-improve through nightly optimization:

```typescript
// 3 AM: TARS reviews performance
const dreamCycle = {
  mutations: [
    { param: "routing_confidence_threshold", old: 0.7, new: 0.65 }
  ],
  evidence: {
    testRuns: 50,
    successRate: 0.96,
    speedImprovement: "60% faster fallback"
  }
};

// If successful: Promote to production
// If failed: Rollback automatically

// Result: Constitutional amendment
{
  type: "dream_promotion",
  approved_by: "TARS (autonomous)",
  can_rollback: true
}
```

**Result:** Systems optimize themselves based on empirical evidence.

### 5. Governance Logging

Every operation creates an audit trail:

```typescript
{
  timestamp: "2026-02-07T14:35:00Z",
  contract: "DeleteRecords",
  gate: "ARMED",
  scope: "database: customers, records > 2 years",
  expiry: "2026-02-08T00:00:00Z",
  owner: "admin@example.com",
  approved: true,
  duration_ms: 450,
  success: true,
  records_affected: 1247
}
```

**Result:** Complete accountability.

## Architecture

```
┌─────────────────────────────────────┐
│  Your Application/Orchestrator     │
│  (HYDRA, Claude Desktop, Custom)   │
└──────────────┬──────────────────────┘
               │ MCP connection
               ↓
┌─────────────────────────────────────┐
│  Open Model-Contracts Server        │
│  ├─ validate_contract               │
│  ├─ check_mcp_admission             │
│  ├─ transition_gate                 │
│  ├─ dispatch_contract               │
│  ├─ query_performance               │
│  ├─ propose_amendment               │
│  └─ execute_dream_cycle             │
└──────────────┬──────────────────────┘
               │ Governed execution
               ↓
┌─────────────────────────────────────┐
│  AI Models, Tools, MCP Servers      │
│  (execute under constitutional law) │
└─────────────────────────────────────┘
```

## What Gets Governed

Anything involving AI execution:

- **Single model tasks**: GPT-4, Claude, Llama
- **Multi-agent orchestration**: Planning, execution, critique
- **Tool chains**: MCP servers, APIs, functions
- **RAG pipelines**: Retrieval, ranking, generation
- **Workflow automation**: Triggers, actions, validations

**The framework is model-agnostic and sector-agnostic.**

## Why "Open"

Like OpenAPI standardized REST contracts, Open Model-Contracts aims to standardize AI governance. This is a specification, not proprietary tooling.

## Status

**Alpha** - Core governance implemented. Standardizing for ecosystem adoption.

## Next Steps

- Read [CONTRACTS.md](./CONTRACTS.md) - Contract schema design
- Read [GATES.md](./GATES.md) - SAFE/ARMED model
- Read [ADMISSION.md](./ADMISSION.md) - MCP admission criteria
- Read [GOVERNANCE.md](./GOVERNANCE.md) - Constitutional framework
- Read [DREAM_CYCLE.md](./DREAM_CYCLE.md) - Self-improvement protocol
