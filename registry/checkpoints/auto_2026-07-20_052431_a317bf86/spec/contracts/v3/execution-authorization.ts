/**
 * OMC v3 — Execution Authorization ("Law")
 *
 * Canonical gate envelope for mediated SAFE/ARMED execution.
 * Must NOT import from src/**; this is pure Law, no runtime.
 */
import { z } from "zod";

export const ApprovalSchema = z.object({
  approvedBy: z.string().min(1).describe("Human or authority identity string"),
  approvedAt: z.string().datetime().describe("ISO-8601 approval timestamp"),
  approvalId: z.string().min(1).describe("Opaque approval identifier"),
});

/**
 * Authorization envelope required for mediated execution.
 * ARMED requires scope, expiry, owner, and approval (enforced by runtime gate evaluation).
 */
export const ExecutionAuthorizationSchema = z
  .object({
    name: z.string().min(1).describe("Authorization / contract name"),
    gate: z.enum(["SAFE", "ARMED"]).describe("Execution gate"),
    reversible: z.boolean().describe("Whether effects are reversible"),
    scope: z
      .string()
      .min(1)
      .optional()
      .describe("Exact action id permitted when ARMED"),
    expiry: z
      .string()
      .datetime()
      .optional()
      .describe("ISO-8601 expiry; ARMED must be in the future"),
    owner: z
      .string()
      .min(1)
      .optional()
      .describe("Accountable owner; required when ARMED"),
    approval: ApprovalSchema.optional().describe(
      "Structured human approval; required when ARMED"
    ),
    input: z.record(z.unknown()).default({}).describe("Execution input payload"),
  })
  .describe("OMC mediated execution authorization envelope");

export type Approval = z.infer<typeof ApprovalSchema>;
export type ExecutionAuthorization = z.infer<typeof ExecutionAuthorizationSchema>;
