/**
 * Shared SAFE/ARMED gate evaluation for the mediated execution spine.
 * Uses Law shape from ExecutionAuthorization (parsed) plus catalog-resolved
 * effect facts. Does not call Bridge/LawCRON. Does not dispatch adapters.
 */

import type {
  ActionCatalogEntry,
  DerivedEffectFacts,
  ResourceRef,
} from "./action-catalog.js";
import { resourceRefsEqual } from "./action-catalog.js";

export type GateMode = "SAFE" | "ARMED";

export interface ApprovalFields {
  approvedBy: string;
  approvedAt: string;
  approvalId: string;
}

/** Parsed authorization fields (post Zod). */
export interface AuthorizationFields {
  name: string;
  gate: GateMode;
  actionId: string;
  resourceRef: ResourceRef;
  expiry?: string;
  owner?: string;
  approval?: ApprovalFields;
}

export interface GateEvaluationInput {
  authorization: AuthorizationFields;
  /** Requested actionId (must match authorization.actionId and catalog). */
  actionId: string;
  /** Requested resource (must exactly match authorization.resourceRef). */
  resourceRef: ResourceRef;
  /** Catalog resolution for actionId; undefined = unknown. */
  catalogAction: { entry: ActionCatalogEntry; effect: DerivedEffectFacts } | undefined;
  now?: Date;
}

export interface GateEvaluationResult {
  allowed: boolean;
  reason: string;
  route: "SAFE" | "ARMED" | "DENY";
}

function hasNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidApproval(approval: ApprovalFields | undefined): boolean {
  if (!approval) return false;
  return (
    hasNonEmpty(approval.approvedBy) &&
    hasNonEmpty(approval.approvedAt) &&
    hasNonEmpty(approval.approvalId) &&
    !Number.isNaN(Date.parse(approval.approvedAt))
  );
}

/**
 * Evaluate whether a mediated execute request may proceed.
 * Effect classification comes only from catalog-resolved effectClass.
 * Exact actionId + exact resourceRef match only (no wildcards).
 */
export function evaluateGate(input: GateEvaluationInput): GateEvaluationResult {
  const { authorization, actionId, resourceRef, catalogAction } = input;
  const now = input.now ?? new Date();

  if (!catalogAction) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Unknown action '${actionId}'`,
    };
  }

  const { entry, effect } = catalogAction;

  if (!entry.admitted) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Action '${actionId}' is disabled / not admitted`,
    };
  }

  if (authorization.actionId !== actionId) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Action mismatch: request '${actionId}' ≠ authorization '${authorization.actionId}'`,
    };
  }

  if (entry.actionId !== actionId) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Catalog actionId mismatch for '${actionId}'`,
    };
  }

  // Exact auth↔request bind before catalog type membership (distinct denial reasons).
  if (!resourceRefsEqual(authorization.resourceRef, resourceRef)) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Resource mismatch: request ${resourceRef.resourceType}/${resourceRef.resourceId} ≠ authorization ${authorization.resourceRef.resourceType}/${authorization.resourceRef.resourceId}`,
    };
  }

  if (!entry.declaredResourceTypes.includes(resourceRef.resourceType)) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Resource type '${resourceRef.resourceType}' is not declared for action '${actionId}'`,
    };
  }

  // Catalog-derived mutation classification — never caller-supplied.
  if (!effect.stateChanging) {
    // READ_ONLY: SAFE or ARMED observation path; never a mutating path.
    if (authorization.gate === "SAFE") {
      return {
        allowed: true,
        route: "SAFE",
        reason: "READ_ONLY action with SAFE observation approved",
      };
    }
    // ARMED + READ_ONLY is allowed if ARMED structural/expiry checks pass
    // (observation under an ARMED envelope is not a mutation).
  } else {
    // STATE_CHANGE or IRREVERSIBLE
    if (authorization.gate === "SAFE") {
      return {
        allowed: false,
        route: "DENY",
        reason: `SAFE gate forbids state-changing effectClass '${entry.effectClass}'`,
      };
    }
  }

  if (authorization.gate === "SAFE") {
    return {
      allowed: true,
      route: "SAFE",
      reason: "SAFE observation / non-mutating mediation approved",
    };
  }

  // ARMED — structural completeness is Zod's job; runtime still checks expiry
  // and defense-in-depth for owner/approval when present.
  if (!hasNonEmpty(authorization.expiry)) {
    return {
      allowed: false,
      route: "DENY",
      reason: "ARMED requires expiry",
    };
  }
  if (!hasNonEmpty(authorization.owner)) {
    return {
      allowed: false,
      route: "DENY",
      reason: "ARMED requires owner",
    };
  }
  if (!isValidApproval(authorization.approval)) {
    return {
      allowed: false,
      route: "DENY",
      reason:
        "ARMED requires structured approval (approvedBy, approvedAt, approvalId)",
    };
  }

  const expiryMs = Date.parse(authorization.expiry);
  if (Number.isNaN(expiryMs)) {
    return {
      allowed: false,
      route: "DENY",
      reason: "ARMED expiry is not a valid datetime",
    };
  }
  if (expiryMs <= now.getTime()) {
    return {
      allowed: false,
      route: "DENY",
      reason: `ARMED authorization expired at ${authorization.expiry}`,
    };
  }

  return {
    allowed: true,
    route: "ARMED",
    reason: effect.stateChanging
      ? `ARMED authorization satisfied for effectClass '${entry.effectClass}'`
      : "ARMED authorization satisfied (READ_ONLY under ARMED envelope)",
  };
}
