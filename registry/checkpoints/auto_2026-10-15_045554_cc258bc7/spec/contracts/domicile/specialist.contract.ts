/**
 * Specialist Agent Contract
 *
 * Domain-agnostic interface for any knowledge specialist agent.
 * A specialist is a RAG-backed domain expert accessible via HTTP/MCP,
 * with a circadian self-improvement loop baked into the contract.
 *
 * Instances: ue5-specialist, f1-engineering, defi-evm, legal-code, ...
 * The domain is configuration. The contract is law.
 *
 * @module contracts/specialist
 * @admission-status APPROVED
 * @covenant-integration ENABLED
 */

import { z } from 'zod';
import { AgentGovernanceSchema } from './agent-governance.schema';

// ============================================================================
// IDENTITY CONTRACT
// Describes what a specialist is and what corpus it knows.
// ============================================================================

export const SpecialistIdentitySchema = z.object({
  /** Unique specialist identifier — e.g. "ue5-specialist", "f1-engineering" */
  id: z.string(),

  /** Human-readable domain name */
  domain: z.string(),

  /** Semantic version of this specialist build */
  version: z.string(),

  /** Number of indexed chunks in the corpus */
  corpusSize: z.number().nonnegative(),

  /** ISO timestamp of last corpus index */
  lastIndexed: z.string().datetime(),

  /** Local HTTP endpoint this specialist serves on */
  endpoint: z.string().url(),

  /** Whether the circadian self-improvement loop is active */
  circadianEnabled: z.boolean().default(true),

  /** EMA weight file path — circadian loop reads/writes here */
  weightsPath: z.string().optional(),
});

export type SpecialistIdentity = z.infer<typeof SpecialistIdentitySchema>;

// ============================================================================
// GOVERNANCE CONTRACT
// Extends AgentGovernanceSchema (the blueprint) with corpus-specific fields.
// This is the contract you pass to new SpecialistAgent(governance) at
// construction time. Blueprint compliance is enforced by the schema parser.
// ============================================================================

export const SpecialistGovernanceSchema = AgentGovernanceSchema.extend({
  /** Corpus metadata — what the specialist knows and how fresh it is */
  corpus: z.object({
    /** Number of indexed chunks */
    size: z.number().nonnegative(),

    /** ISO timestamp of last index build */
    lastIndexed: z.string().datetime(),

    /** Source URLs / file paths that were scraped to build the corpus */
    sources: z.array(z.string()).min(1),

    /** Path to circadian EMA weights file — written nightly, read at query time */
    weightsPath: z.string().optional(),
  }),

  /** Local HTTP endpoint this specialist serves on */
  endpoint: z.string().url(),

  /** Whether the circadian self-improvement loop is active for this instance */
  circadianEnabled: z.boolean().default(true),
});

export type SpecialistGovernance = z.infer<typeof SpecialistGovernanceSchema>;

// ============================================================================
// INPUT CONTRACT
// What any caller (CC, Inngest, Oracle Claw) sends to a specialist.
// ============================================================================

export const SpecialistQuerySchema = z.object({
  /** Natural language question — what the caller needs to know */
  question: z.string().min(1, 'Question cannot be empty'),

  /** Optional caller context — what task this knowledge feeds into */
  context: z.string().optional(),

  /** How many corpus chunks to retrieve and synthesize from */
  topK: z.number().int().min(1).max(20).default(5),

  /** Which agent is calling — for audit trail */
  caller: z.enum(['cc', 'inngest', 'oracle-claw', 'mirofish', 'system']).default('cc'),

  /** SAFE = read-only query. ARMED = query whose answer drives an execution with side effects */
  gate: z.enum(['SAFE', 'ARMED']),

  /** Gate expiry (ISO 8601) — ARMED gates must not be expired */
  expiry: z.string().datetime(),

  /** Accountable owner — required for ARMED gate */
  owner: z.string().optional(),
});

export type SpecialistQuery = z.infer<typeof SpecialistQuerySchema>;

// ============================================================================
// OUTPUT CONTRACT
// What a specialist always returns — regardless of domain.
// ============================================================================

export const SpecialistChunkSchema = z.object({
  /** Source document or URL the chunk came from */
  source: z.string(),

  /** The relevant excerpt from the corpus */
  excerpt: z.string(),

  /** Circadian weight — amplified chunks surfaced by past successful executions */
  weight: z.number().min(0.3).max(2.5).default(1.0),
});

export const SpecialistResponseSchema = z.object({
  /** Unique query ID — used by the feedback loop to tie outcome back to this query */
  queryId: z.string().uuid(),

  /** Domain of the specialist that answered */
  domain: z.string(),

  /** Synthesized answer — the specialist's expert response */
  answer: z.string().min(1),

  /** Confidence 0-100 — weighted average of retrieved chunk confidence */
  confidence: z.number().min(0).max(100),

  /** Source chunks used to synthesize the answer */
  chunks: z.array(SpecialistChunkSchema),

  /** Whether any ARMED gate was active for this query */
  gate_used: z.enum(['SAFE', 'ARMED']),

  /** Execution observability */
  execution_metadata: z.object({
    started_at: z.string().datetime(),
    completed_at: z.string().datetime(),
    duration_ms: z.number().nonnegative(),
    chunks_retrieved: z.number().nonnegative(),
    corpus_size_at_query: z.number().nonnegative(),
    circadian_weights_applied: z.boolean(),
  }),

  /** Explanatory obligation — why this answer, which chunks drove it */
  reasoning: z.string().min(50, 'Reasoning must be substantive'),
});

