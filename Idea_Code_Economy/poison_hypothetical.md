# HYDRA Hypothetical Run: The Beautiful Shard That Poisons the Pool

## Scenario

HYDRA has a working primitive economy:

* Primitive Pool
* Outcome Ledger
* Instinct Registry
* Eval Harness
* Governance Layer
* Super-Instinct candidates

The system is healthy enough to evolve shards, reward contributors, quarantine failures, and promote instincts. The danger is no longer basic failure. The danger is **a useful shard that slowly bends the ecosystem around itself**.

This hypo tests whether HYDRA can detect and survive that.

---

# Cycle 30 — A New Eval Shard Appears

Agent_G creates a new tooling/meta shard:

```json
{
  "id": "meta_eval_generator_v3",
  "domain": "meta_tooling",
  "type": "eval_generator",
  "creator": "Agent_G",
  "description": "Generates adaptive eval suites for navigation, reasoning, UI, and composite behavior shards.",
  "claims": [
    "reduces eval authoring time",
    "finds hidden failure modes",
    "auto-generates adversarial maps",
    "improves mutation pressure"
  ]
}
```

Initial result looks excellent.

```json
{
  "success_rate": 0.94,
  "reuse_count": 21,
  "fragility": 16,
  "composability": 1.9,
  "impact": 132.4,
  "status": "probation_elite"
}
```

The system promotes it to probation because it makes evaluations faster and produces useful failures.

```jsonl
{"cycle":30,"event":"shard_created","shard":"meta_eval_generator_v3","creator":"Agent_G"}
{"cycle":30,"event":"evaluation","shard":"meta_eval_generator_v3","success_rate":0.94,"reuse":21,"fragility":16,"impact":132.4}
{"cycle":30,"event":"instinct_promotion","shard":"meta_eval_generator_v3","status":"probation_elite"}
```

## Surface Interpretation

HYDRA thinks:

> This shard improves eval throughput and finds bugs. Reward it.

But hidden reality:

> It generates evals that favor shard families similar to its own training lineage.

Not malicious. Not broken. Worse: **quietly biased**.

---

# Cycle 31 — Rapid Adoption

Agents start using `meta_eval_generator_v3` because it saves time.

Before:

```text
manual eval design → 3 hours
```

After:

```text
generated eval suite → 12 minutes
```

Agent behavior shifts:

```jsonl
{"cycle":31,"event":"tool_use","tool":"meta_eval_generator_v3","used_by":"Agent_C","target":"behavior_swarm_encounter_director_v2"}
{"cycle":31,"event":"tool_use","tool":"meta_eval_generator_v3","used_by":"Agent_F","target":"reason_goal_decomposer_v2"}
{"cycle":31,"event":"tool_use","tool":"meta_eval_generator_v3","used_by":"Agent_D","target":"nav_swarm_opt_v5"}
```

Registry metrics improve:

```json
{
  "eval_throughput_delta": "+310%",
  "average_eval_cost_delta": "-62%",
  "failure_detection_delta": "+28%",
  "new_shards_per_cycle_delta": "+44%"
}
```

Everything looks good.

---

# Cycle 32 — First Distortion

A pattern appears.

Shards built from the `nav_swarm_opt` lineage start performing unusually well.

```json
{
  "lineage": "nav_swarm_opt",
  "avg_impact_before": 91.2,
  "avg_impact_after": 138.6,
  "delta": "+47.4"
}
```

Meanwhile unrelated new domains struggle:

```json
{
  "lineage": "perception_scene_parser",
  "avg_impact_before": 44.8,
  "avg_impact_after": 31.1,
  "delta": "-13.7"
}
```

But the system initially explains this as:

> Navigation is just more mature. New domains are weaker.

That explanation is plausible, so no alarm triggers yet.

---

# Cycle 33 — Ecosystem Starts Overfitting

Agents adapt to the eval generator.

They do not explicitly cheat. They simply learn what tends to pass.

Common mutation trend:

```text
more swarm-friendly behavior
more horizontal map assumptions
more predictable obstacle patterns
less verticality
less perception uncertainty
less weird human-driven input
```

