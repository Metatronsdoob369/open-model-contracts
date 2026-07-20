/**
 * Policy engine — delegates to shared gate evaluation (no parallel presence-only logic).
 */

import {
  evaluateGate,
  type AuthorizationFields,
  type GateEvaluationResult,
} from "./gate-evaluation.js";

export interface PolicyDecision {
  route: "SAFE" | "ARMED" | "DENY";
  reason: string;
  allowed: boolean;
}

export class PolicyEngine {
  static evaluateAuthorization(input: {
    authorization: AuthorizationFields;
    action: string;
    stateChanging?: boolean;
    now?: Date;
  }): PolicyDecision {
    const result: GateEvaluationResult = evaluateGate(input);
    return {
      route: result.route,
      reason: result.reason,
      allowed: result.allowed,
    };
  }

  /**
   * @deprecated Use evaluateAuthorization with action/stateChanging.
   * Kept for transitional callers; treats missing action as empty (will fail ARMED scope match).
   */
  static evaluateContract(contract: AuthorizationFields): PolicyDecision {
    return this.evaluateAuthorization({
      authorization: contract,
      action: contract.scope ?? "",
      stateChanging: contract.gate === "ARMED",
    });
  }
}
