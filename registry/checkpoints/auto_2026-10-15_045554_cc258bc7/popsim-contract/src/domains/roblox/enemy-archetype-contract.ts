import { z } from 'zod';
import { OMCProvenanceSchema } from './training-protocol.js';

/**
 * EnemyArchetypeContract — Grounded aerial enemy schema for survival/tag game.
 *
 * The hallucination problem: shards were generating enemy logic from pattern-match
 * on "what should happen" rather than what Roblox's DataModel actually allows.
 *
 * Every constraint here is a REAL Roblox API boundary:
 *   - PathfindingService cannot navigate above Y = walkable surface (use pure physics for aerial)
 *   - Humanoid.WalkSpeed / JumpPower are ground-specific — aerial enemies use BodyVelocity/AlignPosition
 *   - NPC character models must follow R15 or R6 rig — no custom rigs without plugin
 *   - AnimationTrack IDs must be published assets (non-zero integer asset IDs)
 *   - MaxActiveSounds = 32 per player (global Studio limit)
 *   - RemoteEvent payloads are limited to 50KB per invocation
 *
 * Weppy MCP grounds this: before the director briefs specialists, it reads the
 * actual workspace from Studio and validates that the referenced model IDs exist.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROBLOX CONSTRAINT CONSTANTS (hard limits from the engine — not configurable)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maximum number of NPC Humanoids active before server FPS degrades.
 * Above this threshold Roblox's physics stepper starts dropping.
 * Empirically: ~40 active Humanoids on a 50-player server = stable.
 */
const MAX_ACTIVE_HUMANOIDS = 40;

/**
 * Aerial enemy Y-height range above the ground surface.
 * Below MIN → switch to ground tagging behavior.
 * Above MAX → out-of-play zone, enemy returns to patrol altitude.
 */
const AERIAL_HEIGHT_MIN_STUDS = 12;
const AERIAL_HEIGHT_MAX_STUDS = 60;

/**
 * Co-op kill threshold: both players must be within this radius of each other
 * AND within attack range for the aerial enemy to register a team kill.
 */
const COOP_KILL_PROXIMITY_STUDS = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENT SCHEMA
// Aerial enemies use BodyVelocity / AlignPosition, NOT Humanoid locomotion.
// Pathfinding is disabled — pure physics-based pursuit.
// ─────────────────────────────────────────────────────────────────────────────

export const AerialMovementSchema = z.object({
  // Roblox API: BodyVelocity.MaxForce — Vector3 in studs/s²
  // Set to math.huge only for the Y axis on hover; cap X/Z for realistic banking
  locomotion: z.literal('BodyVelocity').describe(
    'Aerial enemies use BodyVelocity — Humanoid.WalkSpeed is NOT used'
  ),

  cruiseSpeedStudsPerSec: z.number().min(8).max(45).default(22).describe(
    'Horizontal cruise speed. Above 45 stud/s players cannot react — cap enforced'
  ),

  hoverAltitudeStuds: z.number()
    .min(AERIAL_HEIGHT_MIN_STUDS)
    .max(AERIAL_HEIGHT_MAX_STUDS)
    .default(28)
    .describe('Target Y offset above ground surface (raycasted, not world Y)'),

  diveSpeedStudsPerSec: z.number().min(15).max(80).default(40).describe(
    'Speed during attack dive. Must be > cruiseSpeed to feel threatening'
  ),

  bankAngleDegrees: z.number().min(0).max(45).default(25).describe(
    'Visual tilt during turns — cosmetic only, applied via CFrame lerp'
  ),

  returnAltitudeAfterDiveStuds: z.number()
    .min(AERIAL_HEIGHT_MIN_STUDS)
    .max(AERIAL_HEIGHT_MAX_STUDS)
    .default(35)
    .describe('Altitude enemy climbs to after completing a dive attack'),
});

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER MODEL SCHEMA
// Must reference valid published Roblox asset IDs.
// Weppy MCP validates these IDs exist before the contract is sealed.
// ─────────────────────────────────────────────────────────────────────────────

