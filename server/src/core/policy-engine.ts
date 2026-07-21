/**
 * Policy engine — delegates to shared gate evaluation (no parallel presence-only logic).
 */

import {
  evaluateGate,
  type AuthorizationFields,
  type GateEvaluationResult,
} from "./gate-evaluation.js";
import type {
  ActionCatalogEntry,
  DerivedEffectFacts,
  ResourceRef,
} from "./action-catalog.js";

export interface PolicyDecision {
  route: "SAFE" | "ARMED" | "DENY";
  reason: string;
  allowed: boolean;
}

export class PolicyEngine {
  static evaluateAuthorization(input: {
    authorization: AuthorizationFields;
    actionId: string;
    resourceRef: ResourceRef;
    catalogAction:
      | { entry: ActionCatalogEntry; effect: DerivedEffectFacts }
      | undefined;
    now?: Date;
  }): PolicyDecision {
    const result: GateEvaluationResult = evaluateGate(input);
    return {
      route: result.route,
      reason: result.reason,
      allowed: result.allowed,
    };
  }
}
