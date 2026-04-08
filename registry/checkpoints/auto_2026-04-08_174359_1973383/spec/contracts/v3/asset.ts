/**
 * OMC v3 — Asset Contract ("Law")
 *
 * Canonical schema for a spawnable / transferable digital asset.
 * Must NOT import from src/**; this is pure "Law", no runtime.
 */
import { z } from "zod";

export const AssetSchema = z.object({
  id: z.string().uuid().describe("Stable unique identifier for this asset"),
  name: z.string().min(1).max(120).describe("Human-readable asset name"),
  type: z
    .enum(["model", "texture", "audio", "script", "bundle"])
    .describe("Asset type category"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe("Semver of this asset revision"),
  ownerId: z.string().describe("Agent or user ID that owns the asset"),
  tags: z.array(z.string()).default([]).describe("Searchable metadata tags"),
  auditRequired: z
    .boolean()
    .default(false)
    .describe("Whether mutations require an audit checkpoint"),
  createdAt: z.string().datetime().describe("ISO-8601 creation timestamp"),
});

export type Asset = z.infer<typeof AssetSchema>;
