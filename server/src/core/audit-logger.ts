/**
 * In-process receipt log for the mediated spine (plus durable sink elsewhere).
 */

export interface SpineReceipt {
  receiptId: string;
  timestamp: string;
  decision: "ALLOW" | "DENY";
  gate: "SAFE" | "ARMED";
  route: "SAFE" | "ARMED" | "DENY";
  action: string;
  authorizationName: string;
  reason: string;
  success: boolean;
  mediated: true;
  worldMutated: false;
  stateChanging?: boolean;
  duration_ms: number;
}

/** @deprecated Prefer SpineReceipt */
export interface AuditEvent {
  timestamp: string;
  contract: string;
  gate: "SAFE" | "ARMED";
  success: boolean;
  duration_ms?: number;
  error?: string;
}

export class AuditLogger {
  private receipts: SpineReceipt[] = [];

  logReceipt(receipt: SpineReceipt): void {
    this.receipts.push(receipt);
  }

  getReceipts(): SpineReceipt[] {
    return [...this.receipts];
  }

  /** @deprecated Prefer logReceipt */
  log(event: AuditEvent): void {
    this.receipts.push({
      receiptId: `legacy-${this.receipts.length}`,
      timestamp: event.timestamp || new Date().toISOString(),
      decision: event.success ? "ALLOW" : "DENY",
      gate: event.gate,
      route: event.success ? event.gate : "DENY",
      action: "",
      authorizationName: event.contract,
      reason: event.error ?? (event.success ? "legacy allow" : "legacy deny"),
      success: event.success,
      mediated: true,
      worldMutated: false,
      duration_ms: event.duration_ms ?? 0,
    });
  }

  /** @deprecated Prefer getReceipts */
  getEvents(): AuditEvent[] {
    return this.receipts.map((r) => ({
      timestamp: r.timestamp,
      contract: r.authorizationName,
      gate: r.gate,
      success: r.success,
      duration_ms: r.duration_ms,
      error: r.success ? undefined : r.reason,
    }));
  }

  query(filter: Partial<AuditEvent>): AuditEvent[] {
    return this.getEvents().filter((event) =>
      Object.entries(filter).every(
        ([key, value]) => event[key as keyof AuditEvent] === value
      )
    );
  }

  clear(): void {
    this.receipts = [];
  }
}
