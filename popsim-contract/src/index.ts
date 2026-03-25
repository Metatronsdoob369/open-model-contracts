/**
 * @popsim/contract
 * Domain contract package for population-based agent simulation.
 * Schedule A attachment for open-model-contracts framework.
 *
 * @see https://github.com/Metatronsdoob369/open-model-contracts
 */

// ── Schemas (Zod validators — runtime enforcement) ──────────────────────────
export {
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

// ── Types (TypeScript — compile-time safety) ────────────────────────────────
export type {
  Gate,
  AgentMeta,
  ExecutionResult,
  AuditEvent,
  ArchetypeVariant,
  SovereignScientistPersona,
  SovereignInterpopulationDynamic,
  SimOutput,
  SimOutputType,
  PopSimContractInput,
  PopSimContractOutput,
  PopSimOutputCompleted,
  PopSimOutputPendingApproval,
  PopSimOutputFailed,
  PopSimFullContract,
  LLMConfig,
  CrewConfig,
  DashboardIntegration,
  SafetyAndContingency,
  SimulationSettings,
} from './types.js';