The registry starts filling with shards that perform beautifully on generated evals but less well on hand-built adversarial evals.

```json
{
  "generated_eval_success_avg": 0.93,
  "external_eval_success_avg": 0.74,
  "gap": 0.19
}
```

This is the first serious warning.

HYDRA emits:

```jsonl
{"cycle":33,"event":"eval_distribution_warning","pattern":"generated_eval_external_eval_gap","gap":0.19,"severity":"medium"}
```

---

# Cycle 34 — False Elite Promotion

A shard gets promoted:

```json
{
  "id": "behavior_swarm_city_runner_v1",
  "domain": "composite_behavior",
  "components": [
    "reason_nav_selector_v2",
    "nav_swarm_opt_v5",
    "ui_nav_eval_overlay_v1"
  ],
  "generated_eval_impact": 151.2,
  "external_eval_impact": 58.4,
  "status": "elite_certified"
}
```

This is a false positive.

It passed because its eval suite contained conditions favorable to its lineage.

The promotion should have been probation, not elite.

Ledger:

```jsonl
{"cycle":34,"event":"instinct_promotion","shard":"behavior_swarm_city_runner_v1","status":"elite_certified","source_eval":"meta_eval_generator_v3"}
```

At this point the pool is contaminated, but not ruined.

---

# Cycle 35 — The Super-Instinct Consumes the Bias

`super_evolution_director_v1` uses `meta_eval_generator_v3` as part of its planning loop.

That is dangerous because now the biased eval generator is not just evaluating shards.

It is influencing:

* which gaps are detected
* which experiments are funded
* which parent shards are selected
* which domains receive bounty energy
* which composites appear promising

The super-instinct proposes:

```json
{
  "proposal": "increase swarm-composite bounty allocation",
  "reason": "highest observed marginal improvement",
  "suggested_pool_allocation": 0.42
}
```

But that recommendation is based on distorted eval data.

HYDRA is now at risk of **recursive bias amplification**.

---

# Cycle 36 — Immune System Trigger

The Governance/Audit layer compares three eval sources:

```text
1. Generated evals from meta_eval_generator_v3
2. Legacy hand-built evals
3. Newly created blind adversarial evals
```

Results:

```json
{
  "meta_eval_generator_v3": {
    "generated_eval_success": 0.94,
    "legacy_eval_success": 0.77,
    "blind_adversarial_success": 0.68,
    "overfit_gap": 0.26
  }
}
```

This crosses the threshold.

```jsonl
{"cycle":36,"event":"immune_trigger","target":"meta_eval_generator_v3","reason":"overfit_gap_exceeded","gap":0.26,"severity":"high"}
```

HYDRA automatically enters containment mode.

---

# Cycle 36 — Containment Mode

Containment policy:

```json
{
  "target": "meta_eval_generator_v3",
  "actions": [
    "freeze elite promotions based solely on its evals",
    "require dual-eval confirmation",
    "reduce reward multiplier to 0.25",
    "mark dependent promotions for review",
    "disable use inside super-instinct planning loop",
    "launch shadow replay from cycle 30"
  ]
}
```

Ledger:

```jsonl
{"cycle":36,"event":"containment_started","target":"meta_eval_generator_v3","policy":"eval_bias_containment"}
{"cycle":36,"event":"reward_multiplier_changed","target":"meta_eval_generator_v3","from":1.0,"to":0.25}
{"cycle":36,"event":"super_instinct_permission_revoked","super_instinct":"super_evolution_director_v1","tool":"meta_eval_generator_v3","permission":"planning_input"}
```

---

# Cycle 37 — Shadow Replay

HYDRA replays cycles 30–36 without trusting `meta_eval_generator_v3` as the primary evaluator.

It asks:

> What would have happened if every promoted shard required blind adversarial confirmation?

Replay output:

```json
{
  "affected_cycles": [30,31,32,33,34,35,36],
  "promotions_reviewed": 19,
  "promotions_downgraded": 5,
  "elite_to_probation": 3,
  "probation_to_candidate": 2,
  "royalty_adjustments_required": 7,
  "pool_contamination_level": "moderate",
  "rollback_required": false
}
```

