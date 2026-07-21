/**
 * OMC v3 — Execution Authorization ("Law")
 *
 * Canonical gate envelope for mediated SAFE/ARMED execution.
 * Must NOT import from src/**; this is pure Law, no runtime.
 *
 * ## Version 3.1.0 migration (from 3.0.0)
 *
 * Breaking structural changes (bump required — do not silently change 3.0.0):
 * - Discriminated SAFE vs ARMED forms; incomplete ARMED fails Zod (not only runtime).
 * - Both forms are `.strict()` — unknown fields (e.g. caller `stateChanging`,
 *   `reversible`, `effectClass`, wildcard scopes) are rejected, not stripped.
 * - `scope` replaced by required `actionId` on both forms.
 * - Exact `resourceRef` ({ resourceType, resourceId }) required on both forms.
 * - `reversible` removed from the authorization envelope — effect facts are
 *   derived from the catalog entry's `effectClass` after trusted lookup (CG-011).
 * - ARMED structurally requires: actionId, resourceRef, expiry, owner, approval.
 * - SAFE requires actionId + resourceRef (observation subject) but no approval.
 *
 * Schema validates shape only. Catalog provenance, resourceId binding, and
 * gate mediation are runtime claims proven separately.
 */
import { z } from "zod";
import { ResourceRefSchema } from "./admitted-action.js";

export const ApprovalSchema = z
  .object({
    approvedBy: z.string().min(1).describe("Human or authority identity string"),
    approvedAt: z.string().datetime().describe("ISO-8601 approval timestamp"),
    approvalId: z.string().min(1).describe("Opaque approval identifier"),
  })
  .strict();

const authorizationInput = z
  .record(z.unknown())
  .default({})
  .describe("Execution input payload");

/**
 * SAFE observation authorization — identifies action + resource under observation.
 * No approval metadata required.
 */
export const SafeExecutionAuthorizationSchema = z
  .object({
    name: z.string().min(1).describe("Authorization / contract name"),
    gate: z.literal("SAFE").describe("SAFE observation gate"),
    actionId: z.string().min(1).describe("Exact action id being observed"),
    resourceRef: ResourceRefSchema.describe(
      "Exact resource under observation"
    ),
    input: authorizationInput,
  })
  .strict()
  .describe("SAFE mediated execution authorization");

/**
 * ARMED authorization — structurally complete or Zod-invalid.
 * Runtime still evaluates expiry-in-the-future and action/resource binding.
 */
export const ArmedExecutionAuthorizationSchema = z
  .object({
    name: z.string().min(1).describe("Authorization / contract name"),
    gate: z.literal("ARMED").describe("ARMED execution gate"),
    actionId: z
      .string()
      .min(1)
      .describe("Exact action id permitted when ARMED"),
    resourceRef: ResourceRefSchema.describe(
      "Exact resource permitted when ARMED"
    ),
    expiry: z
      .string()
      .datetime()
      .describe("ISO-8601 expiry; must be in the future at evaluation"),
    owner: z.string().min(1).describe("Accountable owner"),
    approval: ApprovalSchema.describe(
      "Structured human approval metadata (not cryptographic identity)"
    ),
    input: authorizationInput,
  })
  .strict()
  .describe("ARMED mediated execution authorization");

/**
 * Authorization envelope required for mediated execution.
 * Discriminated on `gate` so incomplete ARMED fails Informant/OMC_REGISTRY Zod.
 */
export const ExecutionAuthorizationSchema = z
  .discriminatedUnion("gate", [
    SafeExecutionAuthorizationSchema,
    ArmedExecutionAuthorizationSchema,
  ])
  .describe("OMC mediated execution authorization envelope (v3.1.0)");

export type Approval = z.infer<typeof ApprovalSchema>;
export type SafeExecutionAuthorization = z.infer<
  typeof SafeExecutionAuthorizationSchema
>;
export type ArmedExecutionAuthorization = z.infer<
  typeof ArmedExecutionAuthorizationSchema
>;
export type ExecutionAuthorization = z.infer<typeof ExecutionAuthorizationSchema>;
