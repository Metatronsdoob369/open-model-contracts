import { z } from 'zod';

const RiskItemSchema = z.object({
  name: z.string().min(1),
  mitigation: z.string().optional(),
  escalation: z.string().optional(),
});

export const AgentGovernanceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().default('1.0'),
  operatingContract: z.object({
    mode: z.enum(['SAFE', 'ARMED']).default('SAFE'),
    scope: z.string().min(1),
    authority: z.string().min(1),
    auditability: z.boolean().default(true),
    exit: z.string().min(1),
  }),
  profile: z.object({
    problem: z.string().min(1),
    owner: z.string().min(1),
    user: z.string().min(1),
    capabilities: z.array(z.string().min(1)).min(1),
    refusals: z.array(z.string().min(1)).optional(),
    dependencies: z.array(z.string().min(1)).optional(),
    successMetrics: z.array(z.string().min(1)).min(1),
    riskRegister: z.array(RiskItemSchema).default([]),
  }),
  boundaries: z.object({
    toolGating: z.string().min(1),
    dataGating: z.string().min(1),
    executionGating: z.string().min(1),
    outputGating: z.string().min(1),
  }),
  lifecycle: z.object({
    states: z.array(z.string().min(1)).min(1),
    entry: z.string().min(1),
    load: z.string().min(1),
    plan: z.string().min(1),
    arm: z.string().min(1),
    execute: z.string().min(1),
    review: z.string().min(1),
    exit: z.string().min(1),
  }),
  observability: z.object({
    actionLog: z.string().min(1),
    decisionLog: z.string().min(1),
    contextLog: z.string().min(1),
    integrityLog: z.string().min(1),
  }),
  reliability: z.object({
    failureHandling: z.string().min(1),
    recovery: z.string().min(1),
    retries: z.string().min(1),
    hallucinationControl: z.string().min(1),
  }),
  ethics: z.object({
    bias: z.string().min(1),
    explainability: z.string().min(1),
    privacy: z.string().min(1),
    security: z.string().min(1),
  }),
  performance: z.object({
    metrics: z.array(z.string().min(1)).min(1),
    businessValue: z.array(z.string().min(1)).optional(),
  }),
  collaboration: z.object({
    humanRole: z.string().min(1),
    agentRole: z.string().min(1),
    escalation: z.string().min(1),
  }),
  releaseGate: z.object({
    safety: z.string().min(1),
    scope: z.string().min(1),
    reliability: z.string().min(1),
    business: z.string().min(1),
    governance: z.string().min(1),
  }),
  artifacts: z.array(z.string().min(1)).min(1),
});

export type AgentGovernance = z.infer<typeof AgentGovernanceSchema>;
