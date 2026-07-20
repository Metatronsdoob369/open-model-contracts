/**
 * Durable JSONL audit sink for the mediated execution spine.
 * Pattern inspired by Bridge audit logging; does not import Bridge.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface SpineAuditRecord {
  timestamp: string;
  decision: "ALLOW" | "DENY";
  gate: "SAFE" | "ARMED";
  action?: string;
  authorizationName: string;
  reason: string;
  receiptId: string;
  duration_ms: number;
  mediated: true;
  stateChanging?: boolean;
  worldMutated: false;
}

export interface AuditSink {
  append(record: SpineAuditRecord): void;
  getPath(): string;
}

export class JsonlFileAuditSink implements AuditSink {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath =
      filePath ??
      process.env["OMC_SPINE_AUDIT_LOG"] ??
      path.join(os.tmpdir(), "omc-spine-audit.jsonl");
  }

  getPath(): string {
    return this.filePath;
  }

  append(record: SpineAuditRecord): void {
    const line = JSON.stringify(record) + "\n";
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.appendFileSync(this.filePath, line, "utf8");
  }

  /** Compatibility no-op (writes are synchronous). */
  close(): void {
    /* sync writes — nothing to flush */
  }
}

export class InMemoryAuditSink implements AuditSink {
  readonly records: SpineAuditRecord[] = [];

  getPath(): string {
    return ":memory:";
  }

  append(record: SpineAuditRecord): void {
    this.records.push(record);
  }
}
