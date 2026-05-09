import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HuskEngine } from "../core/husk_engine.js";

const frameworkRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const shardDir = path.join(frameworkRoot, "data", "vector_blocks", "medical");
const indexFile = path.join(frameworkRoot, "data", "indices", "medical.index");
const auditLog = path.join(frameworkRoot, "data", "indices", "pulse_audit.jsonl");
const heartbeatMs = 60 * 60 * 1000;

export class CircadianPulse {
  private isDreaming = false;
  private lastShardCount = 0;
  private readonly engine: HuskEngine;

  constructor() {
    this.engine = new HuskEngine({
      shardDir,
      indexFile,
      enableInference: false
    });
  }

  async start(): Promise<void> {
    await this.engine.buildIndex();
    this.lastShardCount = this.countShards();
    await this.beat();
    setInterval(() => void this.beat(), heartbeatMs);
  }

  private async beat(): Promise<void> {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      await this.dream();
    } else {
      await this.wake();
    }
  }

  private async wake(): Promise<void> {
    const currentCount = this.countShards();
    const delta = currentCount - this.lastShardCount;
    if (delta > 0) {
      await this.engine.buildIndex();
      await this.engine.saveIndex(indexFile);
      this.lastShardCount = currentCount;
    }

    this.logAudit("WAKE", {
      shardCount: currentCount,
      shardDelta: delta,
      diagnostics: this.engine.diagnostics()
    });
  }

  private async dream(): Promise<void> {
    if (this.isDreaming) return;
    this.isDreaming = true;

    try {
      await this.engine.buildIndex();
      await this.engine.saveIndex(indexFile);
      this.lastShardCount = this.countShards();
      this.logAudit("DREAM", {
        shardCount: this.lastShardCount,
        diagnostics: this.engine.diagnostics()
      });
    } finally {
      this.isDreaming = false;
    }
  }

  private countShards(): number {
    if (!fs.existsSync(shardDir)) return 0;
    return fs.readdirSync(shardDir).filter((name) => name.endsWith(".json")).length;
  }

  private logAudit(cycle: "WAKE" | "DREAM", data: Record<string, unknown>): void {
    const record = {
      timestamp: new Date().toISOString(),
      cycle,
      ...data
    };
    fs.mkdirSync(path.dirname(auditLog), { recursive: true });
    fs.appendFileSync(auditLog, `${JSON.stringify(record)}\n`);
  }
}
