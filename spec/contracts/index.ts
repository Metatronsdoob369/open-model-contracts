/**
 * OMC v3 — Contract Registry ("Law Index")
 *
 * This is the single source of truth for all versioned OMC contracts.
 * Rules:
 *   - Every entry MUST have a stable `id`, a semver `version`, a Zod `schema`,
 *     and a human-readable `description`.
 *   - This file MUST NOT import from src/**  (Law vs Runtime separation).
 *   - Adding or changing a contract here requires regenerating JSON Schemas
 *     (`npm run gen:schema`) and committing the updated files.
 */

import { z } from "zod";
import { AssetSchema } from "./v3/asset.js";
import { AgentSchema } from "./v3/agent.js";
import { TaskSchema } from "./v3/task.js";
import { ValidateManifestationSchema } from "./v3/validate-manifestation.js";

// ─── Registry Entry Type ──────────────────────────────────────────────────────

export interface ContractEntry {
  /** Stable, URL-safe identifier used as the JSON Schema filename stem. */
  id: string;
  /** Semver string for this contract revision. */
  version: string;
  /** Zod schema — the authoritative "Law". */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodTypeAny;
  /** Short human-readable description for tooling and documentation. */
  description: string;
  /**
   * Optional list of capability strings declared by this contract.
   * Maps to the `capabilities.schema.json` in `constitution/`.
   */
  capabilities?: string[];
}

// ─── OMC Registry ─────────────────────────────────────────────────────────────

export const OMC_REGISTRY: Record<string, ContractEntry> = {
  "omc.v3.asset": {
    id: "omc.v3.asset",
    version: "3.0.0",
    schema: AssetSchema,
    description:
      "Canonical schema for a spawnable / transferable digital asset in OMC.",
    capabilities: ["read", "write", "spawn"],
  },
  "omc.v3.agent": {
    id: "omc.v3.agent",
    version: "3.0.0",
    schema: AgentSchema,
    description:
      "Canonical schema for an autonomous agent participating in OMC.",
    capabilities: ["read", "validate", "checkpoint"],
  },
  "omc.v3.task": {
    id: "omc.v3.task",
    version: "3.0.0",
    schema: TaskSchema,
    description:
      "Canonical schema for a unit of work (task) assigned within OMC.",
    capabilities: ["read", "write", "execute"],
  },
  "omc.v3.validate-manifestation": {
    id: "omc.v3.validate-manifestation",
    version: "3.0.0",
    schema: ValidateManifestationSchema,
    description:
      "Schema for validating a Phase-3 manifestation event in the OMC pipeline.",
    capabilities: ["validate", "checkpoint"],
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns lightweight metadata for every registered contract (no schema object). */
export function listContracts(): Array<Omit<ContractEntry, "schema">> {
  return Object.values(OMC_REGISTRY).map(
    ({ id, version, description, capabilities }) => ({
      id,
      version,
      description,
      capabilities,
    })
  );
}

/** Looks up a contract entry by its stable ID, or returns undefined. */
export function getContract(id: string): ContractEntry | undefined {
  return OMC_REGISTRY[id];
}