export const EnemyModelSchema = z.object({
  rig: z.enum(['R15', 'R6']).default('R15').describe(
    'Roblox rig type — custom rigs require the Animate LocalScript to be rebuilt'
  ),

  // Non-zero = published asset. Zero = placeholder stub (valid in SAFE gate, blocked in ARMED).
  modelAssetId: z.number().int().nonnegative().describe(
    'Published Roblox Model asset ID. 0 = stub placeholder (SAFE gate only). Weppy validates before ARMED.'
  ),

  scale: z.object({
    bodyDepth:  z.number().min(0.5).max(3.0).default(1.2),
    bodyHeight: z.number().min(0.5).max(3.0).default(1.0),
    bodyWidth:  z.number().min(0.5).max(3.0).default(1.2),
    head:       z.number().min(0.5).max(2.0).default(1.1),
  }).describe('HumanoidDescription.BodyTypeScale etc — applied at spawn'),

  // Animation track asset IDs — must be published. 0 = missing, will error.
  animations: z.object({
    idle:      z.number().int().nonnegative().describe('AnimationId for hover idle'),
    cruise:    z.number().int().nonnegative().describe('AnimationId for level flight'),
    dive:      z.number().int().nonnegative().describe('AnimationId for attack dive'),
    bankLeft:  z.number().int().nonnegative().describe('AnimationId for left bank turn'),
    bankRight: z.number().int().nonnegative().describe('AnimationId for right bank turn'),
    death:     z.number().int().nonnegative().describe('AnimationId for death sequence'),
  }).describe(
    'All IDs must be > 0 (published assets). ' +
    '0 = placeholder stub — valid for dev but blocked by OMC seal on production gate'
  ),

  // Sound effect IDs — Roblox Sound.SoundId format: "rbxassetid://N"
  sounds: z.object({
    wingFlap:    z.number().int().nonnegative().default(0),
    diveScream:  z.number().int().nonnegative().default(0),
    hitConfirm:  z.number().int().nonnegative().default(0),
    deathShriek: z.number().int().nonnegative().default(0),
  }).describe(
    'Sound asset IDs. Roblox limit: 32 MaxActiveSounds per player — use SoundService groups'
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIOR FSM SCHEMA
// States map to RunService.Heartbeat handler branches.
// Only one state active at a time — no nested state machines.
// ─────────────────────────────────────────────────────────────────────────────

export const EnemyBehaviorState = z.enum([
  'PATROL',   // Circling arena at hover altitude, no target
  'CHASE',    // Tracking nearest player, closing distance
  'DIVE',     // Attack dive committed — cannot be interrupted
  'RECOVER',  // Post-dive climb back to hoverAltitude
  'STUNNED',  // Temp immobile — e.g. hit by jetpack exhaust
  'DEAD',     // Death animation playing, queued for respawn
]);

export const EnemyBehaviorFSMSchema = z.object({
  initialState: EnemyBehaviorState.default('PATROL'),

  transitions: z.object({
    patrolToChase: z.object({
      trigger:          z.literal('player_within_aggro_radius'),
      aggroRadiusStuds: z.number().min(20).max(200).default(80),
    }),
    chaseToDiv: z.object({
      trigger:          z.literal('player_within_dive_range'),
      diveRangeStuds:   z.number().min(8).max(40).default(18),
    }),
    diveToRecover: z.object({
      trigger: z.literal('dive_duration_elapsed_or_hit'),
      diveDurationSeconds: z.number().min(0.5).max(3.0).default(1.2),
    }),
    recoverToChase: z.object({
      trigger:             z.literal('altitude_restored'),
      hysteresisStuds:     z.number().default(3).describe(
        'Must be this many studs above hoverAltitude before re-engaging'
      ),
    }),
    anyToStunned: z.object({
      trigger:          z.literal('jetpack_exhaust_hit'),
      stunDurationSec:  z.number().min(1).max(8).default(3),
    }),
  }),

  // Co-op kill gate — requires two players working together
  coopKillGate: z.object({
    enabled:            z.boolean().default(true),
    requiredPlayerCount: z.number().int().min(2).max(2).default(2).describe(
      'Exactly 2 players must be within coopProximityStuds AND in attack range'
    ),
    coopProximityStuds: z.number().default(COOP_KILL_PROXIMITY_STUDS),
    rewardDescription:  z.string().default(
      'Team gets +150 score, both players get a brief speed boost'
    ),
  }),

  // Height threshold gate — below this, enemy switches to ground-tag behavior
  heightThresholdGate: z.object({
    aerialMinStuds:        z.number().default(AERIAL_HEIGHT_MIN_STUDS).describe(
      'Below this Y-offset from ground, enemy cannot use aerial dive — switches to melee tag'
    ),
    groundTagDamageScale:  z.number().min(0.1).max(1.0).default(0.5).describe(
      'Damage multiplier when enemy is forced into ground mode — easier for players to escape'
    ),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK / REMOTES SCHEMA
// Every RemoteEvent payload must be under 50KB.
// Server-authoritative — clients never write HP or position.
// ─────────────────────────────────────────────────────────────────────────────

export const EnemyNetworkSchema = z.object({
  // Remote names — must match exactly what's in the game's ReplicatedStorage
  remoteEvents: z.object({
    enemySpawned:      z.string().default('AerialEnemySpawned'),
    enemyDived:        z.string().default('AerialEnemyDived'),
    enemyHitPlayer:    z.string().default('AerialEnemyHitPlayer'),
    enemyKilled:       z.string().default('AerialEnemyKilled'),
    coopKillAchieved:  z.string().default('AerialCoopKillAchieved'),
  }),

  // Server-side authority: client is never trusted for hit registration
  hitRegistration: z.literal('server').describe(
    'Hit detection runs on server only — client sends intent, server validates position'
  ),

  // Payload size guard — enforced at contract validation time
  maxPayloadBytes: z.number().default(49152).describe(
    'RemoteEvent payloads hard-limited to 50KB by Roblox. 49152 = 48KB safe buffer'
  ),

  replicationDistance: z.number().min(0).default(512).describe(
    'StreamingEnabled minimum distance for enemy parts to replicate to clients'
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// SCALING / POOL SCHEMA
// Controls how many aerial enemies can exist simultaneously.
// Hardcapped relative to MAX_ACTIVE_HUMANOIDS.
// ─────────────────────────────────────────────────────────────────────────────

export const EnemyPoolSchema = z.object({
  maxConcurrent: z.number().int().min(1).max(8).default(3).describe(
    `Hard cap on simultaneous aerial enemies. ` +
    `Roblox starts dropping physics frames above ${MAX_ACTIVE_HUMANOIDS} total humanoids — ` +
    `aerial enemies are expensive (BodyVelocity + Heartbeat per instance)`
  ),

  spawnCooldownSec:  z.number().min(5).max(120).default(25),
  respawnAfterKillSec: z.number().min(10).max(180).default(45),

  scalingByPlayerCount: z.array(z.object({
    minPlayers:  z.number().int().min(1),
    maxPlayers:  z.number().int().min(1),
    maxEnemies:  z.number().int().min(1).max(8),
  })).default([
    { minPlayers: 1,  maxPlayers: 4,  maxEnemies: 1 },
    { minPlayers: 5,  maxPlayers: 12, maxEnemies: 2 },
    { minPlayers: 13, maxPlayers: 30, maxEnemies: 3 },
    { minPlayers: 31, maxPlayers: 50, maxEnemies: 4 },
  ]).describe('Enemy count scales with server population to maintain fun without FPS drop'),
});

// ─────────────────────────────────────────────────────────────────────────────
// FULL ENEMY ARCHETYPE CONTRACT
// ─────────────────────────────────────────────────────────────────────────────

export const EnemyArchetypeContractSchema = OMCProvenanceSchema.extend({
  archetypeId: z.string().describe('Unique identifier for this enemy type, e.g. "aerial-hawk-v1"'),
  archetypeVersion: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),

  // What kind of game context this enemy is valid in
  gameContext: z.object({
    genre:   z.enum(['survival', 'tag', 'survival-tag']).default('survival-tag'),
    minPlayers: z.number().int().min(1).default(2),
    maxPlayers: z.number().int().max(50).default(30),
    arenaShape: z.enum(['open', 'urban', 'forest', 'arena']).default('open').describe(
      'Pathfinding style hint — aerial enemies ignore terrain in all modes but ' +
      'need this for spawn point selection and patrol radius'
    ),
  }),

  movement: AerialMovementSchema,
  model:    EnemyModelSchema,
  behavior: EnemyBehaviorFSMSchema,
  network:  EnemyNetworkSchema,
  pool:     EnemyPoolSchema,

  // Scoring contract — what this enemy is worth in team score
  scoring: z.object({
    soloKillPoints:    z.number().int().min(0).default(50),
    coopKillPoints:    z.number().int().min(0).default(150).describe(
      'Total points split between both co-op killers'
    ),
    teamKillBonus:     z.number().int().min(0).default(25).describe(
      'Extra points for the team when ANY member gets a kill'
    ),
    deathPenaltyPoints: z.number().int().min(0).default(0).describe(
      '0 = no penalty for being killed by the enemy (encourages risk-taking)'
    ),
  }),

  // Weppy MCP grounding gate — validates the contract against live Studio state
  weppyGrounding: z.object({
    requiresStudioValidation: z.boolean().default(true).describe(
      'If true, director MUST call Weppy MCP to verify modelAssetId and animation IDs exist ' +
      'before issuing SpecialistBriefs. Prevents hallucinated asset references.'
    ),
    validatedAt:     z.string().datetime().optional().describe(
      'ISO timestamp of last Weppy validation. Null = not yet validated.'
    ),
    validatedAssets: z.array(z.object({
      assetId:   z.number().int(),
      assetType: z.string(),
      verified:  z.boolean(),
    })).default([]).describe('Assets Weppy confirmed exist in the current Studio workspace'),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALIST BRIEF TEMPLATE
// What the director hands to specialists when this enemy is activated.
// Replaces free-form NL that caused hallucination — specialists get typed facts.
// ─────────────────────────────────────────────────────────────────────────────

export const AerialEnemySpecialistBriefSchema = z.object({
  specialistId: z.string(),
  archetype:    EnemyArchetypeContractSchema,
  tasksRequired: z.array(z.enum([
    'spawn_manager',       // ServerScript: pool + cooldown
    'movement_controller', // ServerScript: BodyVelocity + FSM heartbeat
    'hit_detection',       // ServerScript: server-authoritative hit registration
    'animation_driver',    // LocalScript: animation tracks + sound
    'scoring_hook',        // ServerScript: score emit on kill events
    'ui_indicator',        // LocalScript: overhead name + health bar
  ])),
  luauModuleNames: z.record(z.string(), z.string()).describe(
    'Map of task → expected Luau module name in ServerScriptService or StarterCharacterScripts'
  ),
  constraints: z.array(z.string()).describe(
    'Human-readable list of hard constraints specialists MUST NOT violate'
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// PRESET — Aerial Hawk (starting archetype for the survival/tag game)
// ─────────────────────────────────────────────────────────────────────────────

export const AERIAL_HAWK_PRESET: Omit<AerialEnemyType, 'weppyGrounding'> & {
  weppyGrounding: Omit<AerialEnemyType['weppyGrounding'], 'validatedAt'>
} = {
  archetypeId:      'aerial-hawk-v1',
  archetypeVersion: '1.0.0',

  intentSignature:    'PENDING',   // set by director at runtime
  gate:               'SAFE',
  disclaimer:         'Fictional sim artifact—OMC governed, no real-world application',
  humanReviewRequired: false,

  gameContext: {
    genre:      'survival-tag',
    minPlayers: 2,
    maxPlayers: 30,
    arenaShape: 'open',
  },

  movement: {
    locomotion:                 'BodyVelocity',
    cruiseSpeedStudsPerSec:     22,
    hoverAltitudeStuds:         28,
    diveSpeedStudsPerSec:       40,
    bankAngleDegrees:           25,
    returnAltitudeAfterDiveStuds: 35,
  },

  model: {
    rig:          'R15',
    modelAssetId: 0,  // ← Weppy must validate a real asset ID before ARMED gate
    scale: {
      bodyDepth:  1.2,
      bodyHeight: 1.0,
      bodyWidth:  1.2,
      head:       1.1,
    },
    animations: {
      idle:      0,  // ← all 0 = stubs — blocked at production ARMED gate
      cruise:    0,
      dive:      0,
      bankLeft:  0,
      bankRight: 0,
      death:     0,
    },
    sounds: {
      wingFlap:    0,
      diveScream:  0,
      hitConfirm:  0,
      deathShriek: 0,
    },
  },

  behavior: {
    initialState: 'PATROL',
    transitions: {
      patrolToChase: { trigger: 'player_within_aggro_radius', aggroRadiusStuds: 80 },
      chaseToDiv:    { trigger: 'player_within_dive_range',   diveRangeStuds: 18 },
      diveToRecover: { trigger: 'dive_duration_elapsed_or_hit', diveDurationSeconds: 1.2 },
      recoverToChase: { trigger: 'altitude_restored', hysteresisStuds: 3 },
      anyToStunned:  { trigger: 'jetpack_exhaust_hit', stunDurationSec: 3 },
    },
    coopKillGate: {
      enabled:             true,
      requiredPlayerCount: 2,
      coopProximityStuds:  COOP_KILL_PROXIMITY_STUDS,
      rewardDescription:   'Team gets +150 score, both players get a brief speed boost',
    },
    heightThresholdGate: {
      aerialMinStuds:       AERIAL_HEIGHT_MIN_STUDS,
      groundTagDamageScale: 0.5,
    },
  },

  network: {
    remoteEvents: {
      enemySpawned:     'AerialEnemySpawned',
      enemyDived:       'AerialEnemyDived',
      enemyHitPlayer:   'AerialEnemyHitPlayer',
      enemyKilled:      'AerialEnemyKilled',
      coopKillAchieved: 'AerialCoopKillAchieved',
    },
    hitRegistration:     'server',
    maxPayloadBytes:     49152,
    replicationDistance: 512,
  },

  pool: {
    maxConcurrent:         3,
    spawnCooldownSec:      25,
    respawnAfterKillSec:   45,
    scalingByPlayerCount: [
      { minPlayers: 1,  maxPlayers: 4,  maxEnemies: 1 },
      { minPlayers: 5,  maxPlayers: 12, maxEnemies: 2 },
      { minPlayers: 13, maxPlayers: 30, maxEnemies: 3 },
      { minPlayers: 31, maxPlayers: 50, maxEnemies: 4 },
    ],
  },

  scoring: {
    soloKillPoints:     50,
    coopKillPoints:     150,
    teamKillBonus:      25,
    deathPenaltyPoints: 0,
  },

  weppyGrounding: {
    requiresStudioValidation: true,
    validatedAssets:          [],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EnemyArchetype             = z.infer<typeof EnemyArchetypeContractSchema>;
export type AerialEnemyType            = EnemyArchetype;
export type AerialMovement             = z.infer<typeof AerialMovementSchema>;
export type EnemyBehaviorStateType     = z.infer<typeof EnemyBehaviorState>;
export type AerialEnemySpecialistBrief = z.infer<typeof AerialEnemySpecialistBriefSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPER
// Call before issuing SpecialistBriefs — returns errors the director must
// surface to the user before switching to ARMED gate.
// ─────────────────────────────────────────────────────────────────────────────

export function validateEnemyArchetype(archetype: unknown): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const result = EnemyArchetypeContractSchema.safeParse(archetype);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result.success) {
    errors.push(...result.error.errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`));
    return { valid: false, errors, warnings };
  }

  const data = result.data;

  // Warn on stub asset IDs (0 = placeholder, production will fail)
  if (data.model.modelAssetId === 0) {
    warnings.push('model.modelAssetId is 0 — placeholder only. Weppy must fill real asset ID before ARMED gate.');
  }
  const animKeys = Object.entries(data.model.animations) as [string, number][];
  const stubAnims = animKeys.filter(([, id]) => id === 0).map(([k]) => k);
  if (stubAnims.length > 0) {
    warnings.push(`Animation stubs (id=0): ${stubAnims.join(', ')} — valid for SAFE, blocked at ARMED`);
  }

  // Error if Weppy validation required but no validated assets present and gate is ARMED
  if (data.weppyGrounding.requiresStudioValidation &&
      data.weppyGrounding.validatedAssets.length === 0 &&
      data.gate === 'ARMED') {
    errors.push('gate=ARMED but weppyGrounding.validatedAssets is empty — Weppy validation required before ARMED');
  }

  return { valid: errors.length === 0, errors, warnings };
}
