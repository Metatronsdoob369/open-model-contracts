import { z } from 'zod';

/**
 * 🐟 Population Domain Schema
 * Governs Swarm Intelligence Simulations (MiroFish)
 */
export const PopulationDomainSchema = z.object({
  seedMaterial: z.object({
    title: z.string(),
    contentHash: z.string(),
    gsiScore: z.number().min(0).max(1), // TriadGAT verified
  }),
  simConfig: z.object({
    agentCount: z.number().min(10).max(10000),
    iterations: z.number().min(1).max(100),
    environment: z.enum(['standard', 'roblox', 'cinematic']),
  }),
  outputPolicy: z.object({
    format: z.enum(['REPORT', 'STREAM', 'INTERACTIVE']),
    requiresCertification: z.boolean().default(true),
  })
});

export type PopulationDomain = z.infer<typeof PopulationDomainSchema>;
