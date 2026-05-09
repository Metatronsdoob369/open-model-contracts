import { z } from 'zod';

/**
 * 🐝 Swarm Domain Schema
 * Governs Agentic Coordination (Baas, NocoBot, Telegram)
 */
export const SwarmDomainSchema = z.object({
  protocol: z.object({
    interface: z.enum(['TELEGRAM', 'API', 'CLI', 'MCP']),
    userId: z.string(),
    accessLevel: z.enum(['READ', 'WRITE', 'ADMIN']),
  }),
  action: z.object({
    toolName: z.string(),
    targetTable: z.string().optional(),
    mutationType: z.enum(['CREATE', 'UPDATE', 'DELETE', 'QUERY']),
  }),
  governance: z.object({
    isArmed: z.boolean().default(false),
    auditRequired: z.boolean().default(true),
    nocoDbRecordId: z.string().optional(),
  })
});

export type SwarmDomain = z.infer<typeof SwarmDomainSchema>;
