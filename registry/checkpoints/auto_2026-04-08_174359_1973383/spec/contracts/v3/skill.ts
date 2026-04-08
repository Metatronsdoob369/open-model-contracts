/**
 * OMC v3 — Skill Contract ("Law")
 *
 * Canonical schema for a Domicile Agent Skill Manifest.
 * Replaces implicit SKILLS_CANON.md with strict machine-readable constraints.
 */
import { z } from "zod";

export const SkillManifestSchema = z.object({
  id: z.string().describe("Unique, url-safe identifier for the skill (e.g., 'omc.skill.audit')"),
  skill: z.string().min(1).max(100).describe("Human-readable title of the skill"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe("Strict semver versioning for the skill"),
  description: z
    .string()
    .min(10)
    .describe("Agentic prompt instructions or capability summary"),
  entry_point: z
    .string()
    .min(1)
    .describe("The execution target path (e.g., 'scripts/runner.ts' or 'SKILL.md')"),
  tools: z
    .array(z.string())
    .default([])
    .describe("Array of dependent MCP tool strings or explicit executable capabilities"),
  category: z
    .enum(["governance", "orchestration", "synthesis", "execution", "utility"])
    .describe("Primary functional category determining runtime permissions"),
  isArmed: z
    .boolean()
    .default(false)
    .describe("Flags if the skill contains mutating tools that require ARMED gate activation")
});

export type SkillManifest = z.infer<typeof SkillManifestSchema>;
