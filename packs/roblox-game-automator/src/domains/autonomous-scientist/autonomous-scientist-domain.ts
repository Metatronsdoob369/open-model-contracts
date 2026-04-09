import { z } from 'zod';
import { PopulationDomainSchema } from '../population/population-domain';

/**
 * Autonomous Scientist Mock-Up: Population Sim in Roblox Studio + Telegram Dual-Render
 * Extends popsim-contract's Population Domain for OMC-governed automation.
 * Mock for MiroFish swarm sims: Agents in virtual world (Roblox), mirrored to Telegram Mini App.
 * Proves loop: Seed → GSI validate → Dual UI output (3D sim + chat seal).
 */

export const AutonomousScientistAssetSchema = z.object({
  virtualLabId: z.string().describe("Roblox experience ID for scientist sim"),
  agentModels: z.array(z.string()).describe("Roblox asset IDs for swarm agents"),
  experimentScript: z.string().describe("Luau code for population dynamics"),
  dataFeed: z.string().optional().describe("Telegram scraper input for real-time sim"),
});

export const DualRenderContractSchema = z.object({
  robloxRender: z.object({
    environment: z.enum(['lab', 'city', 'ecosystem']).default('lab'),
    interactionMode: z.enum(['observe', 'interact', 'simulate']),
  }),
  telegramRender: z.object({
    miniAppView: z.enum(['mirror', 'chat', 'dashboard']),
    sealRequired: z.boolean().default(true),
  }),
  syncQueue: z.string().default("autonomous-sync"), // BullMQ for cross-platform events
});

export const AutonomousScientistDomainSchema = PopulationDomainSchema.extend({
  mockType: z.literal('autonomous-scientist'),
  assets: AutonomousScientistAssetSchema,
  dualRender: DualRenderContractSchema,
  omcIntegration: z.object({
    gsiThreshold: z.number().default(0.95),
    backendHub: z.string().url().default("http://localhost:8080/v1/contract/autonomous"),
    scraperFeed: z.string().optional().describe("Real estate or pop data from Telegram bot"),
  }),
  stateTracking: z.object({
    workflowId: z.string(),
    robloxSessionId: z.string().optional(),
    telegramChatId: z.string().optional(),
    simIteration: z.number(),
  }),
  enforceSwarmTruth: z.boolean().default(true), // GSI for agent behaviors
});

// Export for OMC bridge use
export type AutonomousScientistDomain = z.infer<typeof AutonomousScientistDomainSchema>;
