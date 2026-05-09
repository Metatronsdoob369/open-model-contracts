#!/usr/bin/env npx tsx
/**
 * ingest-spectral-3072.ts
 * Ingest canonical + repaired Luau files into spectral-heatmap (3072-D)
 * Embeddings: Ollama mxbai-embed-large (1024-D) -> [v, v, v] = 3072-D
 * AMEM protocol: Eve_v2
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const QDRANT_URL = 'http://127.0.0.1:6340';
const COLLECTION  = 'spectral-heatmap';
const OLLAMA_URL  = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'mxbai-embed-large';

const ROOT = path.resolve(import.meta.dirname, '..');

// ── Canonical source files ─────────────────────────────────────
const CANONICAL_FILES = [
  { rel: 'src/canonical/Marsh_Messy_Drop.lua',        genre: 'obby',    kind: 'canonical' },
  { rel: 'src/canonical/Metropolis_PizzaService.lua',  genre: 'tycoon',  kind: 'canonical' },
  { rel: 'src/canonical/PizzaPlace_GameService.lua',   genre: 'tycoon',  kind: 'canonical' },
  { rel: 'src/canonical/TagGameClient.lua',            genre: 'tag',     kind: 'canonical' },
  { rel: 'src/canonical/VictimService.luau',           genre: 'tag',     kind: 'canonical' },
  { rel: 'src/canonical/partner_superbullet.lua',      genre: 'shooter', kind: 'canonical' },
  { rel: 'src/canonical/test_slop.lua',                genre: 'utility', kind: 'canonical' },
];

const REPAIRED_FILES = [
  { rel: 'repaired/GameService_REPAIRED.lua',                   genre: 'tycoon',  kind: 'repaired' },
  { rel: 'repaired/GothTag_GameService_FINISHER_REPAIRED.lua',  genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/GothTag_GameService_INFILL_REPAIRED.lua',    genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/GothTag_TagControl_FINAL.lua',               genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/GothTag_TagControl_FINISHER_REPAIRED.lua',   genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/GothTag_TagControl_INFILL_REPAIRED.lua',     genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/Marsh_Messy_Drop_REPAIRED.lua',              genre: 'obby',    kind: 'repaired' },
  { rel: 'repaired/Metropolis_PizzaService_REPAIRED.lua',       genre: 'tycoon',  kind: 'repaired' },
  { rel: 'repaired/PizzaPlace_GameService_REPAIRED.lua',        genre: 'tycoon',  kind: 'repaired' },
  { rel: 'repaired/TagGameClient_REPAIRED.lua',                 genre: 'tag',     kind: 'repaired' },
  { rel: 'repaired/partner_superbullet_REPAIRED.lua',           genre: 'shooter', kind: 'repaired' },
  { rel: 'repaired/test_slop_REPAIRED.lua',                     genre: 'utility', kind: 'repaired' },
];

const ALL_FILES = [...CANONICAL_FILES, ...REPAIRED_FILES];

// ── Eve_v2 Sector Weights ──────────────────────────────────────
const SECTOR_WEIGHTS: Record<string, number> = {
  OMC_Threading:       0.95,
  OMC_DataStore_Queue: 0.90,
  OMC_Governance:      0.98,
  Client_Visual:       0.40,
  Mock_TestLayer:      0.70,
};

// ── Helpers ────────────────────────────────────────────────────
function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function tripleConcat(v: number[]): number[] {
  // [v, v, v] = 3072-D per AMEM spec
  return [...v, ...v, ...v];
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, la = 0, lb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    la  += a[i] * a[i];
    lb  += b[i] * b[i];
  }
  return la > 0 && lb > 0 ? dot / (Math.sqrt(la) * Math.sqrt(lb)) : 0;
}

function computeShatter(vec: number[]): number {
  // Manhattan resonance from unit centroid
  const mean = vec.reduce((s, v) => s + v, 0) / vec.length;
  return vec.reduce((s, v) => s + Math.abs(v - mean), 0) / vec.length;
}

function scoreSectors(code: string): Record<string, number> {
  const scores: Record<string, number> = {};
  const len = code.length;
  scores['OMC_Threading']       = (code.match(/task\.|coroutine\.|spawn\(/g) || []).length / (len / 1000);
  scores['OMC_DataStore_Queue'] = (code.match(/DataStore|MemoryStore|Queue/g) || []).length / (len / 1000);
  scores['OMC_Governance']      = (code.match(/pcall|xpcall|error\(|warn\(/g) || []).length / (len / 1000);
  scores['Client_Visual']       = (code.match(/TweenService|gui|Gui|ScreenGui|BillboardGui/g) || []).length / (len / 1000);
  scores['Mock_TestLayer']      = (code.match(/test|mock|stub|spy|assert/gi) || []).length / (len / 1000);
  return scores;
}

// ── Ollama embed ───────────────────────────────────────────────
async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const json = await res.json() as { embeddings: number[][] };
  return json.embeddings[0];
}

// ── Qdrant upsert ──────────────────────────────────────────────
async function upsertPoint(id: number, vector: number[], payload: Record<string, unknown>) {
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: [{ id, vector, payload }] }),
  });
  if (!res.ok) throw new Error(`Qdrant upsert error: ${res.status} ${await res.text()}`);
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`\n💎 [SPECTRAL INGEST] spectral-heatmap @ 3072-D`);
  console.log(`   Ollama: ${OLLAMA_URL} | Model: ${OLLAMA_MODEL}`);
  console.log(`   Qdrant: ${QDRANT_URL} | Collection: ${COLLECTION}`);
  console.log(`   Files to ingest: ${ALL_FILES.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const [idx, file] of ALL_FILES.entries()) {
    const absPath = path.join(ROOT, file.rel);
    if (!fs.existsSync(absPath)) {
      console.warn(`  ⚠️  SKIP (not found): ${file.rel}`);
      failCount++;
      continue;
    }

    const code = fs.readFileSync(absPath, 'utf8');
    const fileName = path.basename(file.rel);

    process.stdout.write(`  [${idx + 1}/${ALL_FILES.length}] ${fileName} ... `);

    try {
      const vec1024 = await embed(code.slice(0, 8000)); // Ollama token limit guard
      const vec3072 = tripleConcat(vec1024);
      const shatter  = computeShatter(vec1024);
      const sectors  = scoreSectors(code);
      const pointId  = parseInt(sha256(file.rel).slice(0, 8), 16);

      const payload = {
        file:       file.rel,
        fileName,
        kind:       file.kind,
        genre:      file.genre,
        heat:       0,
        shatter,
        sectorScores: sectors,
        deltaVector3d: null,
        nearestCanonicalId:    null,
        nearestCanonicalScore: null,
        vectorDim:  3072,
        embeddingModel: OLLAMA_MODEL,
        ingestedAt: Date.now(),
        byteSize:   code.length,
      };

      await upsertPoint(pointId, vec3072, payload);
      console.log(`✅  shatter=${shatter.toFixed(4)}`);
      successCount++;
    } catch (err) {
      console.log(`❌  ${err}`);
      failCount++;
    }
  }

  console.log(`\n🏁 [DONE] ${successCount} ingested, ${failCount} failed`);
  console.log(`   Collection: ${QDRANT_URL}/collections/${COLLECTION}`);
}

main().catch(console.error);
