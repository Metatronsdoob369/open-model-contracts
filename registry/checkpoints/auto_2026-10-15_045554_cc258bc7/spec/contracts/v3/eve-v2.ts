/**
 * OMC v3 — Eve_v2 Cognitive Admission Contract
 * 
 * Standardizes the SpectralGAT/TriadGAT interface for governed simulation.
 * Enforces Roblox Luau safety rules and Circadian pruning thresholds.
 */

import { z } from "zod";

export const EveV2Schema = z.object({
  id: z.string().describe("Stable identifier for the Eve_v2 brain instance."),
  version: z.string().default("2.1.0"),
  
  spectralConfig: z.object({
    tau: z.number().min(0.5).max(1.0).default(0.85).describe("Graph attention dropout threshold."),
    heat_tau: z.number().min(0.01).max(0.2).default(0.1).describe("Heat kernel spectral filtering constant."),
    low_k: z.number().int().min(5).max(32).default(12).describe("Number of low-frequency eigenvalues for spectral injection."),
    hessian_trace_limit: z.number().max(5.0).default(3.0).describe("Maximum allowed gradient entropy before SAFE gate halt."),
  }),

  robloxAdmission: z.object({
    environment: z.literal("ROBLOX_LUAU"),
    disallowGlobals: z.array(z.string()).default(["_G", "shared", "getfenv", "setfenv"]),
    enforceMemorySafety: z.boolean().default(true),
    maxCFrameIterations: z.number().int().default(1000).describe("Prevention of infinite orientation loops."),
    spatialAnchors: z.array(z.string()).default(["ROOM-01", "ROOM-02"]),
  }),

  circadianPruning: z.object({
    enabled: z.boolean().default(true),
    pruningThreshold: z.number().min(0.1).max(0.5).default(0.3).describe("Global baseline for pruning."),
    sectorWeights: z.record(z.number()).default({
      "OMC_Threading": 0.95,
      "OMC_DataStore_Queue": 0.90,
      "OMC_Governance": 0.98,
      "Client_Visual": 0.40,
      "Mock_TestLayer": 0.70
    }).describe("Domain-specific weights for outcome evaluation (flaw significance)."),
    dreamCycleInterval: z.string().default("3 AM"),
    successMetric: z.enum(["profit_margin", "user_satisfaction", "deployment_stability", "performance_overhead"]),
  }),

  auditTrail: z.object({
    intentSignature: z.array(z.number()).length(3072).describe("Mathematical 3072-D unit vector for cognitive verification."),
    normStability: z.number().default(1.0).describe("L2-normalization check (Survival Requirement)."),
    provenanceHash: z.string().describe("Original Domicile Archive reference."),
  }),
}).refine(
  (data) => {
    let sumSq = 0;
    for (let i = 0; i < data.auditTrail.intentSignature.length; i++) {
      sumSq += data.auditTrail.intentSignature[i] * data.auditTrail.intentSignature[i];
    }
    const norm = Math.sqrt(sumSq);
    // Enforce unit hypersphere norm (|norm - 1.0| <= 0.05)
    return Math.abs(norm - 1.0) <= 0.05;
  },
  {
    message: "auditTrail.intentSignature must be strictly L2-normalized on the 3072-D unit hypersphere (|norm - 1.0| <= 0.05)",
    path: ["auditTrail", "normStability"],
  }
);

export type EveV2 = z.infer<typeof EveV2Schema>;

// ── Authoritative Eve_v2 Vector Math & Spectral Operations ─────────────────

export function dot(a: number[] | Float32Array, b: number[] | Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function l2Norm(a: number[] | Float32Array): number {
  return Math.sqrt(dot(a, a));
}

export function cosineSimilarity(a: number[] | Float32Array, b: number[] | Float32Array): number {
  const na = l2Norm(a);
  const nb = l2Norm(b);
  return na > 0 && nb > 0 ? dot(a, b) / (na * nb) : 0;
}

export function vecSub(a: number[] | Float32Array, b: number[] | Float32Array): number[] {
  const res = new Array(a.length);
  for (let i = 0; i < a.length; i++) res[i] = a[i] - b[i];
  return res;
}

export function vecScale(a: number[] | Float32Array, s: number): number[] {
  const res = new Array(a.length);
  for (let i = 0; i < a.length; i++) res[i] = a[i] * s;
  return res;
}

export function normalizeVector(a: number[] | Float32Array): number[] {
  const n = l2Norm(a);
  const res = new Array(a.length);
  if (n > 0) {
    for (let i = 0; i < a.length; i++) res[i] = a[i] / n;
  } else {
    for (let i = 0; i < a.length; i++) res[i] = a[i];
  }
  return res;
}

export function calculateManhattanHeat(
  vec: number[] | Float32Array,
  centroid: number[] | Float32Array
): number {
  let manhattan = 0;
  const dims = vec.length;
  for (let d = 0; d < dims; d++) manhattan += Math.abs(vec[d] - centroid[d]);
  return manhattan / dims;
}

export function calculateEuclideanShatter(
  vec: number[] | Float32Array,
  centroid: number[] | Float32Array
): number {
  let distSq = 0;
  for (let i = 0; i < vec.length; i++) distSq += (vec[i] - centroid[i]) ** 2;
  return Math.sqrt(distSq);
}

export function calculateSectorScores(
  vec: number[] | Float32Array,
  centroid: number[] | Float32Array,
  sectorWeights: Record<string, number> = {
    OMC_Threading: 0.95,
    OMC_DataStore_Queue: 0.90,
    OMC_Governance: 0.98,
    Client_Visual: 0.40,
    Mock_TestLayer: 0.70,
  }
): Record<string, number> {
  const sectors = Object.keys(sectorWeights);
  const dims = vec.length;
  const dimsPerSector = Math.floor(dims / sectors.length);
  const scores: Record<string, number> = {};

  for (let s = 0; s < sectors.length; s++) {
    const start = s * dimsPerSector;
    const end = s === sectors.length - 1 ? dims : (s + 1) * dimsPerSector;
    let distSq = 0;
    for (let i = start; i < end; i++) distSq += (vec[i] - centroid[i]) ** 2;
    const dist = Math.sqrt(distSq);
    scores[sectors[s]] = Math.max(0, 1 - dist) * sectorWeights[sectors[s]];
  }
  return scores;
}

