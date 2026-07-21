/**
 * Trusted action catalog — runtime lookup by actionId.
 *
 * Catalog entries become execution authority only after resolution here.
 * Callers must never pass an ActionCatalogEntry as execute authority.
 */

import {
  ActionCatalogEntrySchema,
  deriveEffectFacts,
  type ActionCatalogEntry,
  type DerivedEffectFacts,
  type EffectClass,
  type ResourceRef,
} from "../../../spec/contracts/v3/admitted-action.js";

export type { ActionCatalogEntry, DerivedEffectFacts, EffectClass, ResourceRef };

export interface ResolvedCatalogAction {
  entry: ActionCatalogEntry;
  effect: DerivedEffectFacts;
}

export interface ActionCatalog {
  /** Resolve by exact actionId. Unknown → undefined (caller must DENY). */
  resolve(actionId: string): ResolvedCatalogAction | undefined;
}

/**
 * In-memory catalog. Entries are validated for shape at construction;
 * provenance is "injected by the trusted host," not schema-proven.
 */
export class MapActionCatalog implements ActionCatalog {
  private readonly byId: Map<string, ActionCatalogEntry>;

  constructor(entries: readonly ActionCatalogEntry[]) {
    this.byId = new Map();
    for (const raw of entries) {
      const parsed = ActionCatalogEntrySchema.parse(raw);
      if (this.byId.has(parsed.actionId)) {
        throw new Error(
          `Duplicate actionId in action catalog: ${parsed.actionId}`
        );
      }
      this.byId.set(parsed.actionId, parsed);
    }
  }

  resolve(actionId: string): ResolvedCatalogAction | undefined {
    const entry = this.byId.get(actionId);
    if (!entry) return undefined;
    return {
      entry,
      effect: deriveEffectFacts(entry.effectClass),
    };
  }
}

/** Empty catalog — every actionId resolves unknown → DENY. */
export function emptyActionCatalog(): ActionCatalog {
  return new MapActionCatalog([]);
}

export function resourceRefsEqual(a: ResourceRef, b: ResourceRef): boolean {
  return a.resourceType === b.resourceType && a.resourceId === b.resourceId;
}
