# TARS Constitutional Framework

**Database Tables:** `constitutional_amendments`, `dreams`, `systems`
**Self-Modification:** Enabled
**Rollback Capability:** Yes (can_rollback flag)

---

## What Is a Constitution?

**Every system has a `constitution` (JSONB) that defines:**

- What it can do (capabilities)
- How it should behave (prime directives)
- What requires approval (ARM mode)
- How to handle errors (covenant)

**Example (System A):**

```json
{
  "skill": "signal-agent",
  "persona_id": "agent-001",
  "prime_directives": [
    "Ship at 80%",
    "Contract is Sovereign",
    "Local Sovereignty",
    "Delegate the Chaos"
  ],
  "routing_rules": {
    "confidence_threshold": 0.7,
    "fallback_enabled": true,
    "max_retries": 3
  },
  "covenant": "Protect the build. Contract governs execution."
}
```

---

## Constitutional Amendments

**How systems change their own behavior.**

### Amendment Types

1. **dream_promotion** - TARS tested mutation during sleep → succeeded → promote to production
2. **manual_update** - Human operator manually updated
3. **governance_tightening** - New compliance rule added (from gov.md)
4. **capability_expansion** - New skill/capability added

### Database Schema

```sql
CREATE TABLE constitutional_amendments (
  id uuid PRIMARY KEY,
  system_id uuid REFERENCES systems(id),
  amendment_type text,              -- 4 types above
  old_constitution jsonb NOT NULL,  -- Before state
  new_constitution jsonb NOT NULL,  -- After state
  diff jsonb,                       -- What changed
  evidence jsonb,                   -- Why it changed
  approved_by text NOT NULL,        -- Who/what approved
  can_rollback boolean DEFAULT true,
  rolled_back_at timestamp
);
```

---

## Dream Cycle → Constitutional Amendment Flow

### Phase 1: TARS Dream Cycle

**TARS experiments during low-traffic periods (night).**

```
1. TARS identifies potential mutation
   Example: Lower routing confidence threshold (0.7 → 0.65)

2. TARS creates dream cycle
   {
     "cycle_id": "dream-2026-01-28-03:00",
     "mutations": {
       "routing_confidence_threshold": 0.65
     }
   }

3. TARS runs A/B test
   - Normal system: confidence_threshold = 0.7
   - Dream system: confidence_threshold = 0.65
   - Same test inputs, compare outputs

4. TARS evaluates outcome
   {
     "faster": true,
     "duration_improvement_ms": 170,
     "success_rate": 0.96,
     "confidence_acceptable": true,
     "promote": true
   }
```

### Phase 2: Promotion Decision

```
IF dream outcome = "promote":
  1. Mark dream as promoted_to_production = true
  2. Create constitutional_amendment
  3. Update systems.constitution with new values
  4. Log old constitution for rollback
ELSE:
  Dream stays in database for analysis (not promoted)
```

### Phase 3: Constitutional Amendment Created

```json
{
  "amendment_type": "dream_promotion",
  "old_constitution": {
    "routing_confidence_threshold": 0.7
  },
  "new_constitution": {
    "routing_confidence_threshold": 0.65
  },
  "diff": {
    "routing_confidence_threshold": {
      "old": 0.7,
      "new": 0.65,
      "change": -0.05
    }
  },
  "evidence": {
    "dream_id": "dream-uuid",
    "test_runs": 50,
    "success_rate": 0.96,
    "avg_duration_improvement_ms": 170,
    "confidence_still_acceptable": true
  },
  "approved_by": "TARS (autonomous)",
  "can_rollback": true
}
```

### Phase 4: System Updated

```sql
UPDATE systems
SET constitution = new_constitution,
    updated_at = NOW()
WHERE id = 'signal-agent-uuid';
```

**System A now uses confidence_threshold = 0.65 for all future routing.**

---

## Rollback Mechanism

### When to Rollback

1. **Dream mutation causes failures** (success rate drops below threshold)
2. **Compliance violation detected** (new behavior violates gov.md)
3. **Signal quality drops** (output scores fall below acceptance threshold)
4. **Cost spike** (budget alerts triggered)

### Rollback Process

