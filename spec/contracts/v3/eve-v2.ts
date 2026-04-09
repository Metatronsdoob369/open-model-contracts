/**
 * OMC v3 — Eve_v2 Cognitive Admission Contract
 * 
 * Standardizes the SpectralGAT/TriadGAT interface for governed simulation.
 * Enforces Roblox Luau safety rules and Circadian pruning thresholds.
 */

import { z } from "zod";

export const EveV2Schema = z.object({
  id: z.string().describe("Stable identifier for the Eve_v2 brain instance."),
  version: z.string().default("2.0.0"),
  
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
    intentSignature: z.string().describe("The cryptographically signed intent of the generation run."),
    provenanceHash: z.string().describe("Original Domicile Archive reference."),
  }),
});

export type EveV2 = z.infer<typeof EveV2Schema>;
