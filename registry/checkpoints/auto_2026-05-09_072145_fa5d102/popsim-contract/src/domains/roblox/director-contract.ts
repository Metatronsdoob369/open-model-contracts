import { z } from 'zod';

// ---------------------------------------------------------------------------
// Director Contract — director-01
// The swarm director receives a raw prompt and produces a structured brief
// for each activated specialist. This replaces keyword-based NL parsing.
// ---------------------------------------------------------------------------

// What comes in from the plugin / Telegram
export const DirectorInputSchema = z.object({
  prompt: z.string().min(10, 'Prompt too short to parse intent'),
  options: z.object({
    gate: z.enum(['SAFE', 'ARMED']).default('SAFE'),
    provider: z.enum(['openai', 'anthropic', 'dolphin', 'huggingface']).default('anthropic'),
    model: z.string().default('claude-sonnet-4-6'),
  }).default({}),
  partialPrimer: z.record(z.unknown()).optional(), // user-supplied partial contract fields
});

// Parsed game intent — what the director extracts from the prompt
export const ParsedIntentSchema = z.object({
  genre: z.string(),
  subGenre: z.string().optional(),
  scale: z.enum(['small', 'medium', 'large', 'extreme']),
  mood: z.string(),
  keyMechanics: z.array(z.string()),
  estimatedComplexity: z.enum(['low', 'medium', 'high', 'extreme']),
  colorPalette: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
});

// A brief issued to one specialist
export const SpecialistBriefSchema = z.object({
  specialistId: z.string(),
  brief: z.string().min(20, 'Brief must give the specialist enough to act on'),
  priority: z.number().int().min(1).max(10),
  dependencies: z.array(z.string()).default([]), // specialist IDs that must complete first
  estimatedModules: z.array(z.string()),         // expected Luau module outputs
});

// Suggested primer — pre-filled contract fields the user can accept or override
export const SuggestedPrimerSchema = z.object({
  levelName: z.string().optional(),
  theme: z.object({
    genre: z.string().optional(),
    primaryColor: z.tuple([z.number(), z.number(), z.number()]).optional(),
    secondaryColor: z.tuple([z.number(), z.number(), z.number()]).optional(),
    accentColor: z.tuple([z.number(), z.number(), z.number()]).optional(),
    material: z.string().optional(),
    transparency: z.number().min(0).max(1).optional(),
  }).optional(),
  atmosphere: z.object({
    clockTime: z.number().min(0).max(24).optional(),
    bloomIntensity: z.number().optional(),
    fogEnd: z.number().optional(),
  }).optional(),
  mechanics: z.object({
    dashEnabled: z.boolean().optional(),
    doubleJumpEnabled: z.boolean().optional(),
    tagGameActive: z.boolean().optional(),
    trafficDensity: z.number().optional(),
  }).optional(),
  manifest: z.object({
    skyscrapers: z.number().optional(),
    streetGridSize: z.number().optional(),
  }).optional(),
});

// What the director returns — the full swarm brief
export const DirectorOutputSchema = z.object({
  directiveId: z.string().uuid(),
  parsedIntent: ParsedIntentSchema,
  gate: z.enum(['SAFE', 'ARMED']),
  gateReason: z.string(),
  activatedSpecialists: z.array(z.string()),
  swarmBriefs: z.array(SpecialistBriefSchema),
  suggestedPrimer: SuggestedPrimerSchema,
  readyForPhase1: z.boolean(), // true = director is satisfied, swarm can proceed
  humanReviewRequired: z.boolean(),
  warnings: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DirectorInput = z.infer<typeof DirectorInputSchema>;
export type ParsedIntent = z.infer<typeof ParsedIntentSchema>;
export type SpecialistBrief = z.infer<typeof SpecialistBriefSchema>;
export type SuggestedPrimer = z.infer<typeof SuggestedPrimerSchema>;
export type DirectorOutput = z.infer<typeof DirectorOutputSchema>;