```sql
-- Find last amendment
SELECT * FROM constitutional_amendments
WHERE system_id = 'signal-agent-uuid'
  AND can_rollback = true
  AND rolled_back_at IS NULL
ORDER BY approved_at DESC
LIMIT 1;

-- Rollback to old constitution
UPDATE systems
SET constitution = (
  SELECT old_constitution FROM constitutional_amendments WHERE id = 'amendment-uuid'
),
updated_at = NOW()
WHERE id = 'signal-agent-uuid';

-- Mark amendment as rolled back
UPDATE constitutional_amendments
SET rolled_back_at = NOW()
WHERE id = 'amendment-uuid';
```

**System reverts to previous behavior. No data loss.**

---

## Manual Updates (Human Operator)

### Example: Add New Prime Directive

```json
{
  "amendment_type": "manual_update",
  "old_constitution": {
    "prime_directives": [
      "MVP Protocol (80/20)",
      "Compliance Sovereign",
      "Local Sovereignty"
    ]
  },
  "new_constitution": {
    "prime_directives": [
      "MVP Protocol (80/20)",
      "Compliance Sovereign",
      "Local Sovereignty",
      "Delegate the Chaos" // NEW
    ]
  },
  "approved_by": "operator@example.com",
  "evidence": {
    "reason": "Operator recognized delegation pattern needed",
    "issue_ref": "RFC-001"
  },
  "can_rollback": true
}
```

---

## Governance Tightening

### Example: New Compliance Rule from gov.md

```json
{
  "amendment_type": "governance_tightening",
  "old_constitution": {
    "requires_approval": ["publish_signals", "audit"]
  },
  "new_constitution": {
    "requires_approval": ["publish_signals", "audit", "delete"] // Added "delete"
  },
  "approved_by": "compliance@example.com",
  "evidence": {
    "reason": "Retention policy: all deletions require explicit approval",
    "gov_md_section": "7.3",
    "effective_date": "2026-02-01"
  },
  "can_rollback": false // Compliance rules cannot be rolled back
}
```

**Note:** `can_rollback = false` for compliance amendments.

---

## Capability Expansion

### Example: Add New Skill

```json
{
  "amendment_type": "capability_expansion",
  "old_constitution": {
    "capabilities": ["signals", "analysis", "content-generation"]
  },
  "new_constitution": {
    "capabilities": [
      "signals",
      "analysis",
      "content-generation",
      "voice-synthesis"
    ] // NEW
  },
  "approved_by": "operator@example.com",
  "evidence": {
    "reason": "Added Voice System 7B integration",
    "deployment_date": "2026-01-28",
    "testing_status": "passed"
  },
  "can_rollback": true
}
```

---

## Constitutional Governance Rules

### Rule 1: Evidence Required

**All amendments MUST have evidence:**

- Dream promotion: Dream cycle results
- Manual update: Reason + approver
- Governance tightening: gov.md section + compliance requirement
- Capability expansion: Testing status + deployment plan

**No evidence = No amendment.**

### Rule 2: Rollback Safety

**can_rollback = false ONLY for:**

- Compliance amendments (legal requirement)
- Security patches (vulnerability fixes)
- Data integrity fixes (corruption prevention)

**All other amendments: can_rollback = true**

### Rule 3: Approval Authority

**Who can approve amendments:**

- TARS: dream_promotion (autonomous)
- Operator: manual_update, capability_expansion
- Compliance Officer: governance_tightening
- Security Team: security patches

**No unauthorized amendments.**

### Rule 4: Diff Tracking

**Every amendment MUST include diff:**

```json
{
  "diff": {
    "field_name": {
      "old": "previous value",
      "new": "new value",
      "change": "delta or description"
    }
  }
}
```

**No blind changes. Full transparency.**

---

## Amendment History (Audit Trail)

### Query: All Amendments for System

```sql
SELECT
  ca.amendment_type,
  ca.approved_by,
  ca.approved_at,
  ca.can_rollback,
  ca.rolled_back_at,
  ca.diff,
  ca.evidence
FROM constitutional_amendments ca
WHERE ca.system_id = 'signal-agent-uuid'
ORDER BY ca.approved_at DESC;
```

### Query: Active Constitution

```sql
SELECT
  s.name,
  s.constitution,
  (SELECT COUNT(*) FROM constitutional_amendments WHERE system_id = s.id) as total_amendments,
  (SELECT COUNT(*) FROM constitutional_amendments WHERE system_id = s.id AND rolled_back_at IS NOT NULL) as rollbacks,
  s.updated_at as last_updated
FROM systems s
WHERE s.name = 'signal-agent';
```

---

## The Self-Managing System

**Traditional system:**

