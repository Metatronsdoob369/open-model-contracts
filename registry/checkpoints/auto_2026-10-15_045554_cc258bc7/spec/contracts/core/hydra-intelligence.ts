import { z } from "zod";

/**
 * HYDRA Intelligence Contract
 *
 * Introduces property-hydra as an OMC-governed Intelligence Operating System.
 *
 * Hydra is not a lead scorer. It is an auditable intelligence engine that
 * amplifies unclaimed property signals across multiple independent data layers,
 * enforces strict OBSERVED/INFERRED/VERIFIED truth discipline, and produces
 * structured, machine-readable intelligence briefs that can be sold to
 * institutional buyers with full audit trail guarantees.
 *
 * Repo: ~/property-hydra
 * Store: ~/property-hydra/store/records.jsonl (~39K records, national)
 * Dashboard: localhost:3456 (Lead-ER Board)
 *
 * Architecture:
 *   HYDRA Agent (enrichment worker) → append-only agent_briefs.jsonl
 *   LEADER (auditor)               → brief health, signal drift, truth discipline
 *   GATES                          → SAFE (read tools) / ARMED (state writes, outreach)
 *   DREAM_CYCLE                    → memory pruning as record volume scales nationally
 *   GOVERNANCE (TARS)              → self-amending scoring weights from outcome telemetry
 */

// ── Signal classification ──────────────────────────────────────────────────

export const SignalLabel = z.enum(["OBSERVED", "INFERRED", "VERIFIED"]);
export type SignalLabel = z.infer<typeof SignalLabel>;

export const ObservedSignalZod = z.object({
  label: z.literal("OBSERVED"),
  signal: z.string(),
  source_field: z.string(),       // e.g. "base.owner_name"
  value: z.string(),
  weight: z.number().optional(),
  multiplier: z.number().optional(),
});

