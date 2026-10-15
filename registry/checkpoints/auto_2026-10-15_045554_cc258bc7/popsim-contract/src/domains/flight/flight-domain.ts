import { z } from 'zod';

/**
 * Flight Domain Schema
 * 
 * Defines governance for agentic aerial simulations, extending the
 * Constitutional Stack to swarm intelligence and flight physics.
 */
export const FlightDomainSchema = z.object({
  mission: z.object({
    id: z.string(),
    aircraftType: z.enum(['pigeon', 'swallow', 'hawk', 'drone']),
    objective: z.string(),
    waypoints: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      alt: z.number()
    })),
    enforcePhysicsGroundTruth: z.boolean().default(true)
  }),
  governance: z.object({
    noFlyZones: z.array(z.string()).optional(),
    maxAltitude: z.number().default(400), // ft AGL
    collisionAvoidance: z.boolean().default(true),
    authorizedAirspace: z.boolean().default(true)
  })
});

export type FlightDomain = z.infer<typeof FlightDomainSchema>;