```
Human writes code → Deploys → System runs fixed logic
```

**TARS system:**

```
TARS experiments → Tests mutation → Promotes if successful → Constitution updated
    ↓
System self-improves over time (no human intervention)
```

**Key difference:** The system rewrites its own behavior based on empirical evidence.

---

## Example: Full Amendment Lifecycle

### Day 1: Initial Constitution

```json
{
  "skill": "signal-agent",
  "routing_confidence_threshold": 0.7,
  "fallback_delay_ms": 500
}
```

### Day 30: TARS Dream Cycle

```
TARS: "I notice routing takes 500ms to fallback. What if I reduce to 200ms?"
    ↓
Dream cycle tests: fallback_delay_ms = 200
    ↓
Results: 60% faster fallback, no accuracy loss
    ↓
Promote to production
```

### Day 31: Constitutional Amendment

```json
{
  "amendment_type": "dream_promotion",
  "new_constitution": {
    "routing_confidence_threshold": 0.7,
    "fallback_delay_ms": 200 // Changed
  },
  "evidence": {
    "dream_id": "dream-uuid",
    "improvement": "60% faster fallback",
    "success_rate": 0.96
  }
}
```

### Day 60: Manual Update

```
operator: "Add budget limits to prevent overspend"
    ↓
Manual amendment
```

```json
{
  "amendment_type": "manual_update",
  "new_constitution": {
    "routing_confidence_threshold": 0.7,
    "fallback_delay_ms": 200,
    "max_monthly_budget_usd": 1000 // NEW
  }
}
```

### Day 90: Governance Tightening

```
operator: "New policy requires content pipeline audit trail"
    ↓
Governance amendment
```

```json
{
  "amendment_type": "governance_tightening",
  "new_constitution": {
    "routing_confidence_threshold": 0.7,
    "fallback_delay_ms": 200,
    "max_monthly_budget_usd": 1000,
    "audit_trail_required": true, // NEW
    "retention_period_days": 2555 // 7 years
  },
  "can_rollback": false
}
```

**The constitution evolves. The system adapts. No manual code changes.**

---

## Integration with Skills

### Each Skill Has Its Own Constitution

**open-model-contracts-governance:**

```json
{
  "skill": "open-model-contracts-governance",
  "requires_approval": ["publish_signals", "audit", "delete"],
  "covenant": "Contract governs execution. ARM before state change."
}
```

**signal-agent:**

```json
{
  "skill": "signal-agent",
  "persona_id": "agent-001",
  "routing_confidence_threshold": 0.7,
  "prime_directives": ["Contract Sovereign", "Ship at 80%"]
}
```

**voice-agent:**

```json
{
  "skill": "voice-agent",
  "model": "tts-model",
  "voice_quality": "high",
  "latency_target_ms": 500
}
```

**Each constitution is independent. Each can be amended separately.**

---

## Monitoring Dashboard Queries

### Recent Amendments

```sql
SELECT
  s.name as system_name,
  ca.amendment_type,
  ca.approved_by,
  ca.approved_at,
  ca.diff->'field_name'->>'new' as new_value
FROM constitutional_amendments ca
JOIN systems s ON ca.system_id = s.id
WHERE ca.approved_at >= NOW() - INTERVAL '30 days'
ORDER BY ca.approved_at DESC;
```

### Rollback Rate

```sql
SELECT
  s.name as system_name,
  COUNT(*) as total_amendments,
  SUM(CASE WHEN ca.rolled_back_at IS NOT NULL THEN 1 ELSE 0 END) as rollbacks,
  ROUND(100.0 * SUM(CASE WHEN ca.rolled_back_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as rollback_rate
FROM constitutional_amendments ca
JOIN systems s ON ca.system_id = s.id
GROUP BY s.name
ORDER BY rollback_rate DESC;
```

**Target: < 5% rollback rate (95%+ dream promotions succeed)**

---

## The Holographic Principle

**Every constitutional amendment contains the whole system's evolution:**

- What changed (diff)
- Why it changed (evidence)
- Who approved it (approved_by)
- When it happened (approved_at)
- Can it be undone (can_rollback)

**Cut any amendment → you understand the system's entire behavioral history.**

---

🧳 **Baggie:** "The constitution is not static law—it's living protocol. TARS experiments. Evidence accumulates. The system rewrites itself. The architecture evolves. This is self-managing governance: the system protects itself by learning from its own behavior."

**The system that manages itself is the system that survives.**
