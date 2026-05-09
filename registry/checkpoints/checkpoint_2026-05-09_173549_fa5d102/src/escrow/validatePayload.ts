import * as crypto from 'crypto';
import * as luaparse from 'luaparse';

// We import these assuming they are structurally populated in your repo as requested.
// If not, we will need to scaffold them next.
import { BridgeContracts } from '../contracts/bridgeContracts';
import { RegisterIssue } from '../omc/governance';

export interface EscrowPayload {
  bridgeId: string;
  contractName: string;
  repairedCode: string;
  manifestHash: string;
  samplePayload?: any;
  expectedThrottleRate?: number;
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  sessionId?: string;
}

/**
 * ARMED PHASE 2 ESCROW VALIDATION
 * Hybrid Architecture: Utilizes both cryptographic transit verification
 * and physical abstract syntax tree (AST) execution parsing to ensure
 * no hallucinated state is passed to the engine.
 */
export async function validateEscrowPayload(payload: EscrowPayload): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Transit Integrity - SHA-256 Hash Check
  const computedHash = crypto
    .createHash('sha256')
    .update(payload.repairedCode)
    .digest('hex');

  if (computedHash !== payload.manifestHash) {
    errors.push("Manifest hash mismatch - possible transit corruption");
  }

  // 2. Lexical / AST-style validation (Critical Structural Checks)
  try {
    // Ensure the code is structurally sound Lua
    const ast = luaparse.parse(payload.repairedCode, { 
        comments: false, 
        scope: true, 
        locations: true 
    });

    let foundSafeFire = false;
    let foundReceiverGuard = false;

    function walk(node: any) {
        if (!node) return;

        // Check for SafeFire[BridgeId]
        if (node.type === 'FunctionDeclaration' && node.identifier && node.identifier.name === `SafeFire${payload.bridgeId}`) {
            foundSafeFire = true;
        }

        // Check for [BridgeId].OnServerEvent:Connect
        if (node.type === 'CallExpression' && node.base && node.base.type === 'MemberExpression') {
            const isConnect = node.base.identifier.name === 'Connect';
            if (node.base.base && node.base.base.type === 'MemberExpression') {
                 const isOnServerEvent = node.base.base.identifier && node.base.base.identifier.name === 'OnServerEvent';
                 const isTargetBridge = node.base.base.base && (node.base.base.base as any).name === payload.bridgeId;
                 
                 if (isConnect && isOnServerEvent && isTargetBridge) {
                     foundReceiverGuard = true;
                 }
            }
        }

        if (Array.isArray(node)) {
            node.forEach(walk);
        } else if (typeof node === 'object') {
            Object.values(node).forEach(walk);
        }
    }

    walk(ast);

    if (!foundSafeFire) {
      errors.push(`Missing SafeFire${payload.bridgeId} wrapper in AST - raw FireServer detected`);
    }

    if (!foundReceiverGuard) {
      errors.push(`Missing receiver-side OnServerEvent guard for bridge ${payload.bridgeId}`);
    }

    // Checking throttle rate enforcement (Hybrid regex for direct rate verification)
    const throttleRegex = /ThrottleRate\s*=\s*\d+/i;
    if (!throttleRegex.test(payload.repairedCode)) {
      errors.push("Missing throttle rate enforcement in SafeFire wrapper");
    }

  } catch (e: any) {
    errors.push(`Failed to parse Lua AST - AI generated invalid syntax: ${e.message}`);
  }

  // 3. Contract validation (Zod shape)
  // Fallback to any constraint to allow generic indexing while BridgeContracts is populated
  const contractMap = BridgeContracts as any;
  const contract = contractMap[payload.contractName];
  
  if (!contract) {
    errors.push(`Unknown bridge contract: ${payload.contractName}`);
  } else if (payload.samplePayload) {
    const contractValid = validateZodContract(contract, payload.samplePayload);
    if (!contractValid) {
      errors.push(`Payload does not conform to declared contract ${payload.contractName}`);
    }
  }

  if (errors.length > 0) {
    // If any structural, contract, or hash layer fails -> Block payload and Log Issue
    try {
        RegisterIssue("EscrowValidationFailed", {
            bridgeId: payload.bridgeId,
            errors,
            manifestHashValid: computedHash === payload.manifestHash
        });
    } catch {
        console.error(`ESCROW Validation Failed for Bridge: ${payload.bridgeId} - (Governance Not Hooked)`, errors);
    }

    return { success: false, errors };
  }

  // All checks passed - Arm the connection and issue authority token
  const sessionId = crypto.randomUUID();

  return {
    success: true,
    errors: [],
    sessionId
  };
}

// Simple Zod-like validator for bridge contracts
function validateZodContract(contract: any, payload: any): boolean {
  try {
    if (typeof payload !== 'object' || payload === null) return false;
    if (contract.required && Array.isArray(contract.required)) {
      for (const key of contract.required) {
        if (!(key in payload)) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
