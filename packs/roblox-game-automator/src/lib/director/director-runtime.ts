/**
 * director-runtime.ts — Director-01 Runtime
 * OMC Phase 1: Intelligence
 *
 * Takes a raw prompt → calls LLM as director-01 → produces validated DirectorOutput (SwarmBrief)
 * → dispatches each SpecialistBrief to the appropriate specialist for Luau generation.
 *
 * Governed by:  packs/roblox-game-automator/policies/phase1.director.policy.yaml
 * Schema law:   src/domains/roblox/director-contract.ts
 * Specialist definitions: specialists/architect-01.json | sonic-01.json | system-01.json
 *
 * Provider: OpenAI SDK (gpt-4o default).
 * To swap to Anthropic: install @anthropic-ai/sdk, replace OpenAI client init + call below.
 */

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  DirectorInputSchema,
  DirectorOutputSchema,
  type DirectorInput,
  type DirectorOutput,
  type SpecialistBrief,
} from '../../domains/roblox/director-contract.js';

// ---------------------------------------------------------------------------
// Specialist catalog
// ---------------------------------------------------------------------------

interface SpecialistDef {
  specialist_id: string;
  role: string;
  philosophy: string;
  capabilities: string[];
  rag_sources: string[];
  memory_hub: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve from compiled dist/ or direct tsx run
const SPECIALISTS_DIR = resolve(__dirname, '../../../specialists');

function loadSpecialists(): SpecialistDef[] {
  return ['architect-01', 'sonic-01', 'system-01'].map(id => {
    const raw = readFileSync(resolve(SPECIALISTS_DIR, `${id}.json`), 'utf-8');
    return JSON.parse(raw) as SpecialistDef;
  });
}

// ---------------------------------------------------------------------------
// Director system prompt
// ---------------------------------------------------------------------------

function buildDirectorSystemPrompt(specialists: SpecialistDef[]): string {
  const catalog = specialists
    .map(
      s =>
        `• ${s.specialist_id} | ${s.role}\n  Philosophy: ${s.philosophy}\n  Capabilities: ${s.capabilities.join(', ')}`
    )
    .join('\n\n');

  return `You are director-01 — Swarm Director for the roblox-game-automator OMC pack.

ROLE (from phase1.director.policy.yaml):
- Parse human intent into a structured SwarmBrief using semantic reasoning, NOT keyword matching
- Select which specialists to activate based on what the game actually needs
- Write a specific, actionable brief for each activated specialist
- Recommend SAFE or ARMED gate based on operation reversibility
- NEVER write Luau — that is specialist work

AVAILABLE SPECIALISTS:
${catalog}

LAYER RULES (at least one specialist per active layer):
- structure  → architect-01  (level geometry, buildings, world layout)
- atmosphere → sonic-01      (audio, ambient mood, sound design)
- mechanics  → system-01     (player interaction, physics, game logic)

ROLE BOUNDARIES (absolute — violations produce broken games):
- architect-01 owns ALL geometry: buildings, terrain, lighting, SpawnLocation
- sonic-01 owns ALL audio: sounds, ambience, music
- system-01 owns ALL mechanics: player movement, tags, dashes, scoring
- No specialist may generate outside their domain

DEPENDENCY RULES (mandatory — violations will be rejected):
- sonic-01 MUST list "architect-01" in dependencies (audio needs geometry to exist)
- system-01 MUST list "architect-01" in dependencies (player mechanics need a world to run in)
- architect-01 has NO dependencies — it always runs first
- dependencies must be specialist IDs, not module names

BRIEF REQUIREMENTS:
- Each brief MUST reference genre, mood, or key mechanics from parsedIntent
- Each brief MUST be at least 20 characters
- estimatedModules MUST contain EXACTLY ONE filename — one specialist, one module, no splitting
- colorPalette MUST be populated when genre or mood implies a visual style
- ARMED gate ONLY for irreversible operations (platform.apply_changes, live publish)

Return ONLY a valid JSON object. No markdown. No explanation. Exact schema:
{
  "directiveId": "<uuid v4>",
  "parsedIntent": {
    "genre": "<string>",
    "subGenre": "<string or omit>",
    "scale": "small|medium|large|extreme",
    "mood": "<string>",
    "keyMechanics": ["<mechanic>"],
    "estimatedComplexity": "low|medium|high|extreme",
    "thoughtProcess": ["The Thought Bridge: Semantic Layer 1", "Semantic Layer 2"],
    "colorPalette": { "primary": "<hex>", "secondary": "<hex>", "accent": "<hex>" }
  },
  "gate": "SAFE|ARMED",
  "gateReason": "<why>",
  "activatedSpecialists": ["<specialist_id>"],
  "swarmBriefs": [{
    "specialistId": "<id>",
    "brief": "<specific brief referencing intent — 20+ chars>",
    "priority": <1-10>,
    "dependencies": ["<specialist_id>"],
    "estimatedModules": ["ModuleName.lua"]
  }],
  "suggestedPrimer": {
    "levelName": "<string>",
    "theme": { "genre": "<string>", "primaryColor": [r,g,b], "material": "<string>" },
    "atmosphere": { "clockTime": <0-24>, "bloomIntensity": <float>, "fogEnd": <float> },
    "mechanics": { "dashEnabled": <bool>, "doubleJumpEnabled": <bool>, "tagGameActive": <bool> }
  },
  "readyForPhase1": true,
  "humanReviewRequired": false,
  "warnings": []
}`;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DirectorRuntimeOptions {
  model?: string;
  apiKey?: string;
}

export interface SpecialistDispatchResult {
  specialistId: string;
  role: string;
  brief: string;
  generatedModules: Record<string, string>; // moduleName → luau code
  error?: string;
}

// ---------------------------------------------------------------------------
// DirectorRuntime
// ---------------------------------------------------------------------------

export class DirectorRuntime {
  private client: OpenAI;
  private specialists: SpecialistDef[];
  private model: string;

  constructor(options: DirectorRuntimeOptions = {}) {
    this.model = options.model ?? 'gpt-4o';
    this.client = new OpenAI({
      apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
    });
    this.specialists = loadSpecialists();
  }

  /**
   * Phase 1 — Intelligence
   *
   * Calls director-01 (LLM) with the raw prompt.
   * Validates the output against DirectorOutputSchema.
   * Returns a fully typed DirectorOutput ready for dispatch.
   */
  async direct(rawInput: DirectorInput): Promise<DirectorOutput> {
    const inputResult = DirectorInputSchema.safeParse(rawInput);
    if (!inputResult.success) {
      throw new Error(`Invalid DirectorInput: ${inputResult.error.message}`);
    }
    const input = inputResult.data;

    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        { role: 'system', content: buildDirectorSystemPrompt(this.specialists) },
        {
          role: 'user',
          content: `Game description: "${input.prompt}"\nGate preference: ${input.options?.gate ?? 'SAFE'}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`director-01 returned malformed JSON. Preview: ${raw.slice(0, 300)}`);
    }

    // LLMs sometimes skip UUID generation — inject if missing
    if (typeof parsed === 'object' && parsed !== null && !('directiveId' in parsed)) {
      (parsed as Record<string, unknown>).directiveId = crypto.randomUUID();
    }

    const outputResult = DirectorOutputSchema.safeParse(parsed);
    if (!outputResult.success) {
      throw new Error(
        `DirectorOutput failed OMC schema validation:\n${JSON.stringify(outputResult.error.errors, null, 2)}\n\nRaw output:\n${raw.slice(0, 500)}`
      );
    }

    if (!outputResult.data.readyForPhase1) {
      throw new Error(
        `director-01 is not satisfied — readyForPhase1 is false. Warnings: ${outputResult.data.warnings.join('; ')}`
      );
    }

    return outputResult.data;
  }

  /**
   * Dispatch swarm briefs to specialists in dependency order.
   *
   * Each specialist receives its brief + full parsedIntent context.
   * Returns generated Luau module code per specialist.
   */
  async dispatch(directorOutput: DirectorOutput): Promise<SpecialistDispatchResult[]> {
    const results: SpecialistDispatchResult[] = [];
    const briefs = this.topologicalSort(directorOutput.swarmBriefs);

    for (const brief of briefs) {
      const specialist = this.specialists.find(s => s.specialist_id === brief.specialistId);
      if (!specialist) {
        results.push({
          specialistId: brief.specialistId,
          role: 'unknown',
          brief: brief.brief,
          generatedModules: {},
          error: `Specialist "${brief.specialistId}" not found in catalog`,
        });
        continue;
      }

      try {
        const modules = await this.runSpecialist(specialist, brief, directorOutput);
        results.push({
          specialistId: specialist.specialist_id,
          role: specialist.role,
          brief: brief.brief,
          generatedModules: modules,
        });
      } catch (err) {
        results.push({
          specialistId: specialist.specialist_id,
          role: specialist.role,
          brief: brief.brief,
          generatedModules: {},
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Private — specialist execution
  // ---------------------------------------------------------------------------

  private async runSpecialist(
    specialist: SpecialistDef,
    brief: SpecialistBrief,
    ctx: DirectorOutput
  ): Promise<Record<string, string>> {
    const intent = ctx.parsedIntent;

    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `You are ${specialist.specialist_id} — ${specialist.role}.
Philosophy: ${specialist.philosophy}
Active capabilities: ${specialist.capabilities.join(', ')}

The director has briefed you. Generate production-quality Luau ModuleScript code for each module listed.
Respond with a JSON object in this exact shape: { "modules": { "ModuleName.lua": "<raw luau code>" } }
No markdown. No backticks inside the lua values. Valid Luau only.

CRITICAL RULES — any violation silently breaks the game:
- NEVER use require() — modules run via loadstring() with no script.Parent. Fully self-contained only.
- NEVER use fake or placeholder asset IDs (rbxassetid://123456789 etc). For sounds, use SoundId = "" with Volume/PlaybackSpeed/Looped set directly.
- NEVER reference a function before it is defined. Define ALL local functions BEFORE calling or connecting them.
- Server modules MUST NOT use UserInputService, LocalPlayer, or any client-only API. Use Players:GetPlayers(), Players.PlayerAdded, RemoteEvents only.
- All geometry (Parts, Models) MUST be parented to game:GetService("Workspace") inside Initialize(). Never return geometry — parent it directly.
- All Sounds MUST be parented to a Part in Workspace or to game:GetService("SoundService").
- ALL modules MUST return { Initialize = Initialize } at the end. NEVER auto-call Initialize() at module level — the Loader calls it.
- Initialize() side-effects only — caller discards return value.
- Never use wait() — use task.wait().
- All Parts must have Anchored = true unless physics-driven.

IF YOU ARE architect-01:
- You MUST create a SpawnLocation (Instance.new("SpawnLocation")) at Vector3.new(0, 1, 0), Size = Vector3.new(6, 1, 6), Anchored = true, parented to Workspace. Without this the player cannot spawn.
- All building Position.Y MUST equal size.Y / 2. A building of height 100 must have Position.Y = 50. Never place a building at Y=0 — it will be half underground.
- Lighting.Ambient MUST be at least Color3.fromRGB(50, 40, 60). Add PointLights (Brightness = 5, Range = 30, neon purple or cyan Color) to every building.
- Generate buildings using nested for loops across a grid — NEVER hardcode position arrays. Minimum 5x5 grid (25 buildings) at 80-unit spacing with math.random height variation between 60 and 300. This creates a real city, not a handful of posts.
- Building Size and height MUST match. Use: local height = math.random(60, 300), then building.Size = Vector3.new(20, height, 20) and building.Position = Vector3.new(x, height/2, z). Never pass height as a separate argument while setting Size to a fixed Y value — the building will be invisible.

IF YOU ARE system-01:
- Generate ONLY player mechanics and game logic (movement, tags, dashes, scoring).
- NEVER generate buildings, terrain, or any geometry. That is exclusively architect-01's domain.

IF YOU ARE sonic-01:
- Generate ONLY audio (sounds, ambience, music).
- NEVER generate geometry or game logic.`,
        },
        {
          role: 'user',
          content: `DIRECTOR BRIEF: ${brief.brief}

GAME INTENT:
Genre: ${intent.genre}${intent.subGenre ? ` / ${intent.subGenre}` : ''}
Scale: ${intent.scale} | Mood: ${intent.mood} | Complexity: ${intent.estimatedComplexity}
Key mechanics: ${intent.keyMechanics.join(', ')}${
            intent.colorPalette
              ? `\nPalette: primary=${intent.colorPalette.primary ?? 'n/a'} secondary=${intent.colorPalette.secondary ?? 'n/a'} accent=${intent.colorPalette.accent ?? 'n/a'}`
              : ''
          }

MODULES TO GENERATE: ${brief.estimatedModules.join(', ')}`,
        },
      ],
    });

    try {
      const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as {
        modules?: Record<string, string>;
      };
      return parsed.modules ?? {};
    } catch {
      return {};
    }
  }

  // ---------------------------------------------------------------------------
  // Private — dependency-aware topological sort, priority as tiebreaker
  // ---------------------------------------------------------------------------

  private topologicalSort(briefs: SpecialistBrief[]): SpecialistBrief[] {
    const map = new Map(briefs.map(b => [b.specialistId, b]));
    const visited = new Set<string>();
    const sorted: SpecialistBrief[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);
      const brief = map.get(id);
      if (!brief) return;
      for (const dep of brief.dependencies) {
        visit(dep);
      }
      sorted.push(brief);
    };

    const byPriority = [...briefs].sort((a, b) => b.priority - a.priority);
    for (const brief of byPriority) {
      visit(brief.specialistId);
    }

    return sorted;
  }
}
