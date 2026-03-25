/**
 * @popsim/contract — TypeScript types
 * All types are inferred from Zod schemas — single source of truth.
 */

import { z } from 'zod';
import {
  GateSchema,
  AgentMetaSchema,
  ExecutionResultSchema,
  AuditEventSchema,
  ArchetypeVariantSchema,
  SovereignScientistPersonaSchema,
  SovereignInterpopulationDynamicSchema,
  SimOutputSchema,
  PopSimContractInputSchema,
  PopSimContractOutputSchema,
  PopSimFullContractSchema,
} from './schemas.js';

// Core gate type
export type Gate = z.infer<typeof GateSchema>;

// Core framework types (mirrors open-model-contracts/server/src/core/)
export type AgentMeta = z.infer<typeof AgentMetaSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Domain-specific types
export type ArchetypeVariant = z.infer<typeof ArchetypeVariantSchema>;
export type SovereignScientistPersona = z.infer<typeof SovereignScientistPersonaSchema>;
export type SovereignInterpopulationDynamic = z.infer<typeof SovereignInterpopulationDynamicSchema>;
export type SimOutput = z.infer<typeof SimOutputSchema>;

// Contract I/O types
export type PopSimContractInput = z.infer<typeof PopSimContractInputSchema>;
export type PopSimContractOutput = z.infer<typeof PopSimContractOutputSchema>;

// Top-level contract type
export type PopSimFullContract = z.infer<typeof PopSimFullContractSchema>;

// Convenience discriminated union accessors
export type PopSimOutputCompleted = Extract<PopSimContractOutput, { status: 'completed' }>;
export type PopSimOutputPendingApproval = Extract<PopSimContractOutput, { status: 'requires_approval' }>;
export type PopSimOutputFailed = Extract<PopSimContractOutput, { status: 'failed' }>;

// Simulation output type taxonomy
export type SimOutputType = SimOutput['outputType'];

// Config sub-types (useful for partial construction)
export type LLMConfig = PopSimFullContract['config']['llmConfig'];
export type CrewConfig = PopSimFullContract['config']['crewConfig'];
export type DashboardIntegration = PopSimFullContract['config']['dashboardIntegration'];
export type SafetyAndContingency = PopSimFullContract['config']['safetyAndContingency'];
export type SimulationSettings = PopSimContractInput['simulationSettings'];