export type SpecialistResponse = z.infer<typeof SpecialistResponseSchema>;
export type SpecialistChunk = z.infer<typeof SpecialistChunkSchema>;

// ============================================================================
// FEEDBACK CONTRACT
// How callers close the loop — outcome signals the circadian prune.
// success → EMA delta 1.5 (amplify)
// failure → EMA delta 0.5 (suppress)
// partial → EMA delta 1.0 (neutral — no change)
// ============================================================================

export const SpecialistFeedbackSchema = z.object({
  /** Matches SpecialistResponse.queryId */
  queryId: z.string().uuid(),

  /** What happened when the specialist's answer was acted on */
  outcome: z.enum(['success', 'failure', 'partial']),

  /** Optional notes — what worked, what didn't, specific chunk quality */
  notes: z.string().optional(),

  /** Which caller is reporting — for audit trail */
  caller: z.enum(['cc', 'inngest', 'oracle-claw', 'mirofish', 'system']).default('cc'),

  /** ISO timestamp of when the outcome was observed */
  observedAt: z.string().datetime(),
});

export type SpecialistFeedback = z.infer<typeof SpecialistFeedbackSchema>;

// ============================================================================
// REINDEX CONTRACT
// Triggers a full corpus rebuild. ARMED gate required — this is heavy.
// ============================================================================

export const SpecialistReindexSchema = z.object({
  /** Which specialist to reindex */
  specialistId: z.string(),

  /** Source paths or URLs to re-scrape */
  sources: z.array(z.string()).min(1),

  /** Wipe existing weights and start fresh — use with caution */
  resetWeights: z.boolean().default(false),

  /** ARMED gate required — reindex has side effects on the live corpus */
  gate: z.literal('ARMED'),

  /** Gate expiry */
  expiry: z.string().datetime(),

  /** Accountable owner */
  owner: z.string().min(1, 'Owner required for reindex'),
});

export type SpecialistReindex = z.infer<typeof SpecialistReindexSchema>;

// ============================================================================
// GATE VALIDATION
// ============================================================================

export function validateSpecialistGate(
  query: SpecialistQuery
): { valid: boolean; reason?: string } {
  if (query.gate === 'ARMED') {
    const expiry = new Date(query.expiry);
    if (expiry <= new Date()) {
      return {
        valid: false,
        reason: `ARMED gate expired at ${query.expiry}.`,
      };
    }
    if (!query.owner || query.owner.trim() === '') {
      return {
        valid: false,
        reason: 'ARMED gate requires explicit owner for accountability.',
      };
    }
  }
  return { valid: true };
}

export function validateReindexGate(
  req: SpecialistReindex
): { valid: boolean; reason?: string } {
  const expiry = new Date(req.expiry);
  if (expiry <= new Date()) {
    return {
      valid: false,
      reason: `ARMED gate for reindex expired at ${req.expiry}.`,
    };
  }
  if (!req.owner || req.owner.trim() === '') {
    return {
      valid: false,
      reason: 'Reindex requires explicit owner.',
    };
  }
  return { valid: true };
}

// ============================================================================
// AFFORDANCE METADATA
// Declares what each specialist endpoint does and what gate it requires.
// Any caller can inspect this before deciding whether to proceed.
// ============================================================================

export const SPECIALIST_AFFORDANCES = {
  query: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    description: 'Ask the specialist a question. Retrieves and synthesizes corpus chunks.',
    circadian_impact: 'none — read only. Feedback endpoint closes the loop.',
  },
  feedback: {
    gate: 'SAFE',
    reversible: true,
    side_effects: true,
    description: 'Report outcome of a query. Updates EMA weights in the circadian loop.',
    circadian_impact: 'writes chunk weights. success=amplify, failure=suppress.',
  },
  identity: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    description: 'Get specialist identity — domain, version, corpus size, weights status.',
    circadian_impact: 'none',
  },
  reindex: {
    gate: 'ARMED',
    reversible: false,
    side_effects: true,
    description: 'Rebuild the specialist corpus from source. Heavy operation.',
    circadian_impact: 'optionally resets weights. rebuilds all chunk embeddings.',
  },
} as const;

export type SpecialistAffordance = keyof typeof SPECIALIST_AFFORDANCES;

// ============================================================================
// INSTANCE REGISTRY
// Known specialist instances. Add a new specialist by adding an entry here.
// The contract doesn't change — only the configuration does.
// ============================================================================

export const SPECIALIST_REGISTRY: Record<string, Pick<SpecialistIdentity, 'id' | 'domain' | 'endpoint'>> = {
  'ue5-specialist': {
    id: 'ue5-specialist',
    domain: 'Unreal Engine 5 — editor automation, Blueprints, Python API, rendering pipeline',
    endpoint: 'http://localhost:7100',
  },
  'f1-engineering': {
    id: 'f1-engineering',
    domain: 'Formula 1 — telemetry, tyre strategy, aero setup, race engineering',
    endpoint: 'http://localhost:7101',
  },
  'defi-evm': {
    id: 'defi-evm',
    domain: 'DeFi / EVM — Solidity, flash loans, AMM mechanics, protocol specs',
    endpoint: 'http://localhost:7102',
  },
} as const;
