#!/usr/bin/env tsx
/**
 * stage-ai-corpus.ts
 * Flatten AI-MCP-PLUGIN-Creations run dirs → corpus/ai-generated/
 * Content-hash dedup: same bytes = skip, regardless of filename.
 * Safe to re-run at any time.
 */

import { createHash } from 'crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, basename, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC  = join(ROOT, 'AI-MCP-PLUGIN-Creations');
const DEST = join(ROOT, 'corpus', 'ai-generated');

mkdirSync(DEST, { recursive: true });

const seenHashes = new Set<string>();
let staged = 0;
let dupes  = 0;
let skipped = 0;

// Collect existing hashes in dest so re-runs don't re-stage
if (existsSync(DEST)) {
  for (const f of readdirSync(DEST)) {
    if (extname(f) !== '.lua') continue;
    const content = readFileSync(join(DEST, f));
    seenHashes.add(createHash('sha256').update(content).digest('hex'));
  }
}

// Walk run dirs
for (const runId of readdirSync(SRC)) {
  const runDir = join(SRC, runId);
  try {
    if (!statSync(runDir).isDirectory()) continue;
  } catch {
    continue;
  }

  for (const file of readdirSync(runDir)) {
    if (extname(file) !== '.lua') continue;

    const srcPath = join(runDir, file);
    const content = readFileSync(srcPath);
    const hash    = createHash('sha256').update(content).digest('hex');

    if (seenHashes.has(hash)) {
      dupes++;
      continue;
    }
    seenHashes.add(hash);

    // Dest filename: runId-prefix + original name (avoids collisions across runs)
    const shortId = runId.slice(0, 8);
    const destName = `${shortId}-${basename(file)}`;
    const destPath = join(DEST, destName);

    writeFileSync(destPath, content);
    staged++;
  }
}

console.log(`✓ Staged ${staged} files → corpus/ai-generated/`);
console.log(`  Dupes caught: ${dupes}`);
console.log(`  Output dir: ${DEST}`);
console.log(`  Total unique in corpus: ${staged + (seenHashes.size - staged - dupes < 0 ? 0 : seenHashes.size - staged - dupes)}`);
