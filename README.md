# Open Model-Contracts

**The legal framework for AI model execution.**

Prompts are suggestions. Contracts are law.

## What It Is

Open Model-Contracts defines how AI models, agents, and tools execute work through enforceable contracts rather than informal prompts.

## The Three Meanings

1. **Open** - A standardized specification (like OpenAPI)
2. **Model** - AI models/agents/LLMs being governed
3. **Contracts** - Legally binding execution agreements

Like "model contracts" in law - reusable, validated, constitutional templates for AI work.

## Why It Exists

AI models execute work through:
- ❌ Prompts (informal, unreliable)
- ❌ Function calls (unvalidated JSON)
- ❌ Tool use (no admission control)
- ❌ Multi-agent systems (no coordination law)

**There's no legal framework. Just suggestions.**

Open Model-Contracts provides:
- ✅ **Zod-validated schemas** - Type-safe contracts
- ✅ **SAFE/ARMED gates** - Risk-based execution control
- ✅ **MCP admission** - Tool compliance audits
- ✅ **Constitutional evolution** - Self-improving governance
- ✅ **Audit trails** - Complete governance logs

## Quick Start

```bash
npm install @open-model-contracts/server
```

```typescript
import { z } from "zod";

// Define a contract
const DataAnalysis = z.object({
  dataset: z.string(),
  operations: z.array(z.enum(["filter", "aggregate", "visualize"])),
  output: z.enum(["json", "csv", "chart"])
});

// Execute through governance
const result = await omc.execute({
  contract: DataAnalysis,
  input: { 
    dataset: "sales.csv",
    operations: ["aggregate"],
    output: "json"
  },
  gate: "SAFE"
});
```

## What Gets Governed

- Single model tasks (GPT-4, Claude, Llama)
- Multi-agent orchestration
- Tool chains (MCP servers, APIs)
- RAG pipelines
- Workflow automation

**Model-agnostic. Sector-agnostic.**

## Documentation

- [OVERVIEW](./spec/OVERVIEW.md) - Introduction
- [CONTRACTS](./spec/CONTRACTS.md) - Schema specification
- [GATES](./spec/GATES.md) - SAFE/ARMED model
- [ADMISSION](./spec/ADMISSION.md) - MCP criteria
- [GOVERNANCE](./spec/GOVERNANCE.md) - Constitutional framework
- [DREAM_CYCLE](./spec/DREAM_CYCLE.md) - Self-improvement

## Status

**Alpha** - Core governance implemented.

## License

MIT

## Domicile Governance Bundle

Relocated governance contracts from Domicile live workspace now live at:
- `spec/domicile-governance/INDEX.md`

This bundle includes:
- Admission contracts (MCP/OpenClaw/Terraform/n8n/Notebook)
- SAFE/ARMED allowlists
- Governed OpenClaw target routing profiles
