#!/usr/bin/env tsx
/**
 * scripts/export-json-schema.ts
 *
 * Generates one JSON Schema file per entry in the OMC_REGISTRY.
 * Output goes to spec/json-schema/<contract-id>.schema.json.
 *
 * Usage:
 *   npm run gen:schema          # write files only when content changed
 *   npm run check:schema        # fail if git diff exists after generation
 *
 * Design notes:
 *   - Output is deterministic: keys are sorted, indent is 2 spaces.
 *   - Files are written only when the new content differs from what is on disk
 *     to avoid noisy diffs in CI.
 *   - The $id, title, description and version fields are injected from the
 *     registry entry metadata.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OMC_REGISTRY } from "../spec/contracts/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(REPO_ROOT, "spec", "json-schema");

// ─── Ensure output directory exists ──────────────────────────────────────────
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─── Generate one schema file per contract ────────────────────────────────────
let writtenCount = 0;
let skippedCount = 0;

for (const entry of Object.values(OMC_REGISTRY)) {
  const raw = zodToJsonSchema(entry.schema, {
    name: entry.id,
    $refStrategy: "none",
  });

  // Inject OMC top-level metadata
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: `https://open-model-contracts.dev/schemas/${entry.id}.schema.json`,
    title: entry.id,
    description: entry.description,
    "x-omc-version": entry.version,
    "x-omc-capabilities": entry.capabilities ?? [],
    ...(raw as Record<string, unknown>),
  };

  // Remove the wrapping "name" key added by zodToJsonSchema when given a name
  // (it nests the schema under a definitions key — we want a flat document)
  const schemaRecord = schema as Record<string, unknown>;
  const flat: Record<string, unknown> =
    typeof schemaRecord.definitions === "object" && schemaRecord[entry.id]
      ? { ...schemaRecord, ...(schemaRecord[entry.id] as Record<string, unknown>) }
      : schemaRecord;

  // Sort keys for deterministic output
  const sorted = sortKeys(flat);
  const content = JSON.stringify(sorted, null, 2) + "\n";

  const outputPath = join(OUTPUT_DIR, `${entry.id}.schema.json`);

  // Only write if content changed (avoids noisy git diffs)
  if (existsSync(outputPath) && readFileSync(outputPath, "utf8") === content) {
    skippedCount++;
    continue;
  }

  writeFileSync(outputPath, content, "utf8");
  writtenCount++;
  console.log(`  ✔ wrote ${outputPath.replace(REPO_ROOT + "/", "")}`);
}

console.log(
  `\ngen:schema — ${writtenCount} written, ${skippedCount} unchanged.`
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively sorts the keys of a plain object so JSON output is deterministic.
 * Arrays and primitives are returned as-is; only plain objects are sorted.
 */
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== "object" || obj === null) return obj;

  const record = obj as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((k) => [k, sortKeys(record[k])])
  );
}
