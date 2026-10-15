/**
 * MiroFish Domain Contract — Numerical Auditor
 *
 * MiroFish is NOT a visualizer. It is a Zod-validated numerical auditor
 * that ingests swarm simulation state and outputs raw truth for the engine.
 *
 * When MiroFish detects structural drift in the DARK zone (repulsive regions
 * of the 3072-D manifold), it triggers a Repair Cycle — emitting a
 * DriftReport to the Bridge (:8080) which HAL converts into a Shatter
 * Certificate and dark node registration.
 *
 * The swarm then navigates around the updated manifold without needing
 * to re-simulate or re-embed the drifted region.
 *
 * Caller: approved in specialist.contract.ts as 'mirofish'
 * Transport: POST http://localhost:8080/v1/mirofish/drift
 * Gate: ARMED (drift events have side effects — they register dark nodes)
 *
 * @module contracts/mirofish
 * @admission-status APPROVED
 * @covenant-integration ENABLED
 */

import { z } from 'zod';

// ============================================================================
// DRIFT SEVERITY
// How far the swarm spatial context has shifted from the last anchor.
// Mirrors the Z-anchor drift thresholds in SovereignArbEngineV3.
// ============================================================================

export const DriftSeveritySchema = z.enum([
  'NOMINAL',    // zAnchorDrift < 0.05  — no action required
  'DRIFTING',   // zAnchorDrift 0.05–0.15 — monitor, warp applied
  'SHATTERED',  // zAnchorDrift > 0.15  — DARK zone, repair cycle triggered
]);

export type DriftSeverity = z.infer<typeof DriftSeveritySchema>;

// ============================================================================
// DRIFT REPORT — what MiroFish emits when it detects spatial drift
//
// This is the primary OMC event. The Bridge converts it into a
// ShatterCertificate and registers a DarkNode via HAL.
// ============================================================================

export const MiroFishDriftReportSchema = z.object({
  /** Unique event ID — deterministic from swarm state hash + timestamp */
  eventId: z.string(),

  /** ISO timestamp of detection */
  detectedAt: z.string().datetime(),

  /** Which swarm simulation produced this drift */
  simulationId: z.string(),

  /** Zone label in MiroFish spatial coordinate space — e.g. "DARK", "VOLATILE", "STABLE" */
  zone: z.string(),

  /** Cosine distance from last registered Z-anchor — mirrors SovereignArbEngineV3 metric */
  zAnchorDrift: z.number().min(0).max(2),

  /** Cosine distance T vs T-1 — how fast the zone is moving */
  tVelocity: z.number().min(0).max(2),

  /** Peak signature heat detected in this zone [0..1] */
  signatureHeat: z.number().min(0).max(1),

  /** Severity classification */
  severity: DriftSeveritySchema,

  /**
   * 3072-D temporal vector at drift detection time.
   * This IS the dark node position if severity = SHATTERED.
   * Layout: T[0..1023] || T-1[1024..2047] || T-start[2048..3071]
   */
  vec3072: z.array(z.number()).length(3072),

  /**
   * Signatures detected in the drifted zone.
   * Mapped to SignatureWeight classes by HAL's extractClasses().
   */
  signatures: z.array(z.string()).default([]),

  /** Human-readable reason — becomes ShatterCertificate.abortReason */
  reason: z.string(),

  /**
   * OMC gate — ARMED because drift registration has side effects:
   * it writes to dark-nodes.json and warps the manifold.
   */
  gate: z.literal('ARMED'),

  /** Gate expiry — must not be expired when received by Bridge */
  expiry: z.string().datetime(),

  /** Accountable caller */
  owner: z.literal('mirofish'),
});

export type MiroFishDriftReport = z.infer<typeof MiroFishDriftReportSchema>;

// ============================================================================
// REPAIR CYCLE RESPONSE — what the Bridge returns to MiroFish
//
// MiroFish uses this to update the swarm's spatial exclusion map.
// The swarm navigates around darkZoneCoordinates on next tick.
// ============================================================================

export const MiroFishRepairResponseSchema = z.object({
  /** Echoes the incoming eventId */
  eventId: z.string(),

  /** Whether a ShatterCertificate was issued */
  certificateIssued: z.boolean(),

  /** Certificate ID if issued — null if severity was NOMINAL/DRIFTING */
  certificateId: z.string().nullable(),

  /** Warped resonance result for this zone */
  warpedResonance: z.number().min(0).max(1),

  /** Whether the zone should be excluded from swarm pathfinding */
  skipZone: z.boolean(),

  /**
   * Updated dark zone coordinates for swarm navigation.
   * These are the 3D projections (not full 3072-D) — safe to send over the wire.
   * Swarm uses these as repulsive waypoints in coordinate space.
   * Format: [T[0]*20, T-1[1024]*20, T-start[2048]*20]
   */
  darkZoneCoordinates: z.tuple([z.number(), z.number(), z.number()]).nullable(),

  /** HAL stats snapshot — dark node count and certificate count */
  halStats: z.object({
    darkNodeCount: z.number(),
    certificateCount: z.number(),
  }),

  /** ISO timestamp of repair cycle completion */
  repairedAt: z.string().datetime(),
});

