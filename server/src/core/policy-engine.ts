// Minimal Policy Engine
// Governance decision logic

export interface PolicyDecision {
  route: 'SAFE' | 'ARMED' | 'DENY';
  reason: string;
}

export class PolicyEngine {
  static evaluateContract(contract: any): PolicyDecision {
    // Check if operation is reversible
    if (contract.reversible) {
      return {
        route: 'SAFE',
        reason: 'Reversible operation - SAFE mode approved'
      };
    }

    // Irreversible operations require ARMED
    if (!contract.reversible) {
      if (contract.gate === 'ARMED' && contract.scope && contract.expiry && contract.owner) {
        return {
          route: 'ARMED',
          reason: 'Irreversible operation with full ARMED requirements met'
        };
      }

      return {
        route: 'DENY',
        reason: 'Irreversible operation missing ARMED requirements (scope, expiry, owner)'
      };
    }

    return {
      route: 'SAFE',
      reason: 'Default SAFE mode'
    };
  }
}
