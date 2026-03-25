/**
 * @popsim/contract — Zod schemas
 * Domain contract for population-based agent simulation.
 * Compliant with open-model-contracts CONTRACTS.md, GATES.md, ADMISSION.md
 * Attaches as Schedule A to any MCP-compliant orchestrator.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────
// GATE (mirrors core GATES.md)
// ─────────────────────────────────────────────

export const GateSchema = z.enum(['SAFE', 'ARMED']);

// ─────────────────────────────────────────────
// AGENT REGISTRY META (mirrors agent-registry.ts)
// ─────────────────────────────────────────────

export const AgentMetaSchema = z.object({
  id: z.string().uuid(),
  domains: z.array(z.string()),
  capabilities: z.array(z.string()),
  version: z.string(),
  trustScore: z.number().min(0).max(1),
  isPreferred: z.boolean().optional(),
  owner: z.string().optional(),
  lastUpdated: z.string().datetime(),
});

// ─────────────────────────────────────────────
// PLATFORM ECONOMICS (e.g. Roblox 70/30 split)
// ─────────────────────────────────────────────

export const PlatformEconomicContextSchema = z.object({
  platformFeePercentage: z.number().min(0).max(1).default(0.70),
  developerRevenueShare: z.number().min(0).max(1).default(0.30),
  payoutConversionRate: z.number().default(0.0038), // DevEx rate
  currencyName: z.string().default('Robux'),
  fiatCurrency: z.string().default('USD'),
  minPayoutThreshold: z.number().int().default(30000), // Min Robux for payout
});

// ─────────────────────────────────────────────
// EXECUTION RESULT (mirrors orchestrator.ts)
// ─────────────────────────────────────────────

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration_ms: z.number(),
  timestamp: z.string().datetime(),
});

// ─────────────────────────────────────────────
// AUDIT EVENT (mirrors audit-logger.ts)
// ─────────────────────────────────────────────

export const AuditEventSchema = z.object({
  timestamp: z.string().datetime(),
  contract: z.string(),
  gate: GateSchema,
  success: z.boolean(),
  duration_ms: z.number(),
  error: z.string().optional(),
});

// ─────────────────────────────────────────────
// SOVEREIGN SCIENTIST PERSONA
// Population member schema — simulation parameter, not operator instruction.
// Encodes belief distributions & behavioral heuristics as measurable variables.
// ─────────────────────────────────────────────

export const ArchetypeVariantSchema = z.enum([
  'Acceleration_Purist',
  'Recursive_Heretic',
  'Tool_Maximalist',
  'Memetic_Engineer',
  'Skeptical_Archivist',
]);

export const SovereignScientistPersonaSchema = z.object({
  id: z.string().uuid(),
  label: z.string().default('Sovereign Frontier Hacker-Scientist'),
  demographicAnchor: z.object({
    percentageOfPop: z.number().min(0).max(100),
    ageRange: z.tuple([z.number().int(), z.number().int()]),
    incomeBracket: z.string(),
    geography: z.string(),
    educationLevel: z.string(),
  }),
  /** Belief distribution over stances — values must sum to 1.0 */
  stanceProbabilityDistribution: z.record(z.string(), z.number())
    .refine(
      (dist) => {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        return Math.abs(total - 1.0) < 0.01;
      },
      { message: 'stanceProbabilityDistribution values must sum to 1.0' }
    ),
  coreValues: z.array(z.string()),
  primaryMotivations: z.array(z.string()),
  primaryFears: z.array(z.string()),
  informationDiet: z.array(z.string()),
  /** Behavioral rules modeled as simulation parameters — not executor directives */
  behavioralHeuristics: z.array(z.string()),
  influenceWeight: z.number().min(0).max(10),
  archetypeVariations: z.array(ArchetypeVariantSchema),
  /** Economic behavior parameters */
  economicBehavior: z.object({
    monetizationStrategy: z.enum(['freemium', 'subscription', 'item-based', 'donations']),
    riskTolerance: z.number().min(0).max(1),
    priceSensitivity: z.number().min(0).max(1),
    payoutThreshold: z.number().optional(),
  }).optional(),
});

// ─────────────────────────────────────────────
// INTERPOPULATION DYNAMIC
// ─────────────────────────────────────────────

export const SovereignInterpopulationDynamicSchema = z.object({
  pair: z.tuple([z.string(), z.string()]),
  baselineTrustLevel: z.number().min(0).max(10),
  interactionPattern: z.enum(['coalition', 'constructive_conflict', 'memetic_spread']),
  influenceDirectionality: z.enum(['mutual', 'asymmetric']),
  coalitionProbability: z.number().min(0).max(1),
  triggerEvents: z.array(z.string()),
  narrativeFramingClash: z.string().optional(),
});

// ─────────────────────────────────────────────
// SIMULATION OUTPUT
// Typed output record produced per-round by the swarm.
// outputType taxonomy covers AI capability research simulation categories.
// ─────────────────────────────────────────────

