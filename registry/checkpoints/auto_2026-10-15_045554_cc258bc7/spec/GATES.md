# Gates: SAFE vs ARMED Execution

## Overview

Gates control the risk level of contract execution. Every contract operates in one of two modes:

- **SAFE**: Permissionless operations (discovery, search, read-only)
- **ARMED**: Requires explicit approval with scope, expiry, and owner

## SAFE Mode (Default)

**Characteristics:**
- No user approval required
- Read-only operations
- Discovery and inspection
- Dry-run simulations
- No state modification

**Example operations:**
- List available contracts
- Describe contract schemas
- Search knowledge bases
- Validate contract inputs (without execution)
- Generate execution plans (without running them)

**Code:**
```typescript
const contract = {
  name: "AnalyzeData",
  gate: "SAFE",
  reversible: true,
  input: { dataset: "sales.csv" }
};
// Executes immediately, no approval needed
```

## ARMED Mode

**Characteristics:**
- Requires user approval
- Can modify state
- Must declare scope
- Must declare expiry
- Must declare owner

**Required fields:**
- `scope`: What can be affected (e.g., "example.com only", "database: customers")
- `expiry`: Time limit (ISO datetime or duration like "2 hours")
- `owner`: Who authorized (e.g., "user@example.com")

**Example operations:**
- Write to databases
- Send emails/messages
- Deploy code
- Delete resources
- Execute system commands

**Code:**
```typescript
const contract = {
  name: "DeleteRecords",
  gate: "ARMED",
  reversible: false,
  scope: "database: customers, records with age > 2 years",
  expiry: "2026-02-08T00:00:00Z",
  owner: "admin@example.com",
  input: { table: "customers", condition: "created_at < '2024-01-01'" }
};

// User sees approval prompt:
// "ARMED operation requested"
// "Scope: database: customers, records with age > 2 years"
// "Expiry: 2026-02-08T00:00:00Z"
// "Irreversible: true"
// "Approve? (y/n)"
```

## Gate Transitions

**SAFE → ARMED:**
- Contract changes from read-only to state-modifying
- Requires adding scope, expiry, owner
- User approval required

**ARMED → SAFE:**
- Contract reverts to read-only mode
- Scope/expiry/owner removed
- No approval needed

## Governance Rules

1. **Default = SAFE**: All contracts start in SAFE mode unless explicitly ARMED
2. **Irreversible = ARMED**: Any irreversible operation MUST be ARMED
3. **Scope Required**: ARMED contracts without scope are rejected
4. **Expiry Enforced**: ARMED contracts expire automatically
5. **Audit Trail**: All gate transitions logged

## Implementation Pattern

```typescript
function validateGate(contract: Contract): ValidationResult {
  if (contract.gate === "ARMED") {
    if (!contract.scope) return { valid: false, error: "ARMED requires scope" };
    if (!contract.expiry) return { valid: false, error: "ARMED requires expiry" };
    if (!contract.owner) return { valid: false, error: "ARMED requires owner" };
    if (!contract.reversible) {
      // Extra validation for irreversible operations
      if (!userApproved(contract)) {
        return { valid: false, error: "User approval required for irreversible ARMED operation" };
      }
    }
  }
  return { valid: true };
}
```

## Best Practices

**For SAFE operations:**
- Keep them truly read-only
- No hidden state mutations
- No external API calls that modify data
- Use for discovery, learning, validation

**For ARMED operations:**
- Be specific in scope (narrow is better)
- Set reasonable expiry (hours, not days)
- Clearly identify owner
- Mark reversibility accurately
- Provide clear approval prompts

## Security Model

**Defense in depth:**
1. **Gate enforcement**: SAFE/ARMED separation
2. **Scope validation**: Ensure operations stay within bounds
3. **Expiry checking**: Automatic timeout
4. **Audit logging**: Complete trail of approvals
5. **Reversibility tracking**: Know what can be undone

**The gate system prevents:**
- Accidental state modification
- Unbounded execution
- Anonymous dangerous operations
- Stale permissions
- Silent failures

---

Gates are the first line of defense in Open Model-Contracts governance.
