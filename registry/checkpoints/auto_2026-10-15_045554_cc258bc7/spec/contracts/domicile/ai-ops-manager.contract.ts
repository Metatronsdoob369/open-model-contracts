/**
 * AI Operations Manager Skill Contracts
 *
 * Strategic AI operations management and governance orchestration.
 * Admission-compliant skill for enterprise AI oversight.
 *
 * @module contracts/ai-ops-manager
 * @admission-status APPROVED
 * @covenant-integration ENABLED
 */

import { z } from 'zod';

// ============================================================================
// INPUT CONTRACT
// ============================================================================

export const AIOperationsTaskSchema = z.object({
  /** Task type determines which affordance will be executed */
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

  /** Organizational scope definition */
  scope: z.object({
    organizational_units: z.array(z.string()).min(1, 'At least one organizational unit required'),
    ai_systems: z.array(z.string()).min(1, 'At least one AI system required'),
    time_horizon: z.enum(['immediate', 'quarterly', 'annual', 'strategic']),
    stakeholders: z.array(z.string()).min(1, 'At least one stakeholder required')
  }),

  /** Contextual information for decision-making */
  context: z.object({
    business_objectives: z.array(z.string()),
    compliance_frameworks: z.array(z.enum(['GDPR', 'CCPA', 'HIPAA', 'SOC2', 'ISO27001'])),
    budget_constraints: z.object({
      total_budget: z.number().nonnegative(),
      allocated: z.number().nonnegative(),
      available: z.number().nonnegative()
    }).refine(data => data.allocated + data.available === data.total_budget, {
      message: 'allocated + available must equal total_budget'
    }).optional(),
    current_performance_baselines: z.record(z.string(), z.number()).optional()
  }),

  /** SAFE/ARMED gate enforcement */
  gate: z.enum(['SAFE', 'ARMED']),

  /** Gate expiry (ISO 8601 datetime) */
  expiry: z.string().datetime(),

  /** Accountable executive owner */
  owner: z.string().min(1, 'Owner required for traceability')
});

export type AIOperationsTask = z.infer<typeof AIOperationsTaskSchema>;

// ============================================================================
// OUTPUT CONTRACTS (Discriminated Union by Result Type)
// ============================================================================

const StrategyPlanSchema = z.object({
  type: z.literal('strategy_plan'),
  objectives: z.array(z.string()),
  initiatives: z.array(z.object({
    name: z.string(),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']),
    timeline: z.string(),
    estimated_cost: z.number().nonnegative(),
    dependencies: z.array(z.string())
  })),
  success_metrics: z.array(z.string()),
  approval_required: z.boolean()
});

const PerformanceReportSchema = z.object({
  type: z.literal('performance_report'),
  systems_monitored: z.number().nonnegative(),
  metrics: z.record(z.string(), z.object({
    current: z.number(),
    baseline: z.number(),
    trend: z.enum(['improving', 'stable', 'degrading']),
    threshold_status: z.enum(['healthy', 'warning', 'critical'])
  })),
  recommendations: z.array(z.string()),
  critical_issues: z.number().nonnegative()
});

const GovernanceAuditSchema = z.object({
  type: z.literal('governance_audit'),
  frameworks_evaluated: z.array(z.string()),
  compliance_score: z.number().min(0).max(100),
  gaps_identified: z.array(z.object({
    category: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    remediation: z.string(),
    estimated_effort: z.enum(['low', 'medium', 'high'])
  })),
  next_audit_date: z.string().datetime()
});

const DeploymentValidationSchema = z.object({
  type: z.literal('deployment_validation'),
  system_id: z.string(),
  go_decision: z.boolean(),
  readiness_score: z.number().min(0).max(100),
  blockers: z.array(z.string()),
  conditions: z.array(z.string()),
  security_review_completed: z.boolean(),
  performance_validated: z.boolean(),
  approved_by: z.string().optional()
});

const VendorEvaluationSchema = z.object({
  type: z.literal('vendor_evaluation'),
  vendors_assessed: z.array(z.object({
    name: z.string(),
    capability_score: z.number().min(0).max(100),
    cost_score: z.number().min(0).max(100),
    integration_score: z.number().min(0).max(100),
    support_score: z.number().min(0).max(100),
    overall_score: z.number().min(0).max(100),
    overall_recommendation: z.enum(['recommend', 'consider', 'avoid']),
    notes: z.string().optional()
  })),
  top_recommendation: z.string()
});

