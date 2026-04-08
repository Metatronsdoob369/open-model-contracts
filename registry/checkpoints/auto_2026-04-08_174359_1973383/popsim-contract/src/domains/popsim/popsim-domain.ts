import { z } from 'zod';
import { GateSchema, AuditEventSchema, PlatformEconomicContextSchema } from '../../core/core-schemas';

/**
 * POPSIM DOMAIN — The "Sovereign Scientist" Simulation Module.
 * This is a plug-in module for the @popsim/contract SDK.
 */

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
  role: z.string().optional(),
  goal: z.string().optional(),
  backstory: z.string().optional(),
  persona: z.string().optional(),
  demographicAnchor: z.object({
    percentageOfPop: z.number().min(0).max(100),
    ageRange: z.tuple([z.number().int(), z.number().int()]),
    incomeBracket: z.string(),
    geography: z.string(),
    educationLevel: z.string(),
  }),
  stanceProbabilityDistribution: z.record(z.string(), z.number()),
  coreValues: z.array(z.string()),
  primaryMotivations: z.array(z.string()),
  primaryFears: z.array(z.string()),
  informationDiet: z.array(z.string()),
  behavioralHeuristics: z.array(z.string()),
  influenceWeight: z.number().min(0).max(10),
  archetypeVariations: z.array(ArchetypeVariantSchema),
});

export const SimOutputSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  simDate: z.string(),
  title: z.string(),
  outputType: z.string(),
  architecture: z.string(),
  pseudocode: z.string(),
  simulatedResults: z.string(),
  whyThisMatters: z.string(),
  riskScore: z.number().min(0).max(1),
  disclaimer: z.literal(
    'This is fictional simulation output from a governed AI agent swarm. Not real research. Produced under open-model-contracts.'
  ),
});

export const PopSimContractInputSchema = z.object({
  swarmName: z.string(),
  runId: z.string().uuid(),
  roundNumber: z.number().int().positive(),
  gate: GateSchema,
  owner: z.string().optional(),
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
});

export const PopSimContractOutputSchema = z.object({
  status: z.enum(['completed', 'requires_approval', 'failed']),
  outputs: z.array(SimOutputSchema).optional(),
  roundSummary: z.string().optional(),
  auditTrail: z.array(AuditEventSchema),
});
