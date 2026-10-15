import { z } from 'zod';

/**
 * 🛰️ ROBLOX TRAINING PROTOCOL (OMC-ALIGNED)
 * Governs the 'Vampire' ingestion pipeline for Luau logic.
 * Defines Shatter Audits, Repair Cycles, and Training Pipelines.
 * SAFE: Shards with <0.2 shatter post-cycle.
 * ARMED: Shards with >0.5 shatter or missing provenance.
 */

// OMC Provenance Base (All Schemas Extend)
export const OMCProvenanceSchema = z.object({
  intentSignature: z.string(), // BLAKE2b hash of agent intent
  gate: z.enum(['SAFE', 'ARMED']),
  disclaimer: z.literal('Fictional sim artifact—OMC governed, no real-world application'),
  humanReviewRequired: z.boolean().default(false),
});

// Spatial Map Schema
export const SpatialMapSchema = OMCProvenanceSchema.extend({
  domain: z.literal('spatial'),
  layoutVectors: z.array(z.number().min(-1).max(1)).length(3072), // L2-norm unit sphere, REFRAG compressed
  shatterVariance: z.number().min(0).max(1), // Normalized variance (Sentry check: >0.5 = ARMED)
  hotspots: z.array(z.object({
    pos: z.tuple([z.number(), z.number()]), // x,y in game space
    lagMs: z.number().min(0),
    provenance: z.string(), // Source game ID
  })).max(100),
});

// Structural Map Schema
export const StructuralMapSchema = OMCProvenanceSchema.extend({
  domain: z.literal('structural'),
  graphNodes: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['core', 'ui', 'asset', 'logic']),
    integralScore: z.number().min(0).max(10), // Resonance priority
  })),
  dependencies: z.array(z.tuple([z.string().uuid(), z.string().uuid()])), // Directed edges
  glitches: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['1-shot', 'flow-break', 'dependency-cycle']),
    severity: z.number().min(0).max(10),
    repairGuidance: z.string(), // Map-derived rationale
  })).max(50),
});

// Research Map Schema
export const ResearchMapSchema = OMCProvenanceSchema.extend({
  domain: z.literal('research'),
  embeddedDocs: z.array(z.number().min(-1).max(1)).length(3072), // Feedback/patterns, L2-norm
  resonanceScores: z.record(z.string(), z.number().min(0).max(1)), // Viral mechanics freq
  patterns: z.array(z.string()).max(20),
  sourceProvenance: z.array(z.string().url()), // Forum/IGN links
});

// Shatter Report Schema (The 3-Layer Manifest)
export const ShatterReportSchema = OMCProvenanceSchema.extend({
  domain: z.literal('shatter-report'),
  spatial: SpatialMapSchema,
  structural: StructuralMapSchema,
  research: ResearchMapSchema,
  overallShatter: z.number().min(0).max(1),
  diamondStable: z.boolean().default(true), // Sentry validation
});

// Repair Cycle Schema
export const RepairCycleSchema = OMCProvenanceSchema.extend({
  domain: z.literal('repair-cycle'),
  stage: z.enum(['core', 'ui', 'assets', 'logic', 'iteration']),
  inputPrototype: z.object({
    url: z.string().url(), 
    version: z.string(), 
    initialShatter: z.number().min(0).max(1),
  }),
  guidanceMap: ShatterReportSchema,
  edits: z.array(z.object({
    file: z.string(), 
    diff: z.string(), 
    rationale: z.string(), 
    intentSig: z.string(), 
  })).min(1).max(20),
  evalMetrics: z.object({
    resonance: z.number().min(0).max(1),
    shatterReduction: z.number().min(0).max(1), 
    playability: z.number().min(0).max(100), 
    concurrentPlayers: z.number().optional(), 
  }),
  output: z.object({
    url: z.string().url(), 
    version: z.string(),
    finalShatter: z.number().min(0).max(1),
  }),
  cycleCount: z.number().min(1).max(3),
  humanReviewRequired: z.boolean(),
});

// Full Pipeline Schema
export const TrainingPipelineSchema = OMCProvenanceSchema.extend({
  domain: z.literal('training-pipeline'),
  sourceGame: z.object({
    name: z.string(),
    popularity: z.number().min(0.01).max(1),
    daysSustained: z.number().min(1),
    url: z.string().url(),
    provenance: z.string(),
  }),
  maps: ShatterReportSchema,
  cycles: z.array(RepairCycleSchema).min(1).max(4),
  finalEval: z.object({
    playability: z.number().gt(90),
    latencyMs: z.number().lt(500),
    shatterReductionTotal: z.number().gt(0.7),
    disclaimer: z.literal('Fictional sim artifact—OMC SAFE/ARMED enforced'),
  }),
  diamondStable: z.boolean(),
});
