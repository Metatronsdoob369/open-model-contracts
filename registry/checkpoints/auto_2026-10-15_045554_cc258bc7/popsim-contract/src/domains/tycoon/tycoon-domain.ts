import { z } from 'zod';

export const TycoonDomainSchema = z.object({
  resources: z.object({
    credits: z.number(),
    properties: z.number(),
  }),
  actions: z.enum(['recruit', 'flip', 'upgrade']),
  scraperFeed: z.string().optional(),
  monetization: z.object({
    starsBoost: z.number(),
    omcSeal: z.boolean(),
  }),
  gsiThreshold: z.number().default(0.95),
});

export type TycoonDomain = z.infer<typeof TycoonDomainSchema>;
