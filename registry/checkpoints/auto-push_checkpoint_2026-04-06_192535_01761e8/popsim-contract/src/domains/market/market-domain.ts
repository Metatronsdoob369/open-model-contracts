import { z } from 'zod';

/**
 * 📈 Market Domain Schema
 * Governs Prediction Market Arbitrage (Kalshi, Polymarket)
 */
export const MarketDomainSchema = z.object({
  marketSignals: z.object({
    source: z.enum(['kalshi', 'polymarket', 'hybrid']),
    marketTitle: z.string(),
    edge: z.number().min(0).max(1),
    spread: z.number().optional(),
    volume: z.number().optional(),
  }),
  tradeParams: z.object({
    action: z.enum(['SCAN', 'SIGNAL', 'EXECUTE']),
    maxExposureCents: z.number().max(100000), // $1000 limit
    minThreshold: z.number().default(0.02),
  }),
  verification: z.object({
    isSimulated: z.boolean().default(true),
    externalAuditId: z.string().optional(),
  })
});

export type MarketDomain = z.infer<typeof MarketDomainSchema>;
