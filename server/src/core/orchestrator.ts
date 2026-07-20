/**
 * Mediated execution spine — GovernanceOrchestrator
 *
 * Validates against omc.v3.execution-authorization Law (Zod), evaluates SAFE/ARMED
 * gates, and emits durable allow/deny receipts. Does not mutate Bridge/Unreal worlds.
 */

import { randomUUID } from "node:crypto";
import {
  ExecutionAuthorizationSchema,
  type ExecutionAuthorization,
} from "../../../spec/contracts/v3/execution-authorization.js";
import { evaluateGate } from "./gate-evaluation.js";
import { PolicyEngine } from "./policy-engine.js";
import {
  AuditLogger,
  type SpineReceipt,
} from "./audit-logger.js";
import {
  type AuditSink,
  JsonlFileAuditSink,
  type SpineAuditRecord,
} from "./audit-sink.js";

/** @deprecated Use ExecutionAuthorizationSchema from Law; retained for import compatibility. */
export const ContractSchema = ExecutionAuthorizationSchema;
export type Contract = ExecutionAuthorization;

export interface ExecuteContractRequest {
  authorization: unknown;
  action: string;
  input?: Record<string, unknown>;
  stateChanging?: boolean;
  /** Optional clock override for tests */
  now?: Date;
}

export interface ExecutionResult {
  success: boolean;
  output?: {
    mediated: true;
    worldMutated: false;
    decision: "ALLOW" | "DENY";
    route: "SAFE" | "ARMED" | "DENY";
    receiptId: string;
    reason: string;
    action: string;
  };
  error?: string;
  receipt: SpineReceipt;
  duration_ms: number;
  timestamp: string;
}

export class GovernanceOrchestrator {
  private readonly auditLogger: AuditLogger;
  private readonly auditSink: AuditSink;

  constructor(options?: { auditSink?: AuditSink; auditLogger?: AuditLogger }) {
    this.auditLogger = options?.auditLogger ?? new AuditLogger();
    this.auditSink = options?.auditSink ?? new JsonlFileAuditSink();
  }

  async validateAuthorization(
    authorization: unknown
  ): Promise<{ ok: true; value: ExecutionAuthorization } | { ok: false; error: string }> {
    const parsed = ExecutionAuthorizationSchema.safeParse(authorization);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.errors
          .map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`)
          .join("; "),
      };
    }
    return { ok: true, value: parsed.data };
  }

  /** @deprecated Prefer validateAuthorization */
  async validateContract(contract: unknown): Promise<boolean> {
    const result = await this.validateAuthorization(contract);
    return result.ok;
  }

  async executeContract(
    request: ExecuteContractRequest
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const receiptId = randomUUID();
    const action = request.action;
    const stateChanging = Boolean(request.stateChanging);

    const validated = await this.validateAuthorization(request.authorization);
    if (!validated.ok) {
      return this.finalize({
        success: false,
        decision: "DENY",
        route: "DENY",
        reason: `Authorization schema validation failed: ${validated.error}`,
        authorizationName: "invalid",
        gate: "SAFE",
        action,
        stateChanging,
        receiptId,
        startTime,
        timestamp,
      });
    }

    const authorization = validated.value;
    const policy = PolicyEngine.evaluateAuthorization({
      authorization,
      action,
      stateChanging,
      now: request.now,
    });

    if (policy.route === "DENY" || !policy.allowed) {
      return this.finalize({
        success: false,
        decision: "DENY",
        route: "DENY",
        reason: policy.reason,
        authorizationName: authorization.name,
        gate: authorization.gate,
        action,
        stateChanging,
        receiptId,
        startTime,
        timestamp,
      });
    }

    // Mediation success: no world mutation on this spine.
    return this.finalize({
      success: true,
      decision: "ALLOW",
      route: policy.route,
      reason: policy.reason,
      authorizationName: authorization.name,
      gate: authorization.gate,
      action,
      stateChanging,
      receiptId,
      startTime,
      timestamp,
      input: request.input ?? authorization.input,
    });
  }

  getAuditLog(): SpineReceipt[] {
    return this.auditLogger.getReceipts();
  }

  getAuditSinkPath(): string {
    return this.auditSink.getPath();
  }

  dispose(): void {
    /* reserved for future resource cleanup */
  }

  private finalize(args: {
    success: boolean;
    decision: "ALLOW" | "DENY";
    route: "SAFE" | "ARMED" | "DENY";
    reason: string;
    authorizationName: string;
    gate: "SAFE" | "ARMED";
    action: string;
    stateChanging: boolean;
    receiptId: string;
    startTime: number;
    timestamp: string;
    input?: Record<string, unknown>;
  }): ExecutionResult {
    const duration_ms = Date.now() - args.startTime;
    const receipt: SpineReceipt = {
      receiptId: args.receiptId,
      timestamp: args.timestamp,
      decision: args.decision,
      gate: args.gate,
      route: args.route,
      action: args.action,
      authorizationName: args.authorizationName,
      reason: args.reason,
      success: args.success,
      mediated: true,
      worldMutated: false,
      stateChanging: args.stateChanging,
      duration_ms,
    };

    this.auditLogger.logReceipt(receipt);

    const durable: SpineAuditRecord = {
      timestamp: args.timestamp,
      decision: args.decision,
      gate: args.gate,
      action: args.action,
      authorizationName: args.authorizationName,
      reason: args.reason,
      receiptId: args.receiptId,
      duration_ms,
      mediated: true,
      stateChanging: args.stateChanging,
      worldMutated: false,
    };
    this.auditSink.append(durable);

    return {
      success: args.success,
      error: args.success ? undefined : args.reason,
      output: {
        mediated: true,
        worldMutated: false,
        decision: args.decision,
        route: args.route,
        receiptId: args.receiptId,
        reason: args.reason,
        action: args.action,
      },
      receipt,
      duration_ms,
      timestamp: args.timestamp,
    };
  }
}

// Re-export Law pieces for callers/tests
export { ExecutionAuthorizationSchema, evaluateGate };
export type { ExecutionAuthorization };