export const InferredSignalZod = z.object({
  label: z.literal("INFERRED"),
  signal: z.string(),
  reason: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const VerifiedSignalZod = z.object({
  label: z.literal("VERIFIED"),
  signal: z.string(),
  tool: z.string(),               // which tool produced the verification
  result: z.string(),
  verified_at: z.string().datetime(),
});

export const AnySignalZod = z.discriminatedUnion("label", [
  ObservedSignalZod,
  InferredSignalZod,
  VerifiedSignalZod,
]);

// ── Agent brief ────────────────────────────────────────────────────────────

export const AgentBriefTierZod = z.enum([
  "ALBATROSS",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "WATCH",
]);

export const AgentBriefStatusZod = z.enum([
  "unseen",
  "candidate",
  "brief_pending",
  "brief_ready",
  "verification_pending",
  "tool_verified",
  "human_review_required",
  "approved_for_export",
  "stale",
  "error",
  "rejected",
]);

export const BuyerProfileZod = z.enum([
  "heir_finder",
  "real_estate_wholesaler",
  "mineral_rights_broker",
  "estate_attorney",
  "financial_advisor",
  "debt_collector",
  "skip_trace_firm",
]);

export const VerificationStepZod = z.object({
  step: z.string(),
  tool: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  gate: z.enum(["SAFE", "ARMED"]),
});

export const ScoreExplanationZod = z.object({
  base_score: z.number(),
  dormancy_multiplier: z.number(),
  address_multiplier: z.number(),
  overlay_bonus: z.number().optional(),
  final_score: z.number(),
  scaled_score: z.number().min(0).max(100),
  score_version: z.string(),       // e.g. "albatross-v0.2.1"
});

export const AuditZod = z.object({
  input_hash: z.string(),          // sha256 of the record at brief time
  tool_calls: z.array(z.object({
    tool: z.string(),
    args: z.record(z.unknown()),
    result_summary: z.string(),
    gate: z.enum(["SAFE", "ARMED"]),
    called_at: z.string().datetime(),
  })),
  human_review_required: z.boolean(),
  leader_reviewed: z.boolean().default(false),
  leader_verdict: z.string().optional(),
});

export const HydraAgentBriefZod = z.object({
  // Identity
  property_id: z.string(),
  brief_id: z.string(),            // e.g. "brief_20260429_0800_AL_14997267"
  agent: z.literal("hydra-agent"),
  agent_version: z.string(),
  model: z.string(),               // e.g. "ollama/qwen2.5-coder:7b"
  created_at: z.string().datetime(),
  status: AgentBriefStatusZod,

  // Summary
  summary: z.string(),

  // Classification
  classification: z.object({
    tier: AgentBriefTierZod,
    lead_stage: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    buyer_fit: z.array(BuyerProfileZod),
  }),

  // Signal breakdown — OBSERVED / INFERRED / VERIFIED only
  observed_signals: z.array(ObservedSignalZod),
  inferred_signals: z.array(InferredSignalZod),
  verified_signals: z.array(VerifiedSignalZod),

  // Score transparency
  score_explanation: ScoreExplanationZod,

  // Action guidance
  recommended_verifications: z.array(VerificationStepZod),

  // Per-profile buyer notes
  buyer_notes: z.record(BuyerProfileZod, z.string()).optional(),

  // Risk
  risk_flags: z.array(z.string()),

  // Audit trail
  audit: AuditZod,
});

export type HydraAgentBrief = z.infer<typeof HydraAgentBriefZod>;

// ── Gate definitions ───────────────────────────────────────────────────────

export const HydraToolGates = {
  // SAFE — read-only, no approval required
  SAFE: [
    "lookup_assessor",       // Nominatim → BDC geocode
    "validate_phone",        // BDC GraphQL
    "validate_email",        // BDC GraphQL
    "search_probate",        // store cross-reference
    "find_pattern_matches",  // store scan
  ],
  // ARMED — state-modifying, requires explicit approval
  ARMED: [
    "flag_record",           // writes agent_flag to store
    "send_sms",              // outreach — TCPA governed
    "send_email",            // outreach
    "export_dossier",        // approved_for_export transition
    "amend_score_weights",   // TARS constitutional amendment
  ],
} as const;

// ── DREAM_CYCLE memory tiers ───────────────────────────────────────────────

export const MemoryTierZod = z.enum([
  "HOT",       // < 7 days, actively referenced
  "WARM",      // 7–30 days
  "COLD",      // 30–90 days
  "ARCHIVED",  // > 90 days, compressed
  "PRUNED",    // evicted from vector store
]);

// ── OMC AgentContract for Hydra ────────────────────────────────────────────

export const HydraContractZod = z.object({
  enhancement_area: z.literal("Auditable Intelligence Operating System — Unclaimed Property"),

  objective: z.literal(
    "Build a nationally-scalable, self-auditing intelligence engine that amplifies " +
    "unclaimed property signals across multiple independent data layers, enforces " +
    "OBSERVED/INFERRED/VERIFIED truth discipline at the schema level, and produces " +
    "structured agent_brief overlays suitable for sale to institutional buyers " +
    "requiring full audit trail guarantees."
  ),

  implementation_plan: z.object({
    modules: z.array(z.string()),
    architecture: z.string(),
    estimated_effort: z.string().optional(),
  }),

  governance: z.object({
    security: z.literal(
      "ARMED gate required for all state-modifying operations. " +
      "Outreach (SMS/email) requires explicit user approval and TCPA compliance review. " +
      "No prompt injection from external data sources into tool execution paths."
    ),
    compliance: z.literal(
      "All agent briefs are append-only. records.jsonl is never mutated by the agent layer. " +
      "Constitutional amendments are versioned with before/after state. " +
      "Score weight changes require outcome telemetry evidence."
    ),
    ethics: z.literal(
      "Signals are labeled OBSERVED/INFERRED/VERIFIED — never conflated. " +
      "Probate and estate data is used for legitimate asset recovery only. " +
      "No claim that an estate is open unless probate data confirms it."
    ),
  }),

  validation_criteria: z.literal(
    "Phase 1: agent_briefs.jsonl accumulates structured briefs for top-scored records. " +
    "Phase 2: LEADER health panel shows brief quality metrics. " +
    "Phase 3: 10 dossiers exported and sold — outcome telemetry begins feeding TARS. " +
    "Phase 4: TARS amends score weights based on closed deal evidence."
  ),

  confidence_score: z.number().min(0).max(1),

  depends_on: z.array(z.string()),
  sources: z.array(z.string()),
});

export type HydraContract = z.infer<typeof HydraContractZod>;

// ── Canonical instance ─────────────────────────────────────────────────────

export const HYDRA_CONTRACT: HydraContract = {
  enhancement_area: "Auditable Intelligence Operating System — Unclaimed Property",

  objective:
    "Build a nationally-scalable, self-auditing intelligence engine that amplifies " +
    "unclaimed property signals across multiple independent data layers, enforces " +
    "OBSERVED/INFERRED/VERIFIED truth discipline at the schema level, and produces " +
    "structured agent_brief overlays suitable for sale to institutional buyers " +
    "requiring full audit trail guarantees.",

  implementation_plan: {
    modules: [
      "store/agent_briefs.jsonl          — append-only brief log",
      "agents/hydra_agent.py             — enrichment worker (SAFE tools only)",
      "agents/leader.py                  — brief auditor (reads, never writes briefs)",
      "bridge/internal_scorer.py         — deterministic scoring, no LLM",
      "bridge/wholesale_crossref.py      — property data overlay",
      "bridge/ingest.py                  — national TSV → IntelRecord pipeline",
      "dashboard/                        — Lead-ER Board (localhost:3456)",
      "GATES enforcement                 — SAFE/ARMED per tool",
      "DREAM_CYCLE                       — HOT→WARM→COLD→ARCHIVED→PRUNED",
      "TARS constitutional amendments    — score weight drift from outcome telemetry",
    ],
    architecture:
      "Five-layer system: Sweep Engine (unclaimed-property-search) → " +
      "Intelligence Engine (property-hydra) → Estate Bridge (property-intel-sdk) → " +
      "Wholesale Engine (packages/property-intel) → Operator Dashboard. " +
      "Agent layer is append-only. LEADER is read-only auditor. " +
      "ARMED gate governs all outreach and constitutional amendments.",
    estimated_effort: "Phase 1: 1 session. Phase 2: 1 session. Phase 3: immediate.",
  },

  governance: {
    security:
      "ARMED gate required for all state-modifying operations. " +
      "Outreach (SMS/email) requires explicit user approval and TCPA compliance review. " +
      "No prompt injection from external data sources into tool execution paths.",
    compliance:
      "All agent briefs are append-only. records.jsonl is never mutated by the agent layer. " +
      "Constitutional amendments are versioned with before/after state. " +
      "Score weight changes require outcome telemetry evidence.",
    ethics:
      "Signals are labeled OBSERVED/INFERRED/VERIFIED — never conflated. " +
      "Probate and estate data is used for legitimate asset recovery only. " +
      "No claim that an estate is open unless probate data confirms it.",
  },

  validation_criteria:
    "Phase 1: agent_briefs.jsonl accumulates structured briefs for top-scored records. " +
    "Phase 2: LEADER health panel shows brief quality metrics. " +
    "Phase 3: 10 dossiers exported and sold — outcome telemetry begins feeding TARS. " +
    "Phase 4: TARS amends score weights based on closed deal evidence.",

  confidence_score: 0.91,

  depends_on: [
    "omc.constitution.v1.yaml",
    "spec/CONTRACTS.md",
    "spec/GATES.md",
    "spec/GOVERNANCE.md",
    "spec/DREAM_CYCLE.md",
  ],

  sources: [
    "~/property-hydra/FAMILY.md",
    "~/property-hydra/CODEX.md",
    "~/property-hydra/agents/leader_board_agent.md",
    "~/property-hydra/bridge/internal_scorer.py",
    "~/property-hydra/store/records.jsonl",
  ],
};

// Validate on import
HydraContractZod.parse(HYDRA_CONTRACT);
