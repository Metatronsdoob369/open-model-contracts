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
  AuditEventSchema,
} from './core/core-schemas.js';

export {
  ArchetypeVariantSchema,
  AutonomousScientistPersonaSchema,
  SimOutputSchema,
  PopSimContractInputSchema,
  PopSimContractOutputSchema,
} from './domains/popsim/popsim-domain.js';

export {
  SimulationContractSchema,
  CinematicContractSchema,
  JournalistContractSchema,
  RacingDomainSchema,
} from './domains/racing/racing-domain.js';

export {
  FlightDomainSchema,
} from './domains/flight/flight-domain.js';

export {
  SwarmDomainSchema,
} from './domains/swarm/swarm-domain.js';

export {
  MarketDomainSchema,
} from './domains/market/market-domain.js';

export {
  PopulationDomainSchema,
} from './domains/population/population-domain.js';

export {
  GenericGameInputSchema,
  GenericGameOutputSchema,
} from './domains/generic/generic-domain.js';

export {
  TycoonDomainSchema,
} from './domains/tycoon/tycoon-domain.js';

export {
  CryptoDomainSchema,
} from './domains/crypto/crypto-domain.js';

export type { RacingDomain } from './domains/racing/racing-domain.js';
export type { FlightDomain } from './domains/flight/flight-domain.js';
export type { SwarmDomain } from './domains/swarm/swarm-domain.js';
export type { MarketDomain } from './domains/market/market-domain.js';
export type { PopulationDomain } from './domains/population/population-domain.js';
export type { TycoonDomain } from './domains/tycoon/tycoon-domain.js';
export type { CryptoDomain } from './domains/crypto/crypto-domain.js';

// ── Natural Language to Contract ────────────────────────────────────────────
export {
  NLToContractTranslator,
  translator,
  GameTemplateSchema,
  GAME_TEMPLATES,
} from './lib/nl-to-game/nl-to-contracts.js';

// ── Asset Generation ────────────────────────────────────────────────────────
export {
  AssetGeneratorSwarm,
  GeneratedAssetSchema,
  AssetGenerationResultSchema,
} from './lib/nl-to-game/asset-generator.js';


// ── Types (TypeScript — compile-time safety) ────────────────────────────────
export type {
  Gate,
  AuditEvent,
  ArchetypeVariant,
  AutonomousScientistPersona,
  SimOutput,
  SimOutputType,
  PopSimContractInput,
  PopSimContractOutput,
  PopSimOutputCompleted,
  PopSimOutputPendingApproval,
  PopSimOutputFailed,
  SimulationSettings,
} from './types.js';
