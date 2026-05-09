import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ShardCache, type CachedShard } from "./shard_cache.js";
import { SimHashDriftGuard, type DriftResult } from "./simhash.js";

const FRAMEWORK_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

function frameworkPath(...segments: string[]): string {
  return path.join(FRAMEWORK_ROOT, ...segments);
}

interface IndexEntry {
  shardId: string;
  source: string;
  title: string;
  contentPreview: string;
  signature: bigint;
  frequency: number;
}

export interface HuskConfig {
  shardDir: string;
  indexFile: string;
  ollamaModel: string;
  ollamaUrl: string;
  similarityThreshold: number;
  queryThreshold: number;
  clarificationThreshold: number;
  maxContextShards: number;
  maxResponseTokens: number;
  cacheCapacity: number;
  enableInference: boolean;
}

const DEFAULT_CONFIG: HuskConfig = {
  shardDir: frameworkPath("data", "vector_blocks", "medical"),
  indexFile: frameworkPath("data", "indices", "medical.index"),
  ollamaModel: "hermes3:8b",
  ollamaUrl: "http://127.0.0.1:11434",
  similarityThreshold: 0.2858,
  queryThreshold: 0.45,
  clarificationThreshold: 0.3,
  maxContextShards: 5,
  maxResponseTokens: 256,
  cacheCapacity: 750,
  enableInference: false
};

export interface QueryCitation {
  shardId: string;
  source: string;
  hammingRatio: number;
  contentPreview: string;
}

export interface QueryResult {
  mode: "retrieve" | "query";
  silenced: boolean;
  clarificationNeeded: boolean;
  clarificationPrompt?: string;
  answer: string | null;
  citations: QueryCitation[];
  sourceTexts: Array<{ shardId: string; source: string; fullText: string }>;
  metrics: {
    indexLookupMs: number;
    cacheMisses: number;
    inferenceMs: number;
    totalMs: number;
    shardsEvaluated: number;
    shardsSelected: number;
  };
}

export class HuskEngine {
  private readonly config: HuskConfig;
  private readonly guard: SimHashDriftGuard;
  private readonly queryGuard: SimHashDriftGuard;
  private readonly cache: ShardCache;
  private readonly index: IndexEntry[] = [];
  private readonly hotRing = new Map<string, IndexEntry>();
  private readonly hotQueryCache = new Map<string, Array<{ entry: IndexEntry; drift: DriftResult }>>();
  private initialized = false;
  private readonly hotPercent = 0.05;

  constructor(config: Partial<HuskConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.guard = new SimHashDriftGuard(this.config.similarityThreshold);
    this.queryGuard = new SimHashDriftGuard(this.config.queryThreshold);
    this.cache = new ShardCache(this.config.cacheCapacity);
  }

  async buildIndex(limit?: number): Promise<void> {
    const start = Date.now();
    this.index.length = 0;

    const files = fs.readdirSync(this.config.shardDir).filter((file) => file.endsWith(".json")).sort();
    let processed = 0;

    for (const file of files) {
      if (limit && processed >= limit) break;

      const shardPath = path.join(this.config.shardDir, file);
      const raw = JSON.parse(fs.readFileSync(shardPath, "utf-8")) as {
        id?: string;
        shardId?: string;
        source: string;
        title?: string;
        content: string;
      };

      const shardId = raw.id ?? raw.shardId;
      if (!shardId || !raw.content || !raw.source) continue;

      const signature = this.guard.simHash128FromText(raw.content, raw.source);
      this.index.push({
        shardId,
        source: raw.source,
        title: raw.title ?? "Untitled",
        contentPreview: raw.content.slice(0, 120).replace(/\n/g, " "),
        signature,
        frequency: 0
      });

      this.cache.put({ id: shardId, source: raw.source, content: raw.content });
      processed += 1;
    }

    this.rebalanceHotRing();
    this.initialized = true;
    const elapsed = Date.now() - start;
    console.log(`Index built: ${this.index.length} shards in ${elapsed}ms`);
  }

