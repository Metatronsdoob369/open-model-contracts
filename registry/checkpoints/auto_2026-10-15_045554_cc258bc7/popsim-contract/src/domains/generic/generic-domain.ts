import { z } from 'zod';
import { GateSchema, AuditEventSchema } from '../../core/core-schemas';

/**
 * GENERIC DOMAIN — A lightweight boilerplate for any Roblox game.
 * Use this as a starting point for non-simulation projects.
 */

export const GenericGameInputSchema = z.object({
  gameId: z.string(),
  sessionId: z.string().uuid(),
  gate: GateSchema,
  owner: z.string().optional(),
  action: z.string(),
  payload: z.record(z.string(), z.unknown()),
  reversible: z.boolean().default(true),
});

export const GenericGameOutputSchema = z.object({
  success: z.boolean(),
  decision: z.string(),
  auditTrail: z.array(AuditEventSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
