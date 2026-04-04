/**
 * @popsim/contract — Natural Language to Contract Translation Layer
 * Converts natural language game ideas into validated PopSim contracts
 * that can be executed by asset generation agent swarms.
 */

import { z } from 'zod';
import {
    PopSimFullContractSchema,
    PopSimContractInputSchema,
    SovereignScientistPersonaSchema,
    GateSchema,
} from '../../schemas.js';

// ─────────────────────────────────────────────
// GAME TEMPLATE REGISTRY
// Pre-defined templates for common Roblox game types
// ─────────────────────────────────────────────

export const GameTemplateType = z.enum([
    'tycoon',
    'simulator',
    'obby',
    'roleplay',
    'battle_arena',
    'puzzle',
    'racing',
    'survival',
    'tag_game',
    'architecture',
    'world',
    'metropolis',
    'chaos_metropolis',
]);

export const GameTemplateSchema = z.object({
    templateId: z.string(),
    name: z.string(),
    description: z.string(),
    templateType: GameTemplateType,
    coreMechanics: z.array(z.string()),
    requiredAssets: z.array(z.string()),
    monetizationStrategies: z.array(z.enum(['freemium', 'item-based', 'gamepass', 'donations', 'land-ownership', 'advertising'])),
    estimatedComplexity: z.enum(['low', 'medium', 'high', 'extreme']),
    luauModules: z.array(z.string()),
});

// ─────────────────────────────────────────────
// NL PROMPT STRUCTURE
// ─────────────────────────────────────────────

export const NaturalLanguagePromptSchema = z.object({
    prompt: z.string().min(10),
    desiredGenre: GameTemplateType.optional(),
    targetAudience: z.object({
        ageRange: z.tuple([z.number().int(), z.number().int()]).optional(),
        interests: z.array(z.string()).optional(),
    }).optional(),
    monetizationPreference: z.enum(['freemium', 'subscription', 'item-based', 'donations', 'none']).optional(),
    complexityLevel: z.enum(['simple', 'moderate', 'complex']).optional(),
    platformTargets: z.array(z.enum(['roblox', 'telegram', 'multi-platform'])).default(['roblox']),
});

// ─────────────────────────────────────────────
// CONTRACT GENERATION RESULT
// ─────────────────────────────────────────────

export const GeneratedContractSchema = z.object({
    success: z.boolean(),
    contract: PopSimFullContractSchema.optional(),
    templateUsed: GameTemplateSchema.optional(),
    confidenceScore: z.number().min(0).max(1),
    requiresHumanReview: z.boolean(),
    flaggedConcerns: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()),
});

// ─────────────────────────────────────────────
// TEMPLATE LIBRARY
// ─────────────────────────────────────────────