const RiskAssessmentSchema = z.object({
  type: z.literal('risk_assessment'),
  risks_identified: z.array(z.object({
    id: z.string(),
    category: z.enum(['technical', 'operational', 'compliance', 'financial', 'reputational']),
    description: z.string(),
    likelihood: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
    risk_score: z.number().min(1).max(9), // likelihood × impact
    mitigation: z.string(),
    owner: z.string(),
    target_date: z.string().datetime().optional()
  })),
  overall_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  critical_risks_count: z.number().nonnegative()
});

const ResourceAllocationSchema = z.object({
  type: z.literal('resource_allocation'),
  current_allocation: z.record(z.string(), z.number()),
  proposed_allocation: z.record(z.string(), z.number()),
  efficiency_gain: z.number(),
  cost_savings: z.number().optional(),
  implementation_timeline: z.string(),
  approval_required: z.boolean(),
  impact_on_operations: z.enum(['minimal', 'moderate', 'significant'])
});

const ChangeImpactSchema = z.object({
  type: z.literal('change_impact'),
  change_description: z.string(),
  affected_systems: z.array(z.string()),
  affected_stakeholders: z.array(z.string()),
  impact_level: z.enum(['low', 'medium', 'high', 'critical']),
  mitigation_plan: z.string(),
  rollback_plan: z.string(),
  testing_required: z.boolean(),
  estimated_downtime: z.string().optional()
});

const StrategicReportSchema = z.object({
  type: z.literal('strategic_report'),
  executive_summary: z.string(),
  key_findings: z.array(z.string()),
  recommendations: z.array(z.object({
    title: z.string(),
    rationale: z.string(),
    impact: z.string(),
    effort: z.enum(['low', 'medium', 'high']),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']),
    estimated_cost: z.number().optional(),
    timeline: z.string().optional()
  })),
  next_steps: z.array(z.string()),
  risks: z.array(z.string()).optional(),
  success_metrics: z.array(z.string()).optional()
});

// Combined discriminated union
const ResultSchema = z.discriminatedUnion('type', [
  StrategyPlanSchema,
  PerformanceReportSchema,
  GovernanceAuditSchema,
  DeploymentValidationSchema,
  VendorEvaluationSchema,
  RiskAssessmentSchema,
  ResourceAllocationSchema,
  ChangeImpactSchema,
  StrategicReportSchema
]);

// ============================================================================
// MAIN OUTPUT CONTRACT
// ============================================================================

export const AIOperationsResultSchema = z.object({
  /** Unique task identifier */
  task_id: z.string().uuid(),

  /** Task type (echoed from input) */
  task_type: z.string(),

  /** Execution status */
  status: z.enum(['completed', 'requires_approval', 'failed', 'insufficient_context']),

  /** Primary result (discriminated union based on task_type) */
  result: ResultSchema,

  /** Execution observability metadata */
  execution_metadata: z.object({
    started_at: z.string().datetime(),
    completed_at: z.string().datetime(),
    duration_seconds: z.number().nonnegative(),
    data_sources_accessed: z.array(z.string()),
    stakeholders_consulted: z.array(z.string()),
    approvals_required: z.array(z.string()).optional(),
    gate_used: z.enum(['SAFE', 'ARMED'])
  }),

  /** Explanatory obligation — reasoning for output */
  reasoning: z.string().min(50, 'Reasoning must be substantive'),

  /** Confidence score (0-100) */
  confidence_score: z.number().min(0).max(100),

  /** Covenant trust score (if critique loop executed) */
  covenant_trust_score: z.number().min(0).max(100).optional(),

  /** Failure explanation (if status = failed) */
  failure_reason: z.string().optional(),

  /** Remediation steps (if status = failed or insufficient_context) */
  remediation_steps: z.array(z.string()).optional()
});

export type AIOperationsResult = z.infer<typeof AIOperationsResultSchema>;

// ============================================================================
// GATE VALIDATION HELPERS
// ============================================================================