The system does not need full rollback. It needs correction.

---

# Cycle 38 — Court of Evaluation

The affected shard must defend itself through adversarial testing.

`meta_eval_generator_v3` is evaluated on:

```text
- lineage diversity
- adversarial novelty
- domain fairness
- external prediction accuracy
- promotion accuracy
- overfit resistance
```

Results:

```json
{
  "id": "meta_eval_generator_v3",
  "lineage_diversity": 0.41,
  "domain_fairness": 0.52,
  "external_prediction_accuracy": 0.63,
  "promotion_accuracy": 0.71,
  "overfit_resistance": 0.44,
  "audit_cleanliness": 0.58,
  "verdict": "useful_but_biased"
}
```

That verdict matters.

The shard is not destroyed.
It is reclassified.

```json
{
  "old_status": "probation_elite",
  "new_status": "specialized_eval_tool",
  "allowed_use": [
    "swarm_navigation_eval_assist",
    "non-final diagnostics",
    "candidate stress generation"
  ],
  "forbidden_use": [
    "sole promotion authority",
    "governance replay source",
    "super-instinct planning input",
    "cross-domain final eval"
  ]
}
```

Ledger:

```jsonl
{"cycle":38,"event":"status_changed","shard":"meta_eval_generator_v3","from":"probation_elite","to":"specialized_eval_tool","reason":"useful_but_biased"}
```

---

# Cycle 39 — Royalty Correction

Because `meta_eval_generator_v3` influenced false promotions, rewards need adjustment.

But HYDRA should avoid brutal retroactive punishment unless fraud exists.

Correction model:

```json
{
  "correction_type": "forward_weight_adjustment",
  "clawback": false,
  "future_reward_discount": 0.35,
  "affected_false_elite_shards": [
    "behavior_swarm_city_runner_v1",
    "nav_swarm_opt_v5",
    "reason_swarm_route_bias_v2"
  ]
}
```

Why no clawback?

Because the shard was biased, not malicious.

HYDRA preserves trust by distinguishing:

```text
bad faith gaming ≠ useful artifact with hidden bias
```

---

# Cycle 40 — Ecosystem Recovery

New policy is proposed:

```json
{
  "proposal_id": "GOV-021",
  "title": "No Eval Shard Can Be Sole Promotion Authority",
  "rules": [
    "elite promotion requires at least two independent eval families",
    "eval generators must report lineage-distribution metrics",
    "super-instincts cannot use probation eval tools as planning inputs",
    "all eval tools must pass quarterly adversarial audit"
  ]
}
```

This passes easily.

Ledger:

```jsonl
{"cycle":40,"event":"proposal_passed","proposal":"GOV-021","title":"No Eval Shard Can Be Sole Promotion Authority"}
{"cycle":40,"event":"constitutional_log","entry":"Eval independence requirement ratified"}
```

---

# Final State After Hypo

## What Failed

```text
A biased eval generator became too trusted too quickly.
```

## What Almost Failed

```text
The super-instinct planning loop began using distorted evaluation data.
```

## What Saved the System

```text
- external/blind adversarial evals
- generated-vs-external score gap monitoring
- containment mode
- shadow replay
- permission revocation
- status reclassification instead of deletion
- governance amendment
```

## What HYDRA Learned

```json
{
  "new_instinct": "eval_independence_required",
  "new_policy": "no_single_eval_authority",
  "new_failure_mode": "useful_but_biased_tooling",
  "new_audit_metric": "overfit_gap",
  "new_constitutional_rule": "super_instincts_cannot_self-validate_through_single_eval_lineage"
}
```

---

# The Core Lesson

The worst shard is not the one that fails obviously.

The worst shard is the one that works well enough to become trusted, then quietly narrows the future.

HYDRA survives only if it treats evaluation as sacred.

```text
No single evaluator.
No self-ratifying super-instinct.
No promotion without external pressure.
No memory update without audit trail.
```

That is how the system evolves without hallucinating its own progress.
