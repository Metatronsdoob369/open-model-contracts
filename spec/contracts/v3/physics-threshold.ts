/**
 * OMC v3 — Physics Threshold Contract
 *
 * Defines the canonical autonomic limits for the Domicile Governance Engine (The Vagus Nerve).
 * Moves hard-coded execution limits (`maxVelocity`, `minSignificance`) out of the garage
 * and into the Sovereign OMC Registry.
 */
import { z } from "zod";

export const PhysicsThresholdSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier for this physics profile (e.g., 'omc.physics.standard')"),
  maxVelocity: z
    .number()
    .min(0)
    .max(1)
    .default(0.20)
    .describe("Maximum allowed percentage change in a single mutation (Velocity)"),
  minSignificance: z
    .number()
    .min(0)
    .max(1)
    .default(0.05)
    .describe("P-value stability boundary required for overriding radical systemic changes"),
  resonanceThreshold: z
    .number()
    .min(0)
    .default(0.35)
    .describe("Maximum allowed semantic heat (resonance) before triggering a topological audit (3072-D)"),
  driftThreshold: z
    .number()
    .int()
    .min(1)
    .default(5)
    .describe("Number of consecutive directional mutations required to trigger an overfitting/looping warning")
});

export type PhysicsThreshold = z.infer<typeof PhysicsThresholdSchema>;
