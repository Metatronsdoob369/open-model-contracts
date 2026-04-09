/**
 * @popsim/contract — TypeScript types
 * All types are inferred from Zod schemas — single source of truth.
 */

import { z } from 'zod';
import { GateSchema, AuditEventSchema } from './core/core-schemas.js';
import {
  ArchetypeVariantSchema,
  AutonomousScientistPersonaSchema,
  SimOutputSchema,
  PopSimContractInputSchema,
  PopSimContractOutputSchema,
} from './domains/popsim/popsim-domain.js';

// NOTE: AgentMetaSchema, ExecutionResultSchema, etc. are currently 
// omitted for brevity in the modular refactor. Add back if needed.

// Core gate type
export type Gate = z.infer<typeof GateSchema>;

// Core framework types
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Domain-specific types
export type ArchetypeVariant = z.infer<typeof ArchetypeVariantSchema>;
export type AutonomousScientistPersona = z.infer<typeof AutonomousScientistPersonaSchema>;
export type SimOutput = z.infer<typeof SimOutputSchema>;

// Contract I/O types
export type PopSimContractInput = z.infer<typeof PopSimContractInputSchema>;
export type PopSimContractOutput = z.infer<typeof PopSimContractOutputSchema>;

// Convenience discriminated union accessors
export type PopSimOutputCompleted = Extract<PopSimContractOutput, { status: 'completed' }>;
export type PopSimOutputPendingApproval = Extract<PopSimContractOutput, { status: 'requires_approval' }>;
export type PopSimOutputFailed = Extract<PopSimContractOutput, { status: 'failed' }>;

// Simulation output type taxonomy
export type SimOutputType = SimOutput['outputType'];

// Simulation settings helper
export type SimulationSettings = PopSimContractInput['simulationSettings'];

// Full Contract type (the "Gold Standard" for delivery hub)
import { PopSimFullContractSchema } from './schemas.js';
export type PopSimFullContract = z.infer<typeof PopSimFullContractSchema>;
