/**
 * AI Operations Manager Contract
 *
 * Reference implementation demonstrating:
 * - Zod schema validation
 * - SAFE/ARMED gate enforcement
 * - Discriminated union result types
 * - Gate expiry validation
 *
 * @example
 * const task = {
 *   task_type: "strategic_reporting",
 *   scope: { organizational_units: ["Engineering"], ... },
 *   gate: "ARMED",
 *   expiry: "2026-03-01T00:00:00Z",
 *   owner: "CTO"
 * };
 *
 * const result = AIOperationsTaskSchema.safeParse(task);
 */

import { z } from 'zod';

// ============================================================================
// INPUT CONTRACT
// ============================================================================

export const AIOperationsTaskSchema = z.object({
  task_type: z.enum([
    'strategy_development',
    'performance_monitoring',
    'governance_audit',
    'vendor_evaluation',
    'deployment_validation',
    'risk_assessment',
    'resource_optimization',
    'change_impact_analysis',
    'strategic_reporting'
  ]),

  scope: z.object({
    organizational_units: z.array(z.string()).min(1),
    ai_systems: z.array(z.string()).min(1),
    time_horizon: z.enum(['immediate', 'quarterly', 'annual', 'strategic']),
    stakeholders: z.array(z.string()).min(1)
  }),

  context: z.object({
    business_objectives: z.array(z.string()),
    compliance_frameworks: z.array(z.enum(['GDPR', 'CCPA', 'HIPAA', 'SOC2', 'ISO27001'])),
    budget_constraints: z.object({
      total_budget: z.number().nonnegative(),
      allocated: z.number().nonnegative(),
      available: z.number().nonnegative()
    }).optional()
  }),

  gate: z.enum(['SAFE', 'ARMED']),
  expiry: z.string().datetime(),
  owner: z.string().min(1)
});

export type AIOperationsTask = z.infer<typeof AIOperationsTaskSchema>;

// ============================================================================
// OUTPUT CONTRACT (Discriminated Union)
// ============================================================================

const StrategicReportSchema = z.object({
  type: z.literal('strategic_report'),
  executive_summary: z.string(),
  key_findings: z.array(z.string()),
  recommendations: z.array(z.object({
    title: z.string(),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']),
    estimated_cost: z.number().optional()
  })),
  next_steps: z.array(z.string())
});

export const AIOperationsResultSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(['completed', 'requires_approval', 'failed']),
  result: StrategicReportSchema, // Simplified: just one result type for example
  confidence_score: z.number().min(0).max(100),
  reasoning: z.string()
});

export type AIOperationsResult = z.infer<typeof AIOperationsResultSchema>;

// ============================================================================
// GATE VALIDATION
// ============================================================================

export function validateGate(task: AIOperationsTask): { valid: boolean; reason?: string } {
  // ARMED-only task types
  const armedRequired = ['strategy_development', 'deployment_validation', 'strategic_reporting'];

  if (task.gate === 'SAFE' && armedRequired.includes(task.task_type)) {
    return { valid: false, reason: `Task '${task.task_type}' requires ARMED gate` };
  }

  // Check expiry
  const expiry = new Date(task.expiry);
  if (expiry <= new Date()) {
    return { valid: false, reason: `Gate expired at ${task.expiry}` };
  }

  return { valid: true };
}
