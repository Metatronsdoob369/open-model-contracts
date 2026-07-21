/**
 * Mediated execution spine — GovernanceOrchestrator (CG-011)
 *
 * Validates against omc.v3.execution-authorization Law (Zod), resolves
 * effect facts from a trusted action catalog, evaluates SAFE/ARMED gates,
 * and emits durable allow/deny receipts. Does not mutate Bridge/Unreal worlds.
 *
 * Callers identify actionId + resourceRef + authorization + input.
 * Callers do not determine mutation classification.
 */

import { randomUUID } from "node:crypto";
import {
  ExecutionAuthorizationSchema,
  type ExecutionAuthorization,
} from "../../../spec/contracts/v3/execution-authorization.js";
import type {
  EffectClass,
  ResourceRef,
} from "../../../spec/contracts/v3/admitted-action.js";
import { evaluateGate } from "./gate-evaluation.js";
import { PolicyEngine } from "./policy-engine.js";
import { AuditLogger, type SpineReceipt } from "./audit-logger.js";
import {
  type AuditSink,
  JsonlFileAuditSink,
  type SpineAuditRecord,
} from "./audit-sink.js";
import {
  type ActionCatalog,
  emptyActionCatalog,
  type ResolvedCatalogAction,
} from "./action-catalog.js";

/** @deprecated Use ExecutionAuthorizationSchema from Law; retained for import compatibility. */
export const ContractSchema = ExecutionAuthorizationSchema;
export type Contract = ExecutionAuthorization;

/**
 * Execute request. Mutation classification is catalog-derived — never from
 * caller `stateChanging` / `effectClass` / `reversible` fields.
 */
export interface ExecuteContractRequest {
  authorization: unknown;
  actionId: string;
  resourceRef: ResourceRef;
  input?: Record<string, unknown>;
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
    actionId: string;
    effectClass?: EffectClass;
  };
  error?: string;
  receipt: SpineReceipt;
  duration_ms: number;
  timestamp: string;
}

const FORBIDDEN_CALLER_EFFECT_KEYS = [
  "stateChanging",
  "effectClass",
  "reversible",
] as const;

function callerSuppliedEffectFacts(request: object): string | undefined {
  for (const key of FORBIDDEN_CALLER_EFFECT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(request, key)) {
      return key;
    }
  }
  return undefined;
}

export class GovernanceOrchestrator {
  private readonly auditLogger: AuditLogger;
  private readonly auditSink: AuditSink;
  private readonly actionCatalog: ActionCatalog;

  constructor(options?: {
    auditSink?: AuditSink;
    auditLogger?: AuditLogger;
    actionCatalog?: ActionCatalog;
  }) {
    this.auditLogger = options?.auditLogger ?? new AuditLogger();
    this.auditSink = options?.auditSink ?? new JsonlFileAuditSink();
    this.actionCatalog = options?.actionCatalog ?? emptyActionCatalog();
  }

  async validateAuthorization(
    authorization: unknown
  ): Promise<
    { ok: true; value: ExecutionAuthorization } | { ok: false; error: string }
  > {
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
    const actionId = request.actionId;
    const resourceRef = request.resourceRef;

    const forbidden = callerSuppliedEffectFacts(
      request as unknown as object
    );
    if (forbidden) {
      return this.finalize({
        success: false,
        decision: "DENY",
        route: "DENY",
        reason: `Caller-supplied effect fact '${forbidden}' is rejected; effectClass is catalog-derived`,
        authorizationName: "invalid",
        gate: "SAFE",
        actionId,
        resourceRef,
        receiptId,
        startTime,
        timestamp,
      });
    }

    const validated = await this.validateAuthorization(request.authorization);
    if (!validated.ok) {
      return this.finalize({
        success: false,
        decision: "DENY",
        route: "DENY",
        reason: `Authorization schema validation failed: ${validated.error}`,
        authorizationName: "invalid",
        gate: "SAFE",
        actionId,
        resourceRef,
        receiptId,
        startTime,
        timestamp,
      });
    }

    const authorization = validated.value;
    const catalogAction: ResolvedCatalogAction | undefined =
      this.actionCatalog.resolve(actionId);

    const policy = PolicyEngine.evaluateAuthorization({
      authorization,
      actionId,
      resourceRef,
      catalogAction,
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
        actionId,
        resourceRef,
        catalogAction,
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
      actionId,
      resourceRef,
      catalogAction,
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
    actionId: string;
    resourceRef?: ResourceRef;
    catalogAction?: ResolvedCatalogAction;
    receiptId: string;
    startTime: number;
    timestamp: string;
    input?: Record<string, unknown>;
  }): ExecutionResult {
    const duration_ms = Date.now() - args.startTime;
    const entry = args.catalogAction?.entry;
    const effect = args.catalogAction?.effect;

    const receipt: SpineReceipt = {
      receiptId: args.receiptId,
      timestamp: args.timestamp,
      decision: args.decision,
      gate: args.gate,
      route: args.route,
      actionId: args.actionId,
      actionVersion: entry?.version,
      adapterId: entry?.adapterId,
      effectClass: entry?.effectClass,
      stateChanging: effect?.stateChanging,
      reversible: effect?.reversible,
      resourceRef: args.resourceRef,
      authorizationName: args.authorizationName,
      reason: args.reason,
      success: args.success,
      mediated: true,
      worldMutated: false,
      duration_ms,
    };

    this.auditLogger.logReceipt(receipt);

    const durable: SpineAuditRecord = {
      timestamp: args.timestamp,
      decision: args.decision,
      gate: args.gate,
      actionId: args.actionId,
      actionVersion: entry?.version,
      adapterId: entry?.adapterId,
      effectClass: entry?.effectClass,
      stateChanging: effect?.stateChanging,
      reversible: effect?.reversible,
      resourceRef: args.resourceRef,
      authorizationName: args.authorizationName,
      reason: args.reason,
      receiptId: args.receiptId,
      duration_ms,
      mediated: true,
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
        actionId: args.actionId,
        effectClass: entry?.effectClass,
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
