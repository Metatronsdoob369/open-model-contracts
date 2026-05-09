import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HuskEngine, type QueryResult } from "../core/husk_engine.js";

const frameworkRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const shardDir = path.join(frameworkRoot, "data", "vector_blocks", "medical");
const indexFile = path.join(frameworkRoot, "data", "indices", "medical.index");
const manifestPath = path.join(frameworkRoot, "manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

export interface GatewayReply {
  kind: "clarification_request" | "source_bundle" | "answer" | "silence";
  text: string;
}

export class WhiteGloveGateway {
  private readonly engine: HuskEngine;
  private readonly ready: Promise<void>;

  constructor() {
    this.engine = new HuskEngine({
      shardDir,
      indexFile,
      ollamaModel: manifest.hermes.model,
      similarityThreshold: manifest.policy.similarityThreshold,
      queryThreshold: manifest.policy.queryThreshold,
      clarificationThreshold: manifest.policy.clarificationThreshold,
      maxContextShards: manifest.policy.maxContextShards,
      enableInference: manifest.policy.enableInference
    });
    this.ready = this.initialize();
  }

  async handleQuery(message: string): Promise<GatewayReply> {
    await this.ready;
    const result = await this.engine.query(message);
    return this.toGatewayReply(result);
  }

  private async initialize(): Promise<void> {
    const loaded = await this.engine.loadIndex(indexFile);
    if (!loaded) {
      await this.engine.buildIndex();
      await this.engine.saveIndex(indexFile);
    }
  }

  private toGatewayReply(result: QueryResult): GatewayReply {
    if (result.clarificationNeeded) {
      return {
        kind: "clarification_request",
        text: result.clarificationPrompt ?? "Please clarify your medical query."
      };
    }

    if (result.silenced) {
      return {
        kind: "silence",
        text: "No medically relevant shards were found for this query."
      };
    }

    if (result.mode === "query" && result.answer) {
      return {
        kind: "answer",
        text: result.answer
      };
    }

    const sources = result.sourceTexts
      .map((source, index) => `[${index + 1}] ${source.source}/${source.shardId}\n${source.fullText.slice(0, 1000)}`)
      .join("\n\n");

    return {
      kind: "source_bundle",
      text: sources
    };
  }
}

async function cli(): Promise<void> {
  const question = process.argv.slice(2).join(" ").trim();
  if (!question) {
    console.log('Usage: npm run query -- "your medical question"');
    process.exit(0);
  }

  const gateway = new WhiteGloveGateway();
  const reply = await gateway.handleQuery(question);
  console.log(`[${reply.kind}]`);
  console.log(reply.text);
}

if (process.argv[1] && process.argv[1].endsWith("telegram_gateway.ts")) {
  void cli();
}