/**
 * Validates that the requested task_type is allowed under the current gate.
 *
 * SAFE gate allows: read-only, analysis, evaluation
 * ARMED gate allows: planning with commitments, execution decisions
 */
export function validateGateForTask(task: AIOperationsTask): { valid: boolean; reason?: string } {
  const safeAllowed = [
    'performance_monitoring',
    'governance_audit',
    'vendor_evaluation',
    'risk_assessment',
    'change_impact_analysis'
  ];

  const armedRequired = [
    'strategy_development',
    'deployment_validation',
    'resource_optimization',
    'strategic_reporting'
  ];

  if (task.gate === 'SAFE' && armedRequired.includes(task.task_type)) {
    return {
      valid: false,
      reason: `Task '${task.task_type}' requires ARMED gate (creates commitments or decisions). Current gate: SAFE.`
    };
  }

  if (task.gate === 'ARMED') {
    // Validate expiry is in the future
    const expiry = new Date(task.expiry);
    const now = new Date();
    if (expiry <= now) {
      return {
        valid: false,
        reason: `ARMED gate expired at ${task.expiry}. Current time: ${now.toISOString()}.`
      };
    }

    // Validate owner is set
    if (!task.owner || task.owner.trim() === '') {
      return {
        valid: false,
        reason: 'ARMED gate requires explicit owner for accountability.'
      };
    }
  }

  return { valid: true };
}

/**
 * Checks if the current gate has expired.
 */
export function isGateExpired(expiryISO: string): boolean {
  const expiry = new Date(expiryISO);
  const now = new Date();
  return expiry <= now;
}

// ============================================================================
// AFFORDANCE METADATA (for MCP admission compliance)
// ============================================================================

export const AFFORDANCE_METADATA = {
  monitor_ai_performance: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['system_list', 'metrics_before'],
    task_type: 'performance_monitoring'
  },
  evaluate_governance_compliance: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['frameworks', 'gap_analysis'],
    task_type: 'governance_audit'
  },
  assess_vendor_capabilities: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['vendor_list', 'evaluation_matrix'],
    task_type: 'vendor_evaluation'
  },
  generate_ops_metrics: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['data_sources', 'dashboard'],
    task_type: 'performance_monitoring'
  },
  validate_deployment_readiness: {
    gate: 'ARMED',
    reversible: false,
    side_effects: true,
    inspection_required: ['deployment_plan', 'go_no_go_decision'],
    task_type: 'deployment_validation'
  },
  audit_ai_system: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['system_inventory', 'audit_report'],
    task_type: 'governance_audit'
  },
  plan_ai_initiative: {
    gate: 'ARMED',
    reversible: false,
    side_effects: true,
    inspection_required: ['objectives', 'roadmap_budget'],
    task_type: 'strategy_development'
  },
  assess_risk_exposure: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['threat_model', 'risk_matrix'],
    task_type: 'risk_assessment'
  },
  optimize_resource_allocation: {
    gate: 'ARMED',
    reversible: false,
    side_effects: true,
    inspection_required: ['current_allocation', 'reallocation_plan'],
    task_type: 'resource_optimization'
  },
  evaluate_change_impact: {
    gate: 'SAFE',
    reversible: true,
    side_effects: false,
    inspection_required: ['change_proposal', 'impact_analysis'],
    task_type: 'change_impact_analysis'
  },
  synthesize_strategic_report: {
    gate: 'ARMED',
    reversible: true,
    side_effects: false,
    inspection_required: ['data_sources', 'executive_report'],
    task_type: 'strategic_reporting'
  }
} as const;

export type AffordanceName = keyof typeof AFFORDANCE_METADATA;

// ============================================================================
// EXPORTS
// ============================================================================

export type StrategyPlan = z.infer<typeof StrategyPlanSchema>;
export type PerformanceReport = z.infer<typeof PerformanceReportSchema>;
export type GovernanceAudit = z.infer<typeof GovernanceAuditSchema>;
export type DeploymentValidation = z.infer<typeof DeploymentValidationSchema>;
export type VendorEvaluation = z.infer<typeof VendorEvaluationSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export type ResourceAllocation = z.infer<typeof ResourceAllocationSchema>;
export type ChangeImpact = z.infer<typeof ChangeImpactSchema>;
export type StrategicReport = z.infer<typeof StrategicReportSchema>;