export type MiroFishRepairResponse = z.infer<typeof MiroFishRepairResponseSchema>;

// ============================================================================
// PREDICTION COMMITMENT — OMC-compliant Shatter Certificate wrapper
//
// SovereignArbEngineV3 can ingest this directly as a Prediction Commitment.
// The predictionHash is the on-chain verifiable commitment.
// ============================================================================

export const ShatterCertificateCommitmentSchema = z.object({
  /** SHA-256 commitment — verifiable on-chain */
  predictionHash: z.string().regex(/^0x[a-f0-9]{64}$/),

  /** Source event that triggered this commitment */
  sourceEventId: z.string(),

  /** Zone that shattered */
  zone: z.string(),

  /** Simulation that detected the shatter */
  simulationId: z.string(),

  /** ISO timestamp of commitment */
  committedAt: z.string().datetime(),

  /**
   * 32-value fingerprint of each temporal slice.
   * On-chain verifier checks these 96 values (3 slices × 32 values).
   * Full 3072-D vector not stored on-chain — too large.
   */
  fingerprint: z.object({
    t:      z.array(z.number()).length(32),   // T[0..31]
    tMinus1: z.array(z.number()).length(32),  // T-1[1024..1055]
    tStart:  z.array(z.number()).length(32),  // T-start[2048..2079]
  }),

  /** OMC gate — ARMED, this is a live commitment */
  gate: z.literal('ARMED'),
});

export type ShatterCertificateCommitment = z.infer<typeof ShatterCertificateCommitmentSchema>;

// ============================================================================
// GATE VALIDATION — same pattern as specialist.contract.ts
// ============================================================================

export function validateMiroFishGate(
  report: MiroFishDriftReport
): { valid: boolean; reason?: string } {
  const expiry = new Date(report.expiry);
  if (expiry <= new Date()) {
    return {
      valid: false,
      reason: `ARMED gate expired at ${report.expiry}. MiroFish must re-issue the report.`,
    };
  }
  return { valid: true };
}

// ============================================================================
// HELPERS — build a DriftReport from MiroFish swarm telemetry
// ============================================================================

export function buildDriftReport(params: {
  simulationId: string;
  zone: string;
  zAnchorDrift: number;
  tVelocity: number;
  signatureHeat: number;
  vec3072: number[];
  signatures?: string[];
  reason: string;
  ttlSeconds?: number;
}): MiroFishDriftReport {
  const now = new Date();
  const expiry = new Date(now.getTime() + (params.ttlSeconds ?? 30) * 1000);

  let severity: DriftSeverity;
  if (params.zAnchorDrift > 0.15 || params.signatureHeat > 0.90) {
    severity = 'SHATTERED';
  } else if (params.zAnchorDrift > 0.05 || params.tVelocity > 0.08) {
    severity = 'DRIFTING';
  } else {
    severity = 'NOMINAL';
  }

  return MiroFishDriftReportSchema.parse({
    eventId:       `DRIFT_${params.simulationId}_${now.getTime()}`,
    detectedAt:    now.toISOString(),
    simulationId:  params.simulationId,
    zone:          params.zone,
    zAnchorDrift:  params.zAnchorDrift,
    tVelocity:     params.tVelocity,
    signatureHeat: params.signatureHeat,
    severity,
    vec3072:       params.vec3072,
    signatures:    params.signatures ?? [],
    reason:        params.reason,
    gate:          'ARMED',
    expiry:        expiry.toISOString(),
    owner:         'mirofish',
  });
}

// ============================================================================
// SPATIAL EXCLUSION MAP — what the swarm actually reads
//
// After each repair cycle, the Bridge writes an updated exclusion map.
// MiroFish reads this on each simulation tick to avoid dark zones.
// ============================================================================

export const SpatialExclusionMapSchema = z.object({
  /** ISO timestamp of last update */
  updatedAt: z.string().datetime(),

  /**
   * Active dark zones — sorted by heat descending.
   * Swarm treats these as hard repulsors in coordinate space.
   */
  darkZones: z.array(z.object({
    id:           z.string(),
    zone:         z.string(),
    coordinates:  z.tuple([z.number(), z.number(), z.number()]),
    heat:         z.number(),
    heatMultiplier: z.number(),
    confirmations: z.number(),
    signatureClass: z.string(),
  })),

  /** Total repulsion budget — sum of all dark zone heats */
  totalRepulsion: z.number(),

  /** Whether simulation should be paused until a SHATTERED zone cools */
  pauseRecommended: z.boolean(),
});

export type SpatialExclusionMap = z.infer<typeof SpatialExclusionMapSchema>;
