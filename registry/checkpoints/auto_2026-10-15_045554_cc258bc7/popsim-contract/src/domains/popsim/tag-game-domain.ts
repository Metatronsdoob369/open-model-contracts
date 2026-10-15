import { z } from 'zod';
import { GateSchema, AuditEventSchema } from '../../core/core-schemas';

/**
 * TAG GAME DOMAIN — Governance for The Tag Game.
 * This defines the authoritative state for player tagging, rounds, and "Rowdy" chaos triggers.
 */

export const TagGameStateSchema = z.object({
  itPlayerId: z.number().nullable().describe("UserId of the current IT player"),
  roundStartTime: z.string().datetime().nullable(),
  roundDuration: z.number().default(60),
  isRowdyActive: z.boolean().default(false),
  tagCount: z.record(z.string(), z.number()).describe("Map of PlayerUserId to TagCount"),
});

export const TagGameActionSchema = z.enum([
  'START_ROUND',
  'END_ROUND',
  'ASSIGN_IT',
  'TRIGGER_ROWDY',
  'REGISTER_TAG',
]);

export const TagGameContractInputSchema = z.object({
  action: TagGameActionSchema,
  payload: z.object({
    playerId: z.number().optional(),
    taggerId: z.number().optional(),
    duration: z.number().optional(),
    gate: GateSchema,
  }),
  timestamp: z.string().datetime(),
});

export const TagGameContractOutputSchema = z.object({
  status: z.enum(['success', 'denied', 'error']),
  newState: TagGameStateSchema.optional(),
  auditTrail: z.array(AuditEventSchema),
  message: z.string().optional(),
});

export type TagGameState = z.infer<typeof TagGameStateSchema>;
export type TagGameContractInput = z.infer<typeof TagGameContractInputSchema>;
export type TagGameContractOutput = z.infer<typeof TagGameContractOutputSchema>;
