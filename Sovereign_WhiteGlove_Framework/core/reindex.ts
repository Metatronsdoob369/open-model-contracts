import path from "node:path";
import { fileURLToPath } from "node:url";
import { HuskEngine } from "./husk_engine.js";

const frameworkRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const shardDir = path.join(frameworkRoot, "data", "vector_blocks", "medical");
const indexFile = path.join(frameworkRoot, "data", "indices", "medical.index");

async function main(): Promise<void> {
  const engine = new HuskEngine({
    shardDir,
    indexFile,
    enableInference: false
  });

  await engine.buildIndex(15580);
  await engine.saveIndex(indexFile);
  console.log("Reindex complete:", engine.diagnostics());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