export const GAME_TEMPLATES: Record<string, z.infer<typeof GameTemplateSchema>> = {
    tycoon_basic: {
        templateId: 'tycoon_basic',
        name: 'Classic Tycoon',
        description: 'Build and expand a business empire through resource management and upgrades',
        templateType: 'tycoon',
        coreMechanics: [
            'Resource collection (auto/manual)',
            'Building/upgrades system',
            'Revenue generation loops',
            'Progression milestones',
            'Leaderboard integration',
        ],
        requiredAssets: [
            'Base plot system',
            'Money collector/dropper',
            'Upgrade buttons/models',
            'Spawn/rebirth system',
            'UI dashboard',
        ],
        monetizationStrategies: ['gamepass', 'item-based', 'donations'],
        estimatedComplexity: 'medium',
        luauModules: [
            'TycoonController.lua',
            'ResourceManager.lua',
            'UpgradeSystem.lua',
            'DataStoreHandler.lua',
            'MonetizationBridge.lua',
        ],
    },
    simulator_grind: {
        templateId: 'simulator_grind',
        name: 'Grind Simulator',
        description: 'Click/train/grind to gain stats, unlock areas, and prestige for multipliers',
        templateType: 'simulator',
        coreMechanics: [
            'Click/interaction mechanic',
            'Stat progression (strength, speed, etc.)',
            'Pet/companion system',
            'Area unlocking',
            'Prestige/rebirth system',
            'Inventory management',
        ],
        requiredAssets: [
            'Interaction tools',
            'Stat display UI',
            'Shop system',
            'Pet spawning logic',
            'Teleportation pads',
        ],
        monetizationStrategies: ['gamepass', 'item-based', 'donations'],
        estimatedComplexity: 'medium',
        luauModules: [
            'SimulatorCore.lua',
            'StatManager.lua',
            'PetSystem.lua',
            'ShopInterface.lua',
            'PrestigeHandler.lua',
        ],
    },
    obby_classic: {
        templateId: 'obby_classic',
        name: 'Classic Obby',
        description: 'Obstacle course with checkpoints, traps, and visual themes',
        templateType: 'obby',
        coreMechanics: [
            'Checkpoint system',
            'Trap/hazard mechanics',
            'Stage progression',
            'Timer/speedrun tracking',
            'Death/reset logic',
        ],
        requiredAssets: [
            'Obstacle models',
            'Checkpoint triggers',
            'Kill bricks',
            'Win zone',
            'Leaderboard GUI',
        ],
        monetizationStrategies: ['gamepass', 'donations'],
        estimatedComplexity: 'low',
        luauModules: [
            'CheckpointManager.lua',
            'TrapController.lua',
            'TimerSystem.lua',
            'VictoryHandler.lua',
        ],
    },
    tag_game_chaos: {
        templateId: 'tag_game_chaos',
        name: 'Chaos Tag',
        description: 'High-energy tag game with "IT" visuals, particle explosions, and rowdy commands',
        templateType: 'tag_game',
        coreMechanics: [
            'Dynamic "IT" selection',
            'Tag collision detection',
            'Visual feedbacks (explosions, highlights)',
            'Chaos commands (/rowdy)',
            'Round-based progression',
        ],
        requiredAssets: [
            'TagManager (Server)',
            'TagHUD (UI)',
            'TagClient (Script)',
            'RemoteEvents (Network)',
        ],
        monetizationStrategies: ['item-based', 'donations'],
        estimatedComplexity: 'medium',
        luauModules: [
            'TagManager.lua',
            'TagGameClient.lua',
            'VisualEffectService.lua',
            'NetworkBridge.lua',
        ],
    },
    chaos_metropolis: {
        templateId: 'chaos_metropolis',
        name: 'Chaos Metropolis ARMED',
        description: 'Large-scale gothic city with active tag game mechanics and player abilities',
        templateType: 'chaos_metropolis',
        coreMechanics: [
            'Metropolis generation',
            'Sprinting/Dashing abilities',
            'Tagging mechanics',
            'Global scoreboard',
        ],
        requiredAssets: [
            'Level scripts',
            'Tag systems',
            'UI HUD',
            'Sound effects',
        ],
        monetizationStrategies: ['item-based', 'donations', 'gamepass'],
        estimatedComplexity: 'extreme',
        luauModules: [
            'StreetGenerator.lua',
            'TowerGenerator.lua',
            'TrafficController.lua',
            'SignageManager.lua',
            'AtmosphereManager.lua',
            'TagManager.lua',
            'TagGameClient.lua',
            'PlayerAbilities.lua',
            'NetworkBridge.lua',
            'VisualEffectService.lua',
        ],
    },
    architecture_static: {
        templateId: 'architecture_static',
        name: 'Static Architecture',
        description: 'Build complex, non-interactive structures and atmospheric environments',
        templateType: 'architecture',
        coreMechanics: [
            'Procedural geometry generation',
            'Material/texture application',
            'Atmospheric lighting control',
            'Statue/accessory placement',
        ],
        requiredAssets: [
            'Structure scripts',
            'Lighting presets',
            'Material library',
            'Spawn anchors',
        ],
        monetizationStrategies: ['donations'],
        estimatedComplexity: 'high',
        luauModules: [
            'StructureGenerator.lua',
            'AtmosphereManager.lua',
            'MaterialService.lua',
            'AssetLibrary.lua',
        ],
    },
    world_generation: {
        templateId: 'world_generation',
        name: 'World Generation',
        description: 'Large-scale environment and terrain generation',
        templateType: 'world',
        coreMechanics: [
            'Procedural terrain sculpting',
            'Global atmosphere control',
            'Biomes and foliage placement',
        ],
        requiredAssets: [
            'TerrainManager.lua',
            'CityGenerator.lua',
            'MegastructureCore.lua',
            'GlobalAtmosphere.lua',
            'LevelDirector.lua',
        ],
        monetizationStrategies: ['donations', 'freemium'],
        estimatedComplexity: 'high',
        luauModules: [
            'TerrainManager.lua',
            'CityGenerator.lua',
            'MegastructureCore.lua',
            'GlobalAtmosphere.lua',
            'LevelDirector.lua',
            'MaterialService.lua',
        ],
    },
    city_scale: {
        templateId: 'city_scale',
        name: 'Metropolis Generation',
        description: 'Procedural generation of a gothic-cyber metropolis',
        templateType: 'metropolis',
        coreMechanics: [
            'Street/Grid generation',
            'Tower instantiation',
            'Traffic/Ambient systems',
        ],
        requiredAssets: [
            'StreetGenerator.lua',
            'TowerGenerator.lua',
            'TrafficController.lua',
            'SignageManager.lua',
        ],
        monetizationStrategies: ['donations', 'freemium'],
        estimatedComplexity: 'high',
        luauModules: [
            'StreetGenerator.lua',
            'TowerGenerator.lua',
            'TrafficController.lua',
            'SignageManager.lua',
            'AtmosphereManager.lua',
        ],
    },
};

