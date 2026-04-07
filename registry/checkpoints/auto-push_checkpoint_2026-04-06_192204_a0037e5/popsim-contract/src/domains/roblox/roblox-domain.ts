import { z } from 'zod';

/**
 * Roblox Domain: Dual-Render UI with Telegram Backend
 * Governs Luau scripts, asset publishes, HTTP bridges to Telegram Mini Apps.
 * OMC-agnostic: Same backend (BullMQ/postgres) for Roblox + Telegram outputs.
 * Integrates GSI for truth-checked sims (e.g., racing → virtual economy swaps).
 */

export const RobloxAssetContractSchema = z.object({
  assetType: z.enum(['Script', 'Model', 'Image', 'Audio', 'MeshPart']),
  assetId: z.string().describe("Roblox asset ID or name"),
  description: z.string().min(10).max(200),
  permissions: z.enum(['Public', 'Private', 'Friends', 'Group']),
  tags: z.array(z.string()).min(1).max(10),
});

export const LuauScriptContractSchema = z.object({
  scriptType: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']),
  code: z.string().describe("Luau code snippet or full script"),
  httpEndpoints: z.array(z.string().url()).optional().describe("HTTPService calls to backend/Telegram"),
  eventHandlers: z.array(z.string()).optional().describe("RemoteEvents for cross-platform sync"),
  validationRules: z.object({
    gsiThreshold: z.number().default(0.95),
    omcSealRequired: z.boolean().default(true),
  }),
});

export const TelegramMiniAppContractSchema = z.object({
  webAppUrl: z.string().url().describe("Telegram WebView URL for Mini App"),
  uiComponents: z.array(z.enum(['Button', 'Canvas', 'Iframe', 'MirrorRender'])),
  syncEvents: z.array(z.string()).describe("Events synced from Roblox (e.g., sim-update)"),
  omcSeal: z.string().describe("Audit ID from backend validation"),
});

export const TagGameContractSchema = z.object({
  remotes: z.object({
    playerTagged: z.string().default("PlayerTagged"),
    itPlayerUpdated: z.string().default("ItPlayerUpdated"),
    roundStarted: z.string().default("RoundStarted"),
    roundEnded: z.string().default("RoundEnded"),
  }),
  visuals: z.object({
    highlightColor: z.string().default("#FF0000"),
    itLabel: z.string().default("🔥 IT 🔥"),
    rowdyChaosLevel: z.number().min(0).max(10).default(5),
  }),
});

export const RobloxDomainSchema = z.object({
  asset: RobloxAssetContractSchema,
  script: LuauScriptContractSchema.optional(),
  telegramApp: TelegramMiniAppContractSchema.optional(),
  tagGame: TagGameContractSchema.optional(),
  backendSync: z.object({
    bullQueue: z.string().default("roblox-telegram-sync"),
    omcBridgeUrl: z.string().url().default("http://localhost:8080/v1/contract/validate"),
    domainAgnostic: z.boolean().default(true).describe("Shared backend for dual-render"),
  }),
  stateTracking: z.object({
    workflowId: z.string(),
    robloxExperienceId: z.string().optional(),
    telegramChatId: z.string().optional(),
    gsiScore: z.number().min(0).max(1),
  }),
  enforceGsiGroundTruth: z.boolean().default(true),
});

// Export type for integration
export type RobloxDomain = z.infer<typeof RobloxDomainSchema>;
