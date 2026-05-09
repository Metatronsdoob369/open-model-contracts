import path from "node:path";
import { HuskEngine } from "./husk_engine.js";

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

async function main(): Promise<void> {
  const frameworkRoot = path.resolve(process.cwd());
  const shardDir = path.join(frameworkRoot, "data", "vector_blocks", "medical");
  const indexFile = path.join(frameworkRoot, "data", "indices", "medical.index");

  const query =
    process.argv.slice(2).join(" ").trim() ||
    "C. diff Infections | C. difficile | MedlinePlus Skip navigation An official website of the United States government Here’s how you know Here’s how you know Official websites use .gov A .gov website belongs to an official";

  const runs = 50;
  const engine = new HuskEngine({ shardDir, indexFile, enableInference: false });

  const loaded = await engine.loadIndex(indexFile);
  if (!loaded) {
    throw new Error(`Index not found at ${indexFile}. Run reindex first.`);
  }

  const cold = await engine.retrieve(query);

  const warmTimes: number[] = [];
  for (let index = 0; index < runs; index++) {
    const out = await engine.retrieve(query);
    warmTimes.push(out.metrics.totalMs);
  }

  const report = {
    query,
    cold: {
      totalMs: cold.metrics.totalMs,
      clarificationNeeded: cold.clarificationNeeded,
      shardsSelected: cold.metrics.shardsSelected
    },
    warm: {
      runs,
      minMs: Math.min(...warmTimes),
      maxMs: Math.max(...warmTimes),
      p50Ms: percentile(warmTimes, 0.5),
      p95Ms: percentile(warmTimes, 0.95),
      meanMs: Number((warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length).toFixed(2)),
      under100Count: warmTimes.filter((ms) => ms < 100).length
    },
    requirement: {
      targetMs: 100,
      p95Pass: percentile(warmTimes, 0.95) < 100,
      allRunsPass: warmTimes.every((ms) => ms < 100)
    }
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