// ─────────────────────────────────────────────
// NL TO CONTRACT TRANSLATOR
// ─────────────────────────────────────────────

export class NLToContractTranslator {
    private templates: typeof GAME_TEMPLATES;

    constructor() {
        this.templates = GAME_TEMPLATES;
    }

    /**
     * Parse natural language prompt and extract structured intent
     */
    parseIntent(nlPrompt: string): z.infer<typeof NaturalLanguagePromptSchema> {
        const lowerPrompt = nlPrompt.toLowerCase();

        // Detect genre from keywords (Prioritize Hybrid Large Scale)
        let detectedGenre: z.infer<typeof GameTemplateType> | undefined;
        if (lowerPrompt.includes('chaos') && lowerPrompt.includes('metropolis')) {
            detectedGenre = 'chaos_metropolis' as any;
        } else if (lowerPrompt.includes('city') || lowerPrompt.includes('metropolis') || lowerPrompt.includes('metropolis') || lowerPrompt.includes('urban')) {
            detectedGenre = 'metropolis' as any;
        } else if (lowerPrompt.includes('world') || lowerPrompt.includes('level') || lowerPrompt.includes('environment') || lowerPrompt.includes('map')) {
            detectedGenre = 'world' as any;
        } else if (lowerPrompt.includes('tycoon') || lowerPrompt.includes('business') || lowerPrompt.includes('empire')) {
            detectedGenre = 'tycoon';
        } else if (lowerPrompt.includes('simulat') || lowerPrompt.includes('grind') || lowerPrompt.includes('click')) {
            detectedGenre = 'simulator';
        } else if (lowerPrompt.includes('obby') || lowerPrompt.includes('obstacle') || lowerPrompt.includes('parkour')) {
            detectedGenre = 'obby';
        } else if (lowerPrompt.includes('tag') || lowerPrompt.includes('chaos') || lowerPrompt.includes('rowdy')) {
            detectedGenre = 'tag_game';
        } else if (lowerPrompt.includes('architecture') || lowerPrompt.includes('cathedral') || lowerPrompt.includes('building') || lowerPrompt.includes('place')) {
            detectedGenre = 'architecture';
        }

        // Detect monetization preference
        let monetizationPref: z.infer<typeof NaturalLanguagePromptSchema>['monetizationPreference'] = 'freemium';
        if (lowerPrompt.includes('free') && !lowerPrompt.includes('freemium')) {
            monetizationPref = 'freemium';
        } else if (lowerPrompt.includes('subscription') || lowerPrompt.includes('monthly')) {
            monetizationPref = 'subscription';
        } else if (lowerPrompt.includes('item') || lowerPrompt.includes('cosmetic')) {
            monetizationPref = 'item-based';
        }

        return {
            prompt: nlPrompt,
            desiredGenre: detectedGenre,
            monetizationPreference: monetizationPref,
            platformTargets: ['roblox'],
        };
    }

    /**
     * Select best matching template based on parsed intent
     */
    selectTemplate(intent: z.infer<typeof NaturalLanguagePromptSchema>): z.infer<typeof GameTemplateSchema> | null {
        if (intent.desiredGenre) {
            const matched = Object.values(this.templates).find(
                t => t.templateType === intent.desiredGenre
            );
            if (matched) return matched;
        }

        return this.templates.tycoon_basic;
    }