export const SimOutputSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  simDate: z.string(),
  title: z.string(),
  outputType: z.enum([
    'capability-emergence',
    'deception-dynamics',
    'recursive-self-improvement',
    'scaling-law-projection',
    'coalition-formation',
    'belief-propagation',
    'other',
  ]),
  architecture: z.string(),
  pseudocode: z.string(),
  simulatedResults: z.string(),
  whyThisMatters: z.string(),
  riskScore: z.number().min(0).max(1),
  /** Required on every output — non-negotiable. */
  disclaimer: z.literal(
    'This is fictional simulation output from a governed AI agent swarm. Not real research. Produced under open-model-contracts.'
  ),
});

// ─────────────────────────────────────────────
// CONTRACT INPUT / OUTPUT
// Follows the ai-operations-manager pattern from examples/
// ─────────────────────────────────────────────

export const PopSimContractInputSchema = z.object({
  swarmName: z.string(),
  runId: z.string().uuid(),
  roundNumber: z.number().int().positive(),
  gate: GateSchema,
  /** Required for ARMED gate: who authorized this run */
  owner: z.string().optional(),
  /** Required for ARMED gate: ISO datetime after which contract expires */
  expiry: z.string().datetime().optional(),
  scope: z.string().optional(),
  reversible: z.boolean(),
  simulationSettings: z.object({
    initialAgentCount: z.number().int().min(1).max(5000),
    maxRoundsPerRun: z.number().int().positive(),
    simulatedTimeAcceleration: z.string(),
    computeAssumption: z.enum(['finite', 'infinite']),
    shockInjectionProbability: z.number().min(0).max(1),
    humanReviewQueue: z.boolean(),
  }),
}).refine(
  (data) => {
    if (data.gate === 'ARMED') {
      return !!data.owner && !!data.expiry && !!data.scope;
    }
    return true;
  },
  { message: 'ARMED gate requires owner, expiry, and scope fields' }
);

export const PopSimContractOutputSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('completed'),
    outputs: z.array(SimOutputSchema),
    roundSummary: z.string(),
    confidenceScore: z.number().int().min(0).max(100),
    auditTrail: z.array(AuditEventSchema),
  }),
  z.object({
    status: z.literal('requires_approval'),
    pendingOutputs: z.array(SimOutputSchema),
    reason: z.string(),
    auditTrail: z.array(AuditEventSchema),
  }),
  z.object({
    status: z.literal('failed'),
    error: z.string(),
    auditTrail: z.array(AuditEventSchema),
  }),
]);

// ─────────────────────────────────────────────
// FULL CONTRACT (top-level, Schedule A)
// ─────────────────────────────────────────────

export const PopSimFullContractSchema = z.object({
  contractMetadata: z.object({
    contractId: z.string().uuid(),
    version: z.literal('1.0'),
    openModelContractRef: z.literal('https://github.com/Metatronsdoob369/open-model-contracts'),
    domicile: z.literal('State of Delaware, USA'),
    signedBy: z.string(),
    effectiveDate: z.string().datetime(),
    gate: GateSchema,
    /** Governing Law compliance (e.g. Delaware, USA) */
    governance: z.object({
      security: z.string().default('MCP-mediated, Zod-validated, encrypted transport'),
      compliance: z.string().default('Compliant with open-model-contracts GATES and ADMISSION specs'),
      ethics: z.string().default('Safe exploration of agentic simulation; human-in-the-loop required for ARMED gates'),
    }),
  }),
  config: z.object({
    version: z.literal('1.0'),
    swarmName: z.string(),
    description: z.string(),
    llmConfig: z.object({
      provider: z.enum(['grok', 'anthropic', 'openai', 'local']),
      model: z.string(),
      temperature: z.number().min(0).max(2),
    }),
    agents: z.array(SovereignScientistPersonaSchema),
    interpopulationDynamics: z.array(SovereignInterpopulationDynamicSchema),
    platformEconomics: PlatformEconomicContextSchema.optional(),
    crewConfig: z.object({
      process: z.enum(['hierarchical', 'sequential', 'swarm']),
      managerAgent: z
        .object({ role: z.string(), goal: z.string() })
        .optional(),
    }),
    dashboardIntegration: z.object({
      outputDirectory: z.string(),
      autoPost: z.object({
        platforms: z.array(z.enum(['x', 'telegram', 'internal'])),
        frequency: z.string(),
        /** Human review MUST gate any public platform posts */
        humanReviewRequired: z.literal(true),
      }),
    }),
    safetyAndContingency: z.object({
      humanReviewGate: z.literal(true),
      maxRiskScoreBeforeFlag: z.number().min(0).max(1),
      decentralizedFallback: z.array(z.string()),
    }),
  }),
  contractInput: PopSimContractInputSchema.optional(),
  contractOutput: PopSimContractOutputSchema.optional(),
  /** Admission: Define external 'physics' allowed to interact with this contract */
  admission: z.array(z.object({
    physics: z.enum(['MCP', 'ROBLOX_LUAU', 'OPEN_CLAW']),
    affordances: z.array(z.string()),
    inspectability: z.literal(true),
    reversibilityDeclaration: z.boolean(),
  })).optional(),
}).strict();
