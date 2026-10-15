import { z } from 'zod';

export const CryptoDomainSchema = z.object({
  portfolio: z.object({
    coins: z.array(z.object({
      symbol: z.string(),
      amount: z.number(),
    })),
  }),
  intel: z.string(),
  trades: z.array(z.object({
    type: z.enum(['buy', 'sell']),
    txnId: z.string(),
  })),
  web3Wallet: z.string(),
  omcValidation: z.object({
    gsiScore: z.number().gt(0.95),
    sealId: z.string(),
  }),
});

export type CryptoDomain = z.infer<typeof CryptoDomainSchema>;