    /**
     * Generate full PopSim contract from natural language
     */
    async generateContract(
        nlPrompt: string,
        options?: {
            runId?: string;
            swarmName?: string;
            gate?: 'SAFE' | 'ARMED';
        }
    ): Promise<z.infer<typeof GeneratedContractSchema>> {
        try {
            const intent = this.parseIntent(nlPrompt);
            const template = this.selectTemplate(intent);
            if (!template) {
                return {
                    success: false,
                    confidenceScore: 0,
                    requiresHumanReview: true,
                    flaggedConcerns: ['No suitable template found for request'],
                    nextSteps: ['Refine prompt with specific genre (tycoon/simulator/obby)'],
                };
            }

            const timestamp = new Date().toISOString();
            const runId = options?.runId || crypto.randomUUID();
            const swarmName = options?.swarmName || 'AssetGenerationSwarm';
            const gate = options?.gate || 'SAFE';

            // Create agent personas specialized for asset generation
            const assetAgents: z.infer<typeof SovereignScientistPersonaSchema>[] = template.luauModules.map((module, idx) => {
                const monoStrategy = intent.monetizationPreference && intent.monetizationPreference !== 'none'
                    ? intent.monetizationPreference
                    : 'freemium';

                return {
                    id: crypto.randomUUID(),
                    label: `${module.replace('.lua', '')} Specialist`,
                    role: `${module.replace('.lua', '')} Specialist`,
                    goal: `Implement high-quality Luau code for ${module}`,
                    demographicAnchor: {
                        percentageOfPop: 100 / template.luauModules.length,
                        ageRange: [18, 35] as [number, number],
                        incomeBracket: 'middle',
                        geography: 'global',
                        educationLevel: 'technical',
                    },
                    stanceProbabilityDistribution: {
                        'build_fast': 0.6,
                        'optimize_quality': 0.3,
                        'review_safety': 0.1,
                    },
                    coreValues: ['Code quality', 'Performance', 'Player experience'],
                    primaryMotivations: ['Create engaging gameplay', 'Efficient asset generation'],
                    primaryFears: ['Buggy code', 'Security vulnerabilities', 'Poor performance'],
                    informationDiet: ['Roblox API docs', 'Luau best practices', 'Game design patterns'],
                    behavioralHeuristics: [
                        'Always validate input parameters',
                        'Use DataStores for persistence',
                        'Implement error handling',
                        'Optimize for mobile devices',
                    ],
                    influenceWeight: 5,
                    archetypeVariations: ['Tool_Maximalist', 'Memetic_Engineer'] as const,
                    economicBehavior: {
                        monetizationStrategy: monoStrategy as any,
                        riskTolerance: 0.3,
                        priceSensitivity: 0.5,
                    },
                };
            });

            const contractDraft = {
                contractMetadata: {
                    contractId: crypto.randomUUID(),
                    version: '1.0',
                    openModelContractRef: 'https://github.com/Metatronsdoob369/open-model-contracts',
                    domicile: 'State of Delaware, USA',
                    signedBy: 'NLToContractTranslator',
                    effectiveDate: timestamp,
                    gate: gate as 'SAFE' | 'ARMED',
                },
                config: {
                    version: '1.0',
                    swarmName,
                    description: `Generate ${template.name} game assets from NL prompt: "${nlPrompt.substring(0, 100)}..."`,
                    agents: assetAgents,
                    interpopulationDynamics: [],
                    platformEconomics: {
                        platformFeePercentage: 0.70,
                        developerRevenueShare: 0.30,
                        payoutConversionRate: 0.0038,
                        currencyName: 'Robux',
                        fiatCurrency: 'USD',
                        minPayoutThreshold: 30000,
                    },
                },
                contractInput: {
                    swarmName,
                    runId,
                    roundNumber: 1,
                    gate,
                    owner: gate === 'ARMED' ? 'system' : undefined,
                    expiry: gate === 'ARMED' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                    scope: gate === 'ARMED' ? 'asset-generation-pipeline' : undefined,
                    reversible: true,
                    simulationSettings: {
                        initialAgentCount: assetAgents.length,
                        maxRoundsPerRun: 3,
                        simulatedTimeAcceleration: '5x',
                        computeAssumption: 'finite' as const,
                        shockInjectionProbability: 0.1,
                        humanReviewQueue: true,
                    },
                },
                admission: [
                    {
                        physics: 'ROBLOX_LUAU' as const,
                        affordances: template.luauModules,
                        inspectability: true,
                        reversibilityDeclaration: true,
                    },
                    {
                        physics: 'MCP' as const,
                        affordances: ['contract-validation', 'audit-logging', 'telegram-notification'],
                        inspectability: true,
                        reversibilityDeclaration: true,
                    },
                ],
            };

            const validationResult = PopSimFullContractSchema.safeParse(contractDraft);

            if (!validationResult.success) {
                return {
                    success: false,
                    confidenceScore: 0.3,
                    requiresHumanReview: true,
                    flaggedConcerns: ['Contract schema validation failed', ...validationResult.error.errors.map(e => e.message)],
                    nextSteps: ['Review contract structure', 'Fix schema violations'],
                };
            }

            return {
                success: true,
                contract: validationResult.data,
                templateUsed: template,
                confidenceScore: 0.85,
                requiresHumanReview: gate === 'ARMED',
                flaggedConcerns: gate === 'ARMED' ? ['ARMED gate requires human approval before execution'] : [],
                nextSteps: [
                    gate === 'ARMED'
                        ? 'Submit to Telegram for human approval'
                        : 'Execute asset generation swarm',
                    'Monitor Luau module generation progress',
                    'Validate generated assets against contract specifications',
                    'Deploy to Roblox Studio via API or manual import',
                ],
            };
        } catch (error) {
            return {
                success: false,
                confidenceScore: 0,
                requiresHumanReview: true,
                flaggedConcerns: [`Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
                nextSteps: ['Retry with simplified prompt', 'Contact support'],
            };
        }
    }
}

export const translator = new NLToContractTranslator();