  async saveIndex(filePath = this.config.indexFile): Promise<void> {
    const payload = {
      createdAt: new Date().toISOString(),
      config: {
        similarityThreshold: this.config.similarityThreshold,
        queryThreshold: this.config.queryThreshold
      },
      entries: this.index.map((entry) => ({
        shardId: entry.shardId,
        source: entry.source,
        title: entry.title,
        contentPreview: entry.contentPreview,
        frequency: entry.frequency,
        signatureHex: entry.signature.toString(16)
      }))
    };

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload));
  }

  async loadIndex(filePath = this.config.indexFile): Promise<boolean> {
    if (!fs.existsSync(filePath)) return false;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
      entries: Array<{
        shardId: string;
        source: string;
        title: string;
        contentPreview: string;
        frequency?: number;
        signatureHex: string;
      }>;
    };

    this.index.length = 0;
    for (const entry of raw.entries) {
      this.index.push({
        shardId: entry.shardId,
        source: entry.source,
        title: entry.title,
        contentPreview: entry.contentPreview,
        frequency: entry.frequency ?? 0,
        signature: BigInt(`0x${entry.signatureHex}`)
      });
    }

    this.rebalanceHotRing();
    this.initialized = true;
    return true;
  }

  async retrieve(question: string): Promise<QueryResult> {
    if (!this.initialized) await this.buildIndex();

    const totalStart = Date.now();
    const indexStart = Date.now();
    const queryKey = question.trim().toLowerCase();

    const cachedQuerySelection = this.hotQueryCache.get(queryKey);
    if (cachedQuerySelection && cachedQuerySelection.length > 0) {
      return this.finishResult(cachedQuerySelection, totalStart, indexStart, false);
    }

    const querySignature = this.guard.simHash128FromText(question, "query_");

    for (const hot of this.hotRing.values()) {
      const drift = this.queryGuard.evaluateDrift(querySignature, hot.signature);
      if (drift.hammingRatio < 0.1) {
        hot.frequency += 1;
        return this.finishResult([{ entry: hot, drift }], totalStart, indexStart, false);
      }
    }

    let best: { entry: IndexEntry; drift: DriftResult } | null = null;
    const topCandidates: Array<{ entry: IndexEntry; drift: DriftResult }> = [];
    const selected: Array<{ entry: IndexEntry; drift: DriftResult }> = [];

    for (const entry of this.index) {
      const drift = this.queryGuard.evaluateDrift(querySignature, entry.signature);
      const candidate = { entry, drift };

      if (!best || drift.hammingRatio < best.drift.hammingRatio) {
        best = candidate;
      }

      this.insertSorted(topCandidates, candidate, 3);
      if (drift.stable) this.insertSorted(selected, candidate, this.config.maxContextShards);
    }

    if (best && best.drift.hammingRatio > this.config.clarificationThreshold) {
      return {
        mode: "retrieve",
        silenced: true,
        clarificationNeeded: true,
        clarificationPrompt: this.buildClarificationPrompt(best, topCandidates),
        answer: null,
        citations: [],
        sourceTexts: [],
        metrics: {
          indexLookupMs: Date.now() - indexStart,
          cacheMisses: 0,
          inferenceMs: 0,
          totalMs: Date.now() - totalStart,
          shardsEvaluated: this.index.length,
          shardsSelected: 0
        }
      };
    }

    if (selected.length === 0) {
      return {
        mode: "retrieve",
        silenced: true,
        clarificationNeeded: false,
        answer: null,
        citations: [],
        sourceTexts: [],
        metrics: {
          indexLookupMs: Date.now() - indexStart,
          cacheMisses: 0,
          inferenceMs: 0,
          totalMs: Date.now() - totalStart,
          shardsEvaluated: this.index.length,
          shardsSelected: 0
        }
      };
    }

    this.rememberHotQuery(queryKey, selected);
    return this.finishResult(selected, totalStart, indexStart, false);
  }

  async query(question: string): Promise<QueryResult> {
    const retrieval = await this.retrieve(question);
    if (retrieval.silenced || retrieval.clarificationNeeded) return retrieval;

    if (!this.config.enableInference) {
      return {
        ...retrieval,
        mode: "retrieve",
        answer: null
      };
    }

    const inferenceStart = Date.now();
    const answer = await this.runInference(question, retrieval.sourceTexts);
    const inferenceMs = Date.now() - inferenceStart;

    return {
      ...retrieval,
      mode: "query",
      answer,
      metrics: {
        ...retrieval.metrics,
        inferenceMs,
        totalMs: retrieval.metrics.totalMs + inferenceMs
      }
    };
  }

  diagnostics(): Record<string, unknown> {
    return {
      indexSize: this.index.length,
      cacheSize: this.cache.size,
      cacheCapacity: this.config.cacheCapacity,
      queryThreshold: this.config.queryThreshold,
      clarificationThreshold: this.config.clarificationThreshold,
      indexFile: this.config.indexFile,
      shardDir: this.config.shardDir
    };
  }

  private async finishResult(
    selected: Array<{ entry: IndexEntry; drift: DriftResult }>,
    totalStart: number,
    indexStart: number,
    clarify: boolean
  ): Promise<QueryResult> {
    const indexLookupMs = Date.now() - indexStart;
    let cacheMisses = 0;
    const contextShards: CachedShard[] = [];

    for (const selectedShard of selected) {
      const entry = selectedShard.entry;
      let shard = this.cache.get(entry.shardId);
      if (!shard) {
        cacheMisses += 1;
        const shardPath = path.join(this.config.shardDir, `${entry.shardId}.json`);
        if (fs.existsSync(shardPath)) {
          const raw = JSON.parse(fs.readFileSync(shardPath, "utf-8")) as {
            id: string;
            source: string;
            content: string;
          };
          shard = { id: raw.id, source: raw.source, content: raw.content };
          this.cache.put(shard);
        }
      }
      if (shard) contextShards.push(shard);
    }

    const citations: QueryCitation[] = selected.map((row) => ({
      shardId: row.entry.shardId,
      source: row.entry.source,
      hammingRatio: row.drift.hammingRatio,
      contentPreview: row.entry.contentPreview
    }));

    const sourceTexts = contextShards.map((shard) => ({
      shardId: shard.id,
      source: shard.source,
      fullText: shard.content
    }));

    return {
      mode: "retrieve",
      silenced: false,
      clarificationNeeded: clarify,
      answer: null,
      citations,
      sourceTexts,
      metrics: {
        indexLookupMs,
        cacheMisses,
        inferenceMs: 0,
        totalMs: Date.now() - totalStart,
        shardsEvaluated: this.index.length,
        shardsSelected: selected.length
      }
    };
  }

  private buildClarificationPrompt(
    best: { entry: IndexEntry; drift: DriftResult },
    topCandidates: Array<{ entry: IndexEntry; drift: DriftResult }>
  ): string {
    const suggestions = topCandidates
      .map(
        (item, index) =>
          `${index + 1}. ${item.entry.title} [${item.entry.source}] (hamming=${item.drift.hammingRatio.toFixed(3)})`
      )
      .join("\n");

    return [
      "Your query appears ambiguous against current medical landmarks.",
      `Best match distance is ${best.drift.hammingRatio.toFixed(3)} (> ${this.config.clarificationThreshold}).`,
      "Please clarify by naming symptom set, condition, or emergency scenario.",
      "Closest candidates:",
      suggestions
    ].join("\n");
  }

  private insertSorted(
    bucket: Array<{ entry: IndexEntry; drift: DriftResult }>,
    candidate: { entry: IndexEntry; drift: DriftResult },
    limit: number
  ): void {
    let position = 0;
    while (position < bucket.length && bucket[position].drift.hammingRatio <= candidate.drift.hammingRatio) {
      position += 1;
    }
    bucket.splice(position, 0, candidate);
    if (bucket.length > limit) bucket.pop();
  }

  private rememberHotQuery(
    queryKey: string,
    selected: Array<{ entry: IndexEntry; drift: DriftResult }>
  ): void {
    this.hotQueryCache.set(queryKey, selected.map((item) => ({ entry: item.entry, drift: item.drift })));
    if (this.hotQueryCache.size > 256) {
      const firstKey = this.hotQueryCache.keys().next().value;
      if (firstKey) this.hotQueryCache.delete(firstKey);
    }
  }

  private rebalanceHotRing(): void {
    const sorted = [...this.index].sort((a, b) => b.frequency - a.frequency);
    const limit = Math.max(1, Math.ceil(this.index.length * this.hotPercent));
    this.hotRing.clear();
    for (let index = 0; index < limit; index++) {
      const entry = sorted[index];
      if (entry) this.hotRing.set(entry.shardId, entry);
    }
  }

  private async runInference(
    question: string,
    sourceTexts: Array<{ shardId: string; source: string; fullText: string }>
  ): Promise<string> {
    if (sourceTexts.length === 0) return "[NO_CITATIONS]";

    const context = sourceTexts.map((s, i) => `[Source ${i + 1}: ${s.source}/${s.shardId}]\n${s.fullText}`).join("\n\n");
    const prompt = [
      "You are a medical retrieval assistant.",
      "Answer only from provided sources and cite shard ids.",
      `Question: ${question}`,
      "Sources:",
      context
    ].join("\n\n");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.config.ollamaModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: this.config.maxResponseTokens
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) return `[INFERENCE_ERROR:${response.status}]`;

      const data = (await response.json()) as { response?: string };
      const answer = data.response?.trim();
      return answer && answer.length > 0 ? answer : "[NO_ANSWER_GENERATED]";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `[INFERENCE_ERROR:${message}]`;
    } finally {
      clearTimeout(timer);
    }
  }
}
