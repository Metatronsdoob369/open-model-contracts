# AI Operations Manager — Reference Implementation

**Demonstrates:** Contract-driven AI execution with SAFE/ARMED gates

## What It Shows

1. **Zod schema validation** — Input/output contracts enforced
2. **SAFE/ARMED gates** — Strategic tasks require ARMED gate
3. **Gate expiry** — Time-boxed execution windows
4. **Discriminated unions** — Type-safe result types
5. **Contract chaining** — Input validated → Execute → Output validated

## Files

- `contract.ts` — Zod schemas and gate validation (70 lines)
- `executor.ts` — Minimal execution example (50 lines)
- `test.ts` — Runnable test case (30 lines)

**Total: 150 lines**

## Run It

```bash
npm install zod uuid
tsx test.ts
```

## Expected Output

```json
{
  "task_id": "f336d0bc-b841-465b-8045-024475c079dd",
  "status": "completed",
  "result": {
    "type": "strategic_report",
    "executive_summary": "AI operations review for Engineering, Product",
    "recommendations": [...],
    "next_steps": [...]
  },
  "confidence_score": 95
}
```

## Extend This

### For Your Domain

1. **Change the task types** — Replace AI operations with your domain
2. **Adjust the schema** — Add your context fields
3. **Implement real execution** — Replace mock data with actual logic
4. **Add more result types** — Extend the discriminated union

### Example Adaptations

- **Healthcare:** Patient intake contracts (HIPAA-compliant)
- **Finance:** Trading order contracts (risk-gated)
- **Legal:** Document review contracts (approval workflows)
- **DevOps:** Deployment contracts (environment-gated)

**Contract pattern stays the same. Domain changes.**

## Pattern Breakdown

### Input Contract Structure

```typescript
{
  task_type: enum[...],        // What to do
  scope: { ... },              // Where/who
  context: { ... },            // Business context
  gate: "SAFE" | "ARMED",      // Risk level
  expiry: datetime,            // Time limit
  owner: string                // Accountable party
}
```

### Output Contract Structure

```typescript
{
  task_id: uuid,
  status: "completed" | "requires_approval" | "failed",
  result: discriminatedUnion[...],  // Type-safe result
  confidence_score: 0-100,
  reasoning: string
}
```

### Gate Enforcement

- **SAFE:** Read-only, analysis, no side effects
- **ARMED:** Decisions, commitments, resource allocation

**Gate + Expiry + Owner = Accountable execution**

---

**This is the spec. Not production code.**

For production FSM orchestration, see: [domicile_live](https://github.com/Metatronsdoob369/Domicile) (reference implementation)
