/**
 * Shared SAFE/ARMED gate evaluation for the mediated execution spine.
 * Uses Law shape from ExecutionAuthorization (parsed). Does not call Bridge/LawCRON.
 */

export type GateMode = "SAFE" | "ARMED";

export interface ApprovalFields {
  approvedBy: string;
  approvedAt: string;
  approvalId: string;
}

export interface AuthorizationFields {
  name: string;
  gate: GateMode;
  reversible: boolean;
  scope?: string;
  expiry?: string;
  owner?: string;
  approval?: ApprovalFields;
}

export interface GateEvaluationInput {
  authorization: AuthorizationFields;
  action: string;
  stateChanging?: boolean;
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
 * Exact scope match only (action === scope). No wildcards.
 */
export function evaluateGate(input: GateEvaluationInput): GateEvaluationResult {
  const { authorization, action, stateChanging = false } = input;
  const now = input.now ?? new Date();

  if (authorization.gate === "SAFE") {
    if (stateChanging) {
      return {
        allowed: false,
        route: "DENY",
        reason: "SAFE gate forbids state-changing intent",
      };
    }
    return {
      allowed: true,
      route: "SAFE",
      reason: "SAFE observation / non-mutating mediation approved",
    };
  }

  // ARMED
  if (!hasNonEmpty(authorization.scope)) {
    return {
      allowed: false,
      route: "DENY",
      reason: "ARMED requires scope",
    };
  }
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
      reason: "ARMED requires structured approval (approvedBy, approvedAt, approvalId)",
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

  if (action !== authorization.scope) {
    return {
      allowed: false,
      route: "DENY",
      reason: `Action '${action}' is outside ARMED scope '${authorization.scope}'`,
    };
  }

  return {
    allowed: true,
    route: "ARMED",
    reason: "ARMED authorization satisfied (expiry, scope, owner, approval)",
  };
}
