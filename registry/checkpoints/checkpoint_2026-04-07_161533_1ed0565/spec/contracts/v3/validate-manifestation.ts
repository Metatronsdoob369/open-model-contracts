/**
 * OMC v3 — Validate-Manifestation Contract ("Law")
 *
 * Schema for validating a manifestation event (Phase 3 of the 3-phase model).
 * Must NOT import from src/**; this is pure "Law", no runtime.
 */
import { z } from "zod";

export const ManifestationResultSchema = z.enum([
  "approved",
  "rejected",
  "pending",
  "conflict",
]);

export const ValidateManifestationSchema = z.object({
  manifestationId: z
    .string()
    .uuid()
    .describe("Unique ID of the manifestation event"),
  agentId: z
    .string()
    .uuid()
    .describe("Agent that triggered the manifestation"),
  contractId: z
    .string()
    .describe("Contract ID this manifestation fulfils"),
  contractVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe("Semver of the contract being fulfilled"),
  payload: z
    .record(z.unknown())
    .describe("Raw payload submitted for manifestation"),
  checkpointRef: z
    .string()
    .optional()
    .describe("Registry checkpoint ID attached to this manifestation"),
  result: ManifestationResultSchema.describe("Validation outcome"),
  errors: z
    .array(z.string())
    .default([])
    .describe("Validation errors (empty when approved)"),
  timestamp: z.string().datetime().describe("ISO-8601 event timestamp"),
});

export type ValidateManifestation = z.infer<typeof ValidateManifestationSchema>;
