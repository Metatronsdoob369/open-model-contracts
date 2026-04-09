import { z } from 'zod';
import { GateSchema, ContractMetadataSchema, PlatformEconomicContextSchema } from './core/core-schemas.js';
import { AutonomousScientistPersonaSchema, PopSimContractInputSchema } from './domains/popsim/popsim-domain.js';

export { GateSchema, ContractMetadataSchema, PlatformEconomicContextSchema, AutonomousScientistPersonaSchema, PopSimContractInputSchema };

/**
 * POPSIM FULL CONTRACT SCHEMA
 * The definitive schema for validating end-to-end PopSim contracts
 * throughout the delivery hub pipeline.
 */
export const PopSimFullContractSchema = z.object({
    contractMetadata: ContractMetadataSchema,
    config: z.object({
        version: z.string().default('1.0'),
        swarmName: z.string(),
        description: z.string(),
        llmConfig: z.object({
            provider: z.enum(['openai', 'anthropic', 'dolphin', 'huggingface']),
            model: z.string(),
            temperature: z.number(),
        }).optional(),
        agents: z.array(AutonomousScientistPersonaSchema),
        interpopulationDynamics: z.array(z.any()).default([]),
        platformEconomics: PlatformEconomicContextSchema.optional(),
        crewConfig: z.object({
            process: z.enum(['sequential', 'hierarchical']),
            managerAgent: z.object({
                role: z.string(),
                goal: z.string(),
            }).optional(),
        }).optional(),
        dashboardIntegration: z.object({
            outputDirectory: z.string(),
            autoPost: z.object({
                platforms: z.array(z.string()),
                frequency: z.string(),
                humanReviewRequired: z.boolean(),
            }),
        }).optional(),
        safetyAndContingency: z.object({
            humanReviewGate: z.boolean(),
            maxRiskScoreBeforeFlag: z.number(),
            decentralizedFallback: z.array(z.string()),
        }).optional(),
    }),
    contractInput: PopSimContractInputSchema,
    admission: z.array(z.object({
        physics: z.enum(['ROBLOX_LUAU', 'MCP', 'TRADING_LAKE']),
        affordances: z.array(z.string()),
        inspectability: z.boolean(),
        reversibilityDeclaration: z.boolean(),
    })),
    economics: z.object({
        platformFee: z.number().optional(),
        developerShare: z.number().optional(),
        payoutThreshold: z.number().optional(),
        monetizationStrategies: z.array(z.string()).optional(),
    }).optional(),
    governance: z.object({
        safePolicies: z.array(z.string()).optional(),
        armedTriggers: z.array(z.string()).optional(),
    }).optional(),
});
