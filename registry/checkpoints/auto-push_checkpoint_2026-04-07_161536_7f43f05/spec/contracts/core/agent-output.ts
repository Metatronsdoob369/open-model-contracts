import { z } from "zod";

/**
 * AgentOutputZod
 * 
 * The canonical contract for all Domicile-compliant AI agent outputs.
 * This schema governs the bridge between 'Contractual Law' and 'Physical Manifestation'.
 * 
 * Physics:
 * - Implementation is guided by Governance (Security, Compliance, Ethics).
 * - Success is measured by Validation Criteria.
 * - Confidence and FIST scores determine routing and trust.
 */

export const ExecutionFabricZod = z.object({
  biometric_attestation: z.literal('fist').default('fist'),
  oracle_id: z.string(),
  min_score: z.number().min(0).max(1),
});

export const ImplementationPlanZod = z.object({
  modules: z.array(z.string()),
  architecture: z.string(),
  estimated_effort: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export const GovernanceZod = z.object({
  security: z.string(),
  compliance: z.string(),
  ethics: z.string(),
  data_handling: z.string().optional(),
});

export const AgentOutputZod = z.object({
  enhancement_area: z.string().min(1),
  objective: z.string().min(1),
  implementation_plan: ImplementationPlanZod,
  depends_on: z.array(z.string()),
  sources: z.array(z.string()),
  governance: GovernanceZod,
  validation_criteria: z.string(),
  confidence_score: z.number().min(0).max(1),
  estimated_completion_time: z.string().optional(),
  execution_fabric: ExecutionFabricZod.optional(),
});
