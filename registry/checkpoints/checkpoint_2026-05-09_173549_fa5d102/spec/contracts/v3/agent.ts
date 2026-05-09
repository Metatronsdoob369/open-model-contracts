/**
 * OMC v3 — Agent Contract ("Law")
 *
 * Canonical schema for an autonomous agent participating in OMC.
 * Must NOT import from src/**; this is pure "Law", no runtime.
 */
import { z } from "zod";

export const AgentCapabilitySchema = z.enum([
  "read",
  "write",
  "execute",
  "validate",
  "checkpoint",
  "spawn",
]);

export const AgentSchema = z.object({
  id: z.string().uuid().describe("Stable unique identifier for this agent"),
  name: z.string().min(1).max(80).describe("Agent display name"),
  role: z
    .enum(["director", "specialist", "observer", "validator"])
    .describe("Agent's functional role within OMC"),
  capabilities: z
    .array(AgentCapabilitySchema)
    .describe("Explicit list of permitted capabilities"),
  gate: z
    .enum(["SAFE", "ARMED"])
    .default("SAFE")
    .describe("Execution gate — ARMED requires explicit approval"),
  domainScope: z
    .array(z.string())
    .default([])
    .describe("Domains this agent may operate in (empty = all)"),
  auditRequired: z
    .boolean()
    .default(true)
    .describe("Whether this agent's actions require audit logging"),
  registeredAt: z.string().datetime().describe("ISO-8601 registration timestamp"),
});

export type Agent = z.infer<typeof AgentSchema>;
