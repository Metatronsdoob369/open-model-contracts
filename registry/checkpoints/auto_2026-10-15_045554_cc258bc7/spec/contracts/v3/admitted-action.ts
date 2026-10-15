/**
 * OMC v3 — Action Catalog Entry + Resource Reference (CG-011)
 *
 * Canonical vocabulary for catalog-declared actions and exact resources.
 * Pure Law: no runtime imports.
 *
 * Evidence boundary:
 * - This contract establishes shape and derived effect facts from effectClass.
 * - It does NOT prove catalog provenance, exact resourceId authorization, or
 *   runtime mediation. Those claims belong to catalog lookup + gate wiring.
 */
import { z } from "zod";

/** Declared mutation class on a catalog entry (shape only until catalog-resolved). */
export const EffectClassSchema = z.enum([
  "READ_ONLY",
  "STATE_CHANGE",
  "IRREVERSIBLE",
]);

export type EffectClass = z.infer<typeof EffectClassSchema>;

/**
 * Exact resource reference. CG-011 matching is exact equality only
 * (no glob, regex, wildcard, or hierarchical scope).
 * Enforced at runtime by the gate — this schema only defines the shape.
 */
export const ResourceRefSchema = z
  .object({
    resourceType: z.string().min(1).describe("Exact resource type identifier"),
    resourceId: z.string().min(1).describe("Exact resource instance identifier"),
  })
  .strict()
  .describe("Exact resource reference");

export type ResourceRef = z.infer<typeof ResourceRefSchema>;

/**
 * Complete effect facts derived from effectClass.
 * READ_ONLY: nothing mutates, so reversibility is not applicable (null).
 * Runtime must only consult `reversible` when `stateChanging === true`.
 */
export type DerivedEffectFacts = Readonly<{
  stateChanging: boolean;
  reversible: boolean | null;
}>;

export function deriveEffectFacts(
  effectClass: EffectClass
): DerivedEffectFacts {
  switch (effectClass) {
    case "READ_ONLY":
      return { stateChanging: false, reversible: null };
    case "STATE_CHANGE":
      return { stateChanging: true, reversible: true };
    case "IRREVERSIBLE":
      return { stateChanging: true, reversible: false };
  }
}

/**
 * Catalog declaration shape. This becomes execution authority only after
 * resolution from the trusted admission catalog by actionId.
 * Execute callers must never supply this object directly.
 *
 * `admitted: false` is a legitimate catalog row (disabled / not currently
 * admitted). Prefer this name over "AdmittedAction" for that reason.
 */
export const ActionCatalogEntrySchema = z
  .object({
    actionId: z.string().min(1).describe("Stable action identifier"),
    adapterId: z
      .string()
      .min(1)
      .describe("Adapter / jurisdiction identity for this entry"),
    version: z.string().min(1).describe("Action declaration version"),
    effectClass: EffectClassSchema.describe(
      "Catalog-declared effect class; execute callers must not supply or override"
    ),
    declaredResourceTypes: z
      .array(z.string().min(1))
      .min(1)
      .describe("Resource types this action may target (exact membership)"),
    admitted: z
      .boolean()
      .describe("Whether this catalog entry is currently admitted/enabled"),
  })
  .strict()
  .describe("Action catalog entry declaration shape");

export type ActionCatalogEntry = z.infer<typeof ActionCatalogEntrySchema>;

/** @deprecated Use ActionCatalogEntrySchema — retained name only for migration clarity. */
export const AdmittedActionSchema = ActionCatalogEntrySchema;
/** @deprecated Use ActionCatalogEntry */
export type AdmittedAction = ActionCatalogEntry;
