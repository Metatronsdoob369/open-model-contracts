#!/usr/bin/env tsx
/**
 * src/staging/stage.ts — Staging Pipeline CLI
 *
 * Usage:
 *   npx tsx src/staging/stage.ts --file path/to/file.lua
 *   npx tsx src/staging/stage.ts --jsonl path/to/records.jsonl
 *   npx tsx src/staging/stage.ts --dir src/canonical
 *   npx tsx src/staging/stage.ts --inline "local x = game.Players.LocalPlayer"
 *
 * Sectors: web, luau, crypto, arb
 */

import { ingestFile, ingestInline, ingestDirectory, ingestJsonl, StagedInput } from './ingest.js';
import { embedAndShatter, CanonicalPayload } from './embed-and-shatter.js';

const QDRANT_URL = 'http://localhost:6340';
let COLLECTION = 'spectral-heatmap';
let CURRENT_SECTOR = '';

const SECTOR_MAP: Record<string, string> = {
  'web': 'vuln-heatmap',
  'luau': 'spectral-heatmap',
  'crypto': 'crypto-heatmap',
  'arb': 'arb-heatmap'
};

// Sector → Pi handler endpoint
const SECTOR_HANDLER: Record<string, string> = {
  'arb': 'http://100.113.215.46:5000/arb',
  'web': 'http://100.113.215.46:5001/vuln',
};

const MAC_TAILSCALE_IP = '100.77.14.97';

// ── Qdrant upsert ─────────────────────────────────────────────────────────────

async function upsertToQdrant(payload: CanonicalPayload): Promise<boolean> {
  const numericId = Math.abs(
    Array.from(payload.id).reduce((hash, ch) => (Math.imul(31, hash) + ch.charCodeAt(0)) | 0, 0)
  );

  const bodyWithNumId = JSON.stringify({
    points: [{ id: numericId, vector: payload.vector, payload: { ...payload.payload, stagingId: payload.id } }],
  });

  try {
    const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: bodyWithNumId,
    });

    if (res.ok) {
      console.log(`[staging] Upserted → Qdrant id=${numericId}  collection=${COLLECTION}`);
      return true;
    } else {
      const text = await res.text();
      console.error(`[staging] Qdrant upsert failed: ${res.status} ${text}`);
      return false;
    }
  } catch (err) {
    console.error(`[staging] Qdrant unreachable: ${err}`);
    return false;
  }
}

// ── Pi handler forward ────────────────────────────────────────────────────────

async function forwardToHandler(payload: CanonicalPayload): Promise<void> {
  const handlerUrl = SECTOR_HANDLER[CURRENT_SECTOR];
  if (!handlerUrl) return;

  const p = payload.payload;
  const body = JSON.stringify({
    heat: p.heat,
    shatter: p.shatter,
    shatterMap: p.shatterMap,
    nearestCanonicalId: p.nearestCanonicalId,
    nearestCanonicalScore: p.nearestCanonicalScore,
    content: p.content,
    source: p.source,
    room: p.room,
  });

  try {
    const res = await fetch(handlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (res.ok) {
      const json = await res.json() as { status?: string; brief?: string };
      console.log(`[staging] Pi handler → ${json.status?.toUpperCase() ?? 'ok'}  brief: ${json.brief?.substring(0, 80) ?? ''}`);
    } else {
      console.warn(`[staging] Pi handler returned ${res.status}`);
    }
  } catch (err) {
    console.warn(`[staging] Pi handler unreachable (${handlerUrl}): ${err}`);
  }
}

// ── Print canonical summary ───────────────────────────────────────────────────

function printSummary(payload: CanonicalPayload): void {
  const p = payload.payload;
  console.log('\n── Canonical Staging Summary ───────────────────────────────');
  console.log(`  id        : ${payload.id}`);
  console.log(`  collection: ${COLLECTION}`);
  console.log(`  source    : ${p.source}`);
  console.log(`  kind      : ${p.kind}`);
  console.log(`  room      : ${p.room}`);
  console.log(`  vectorDim : ${p.vectorDim}`);
  console.log(`  heat      : ${p.heat.toFixed(4)}  (proximity to canonical top-1%)`);
  console.log(`  shatter   : ${p.shatter.toFixed(4)}  (dispersion velocity across space)`);
  console.log(`  nearest   : ${p.nearestCanonicalId ?? 'none'}  (score=${p.nearestCanonicalScore?.toFixed(4) ?? 'n/a'})`);
  console.log(`  shatterMap: [${p.shatterMap.map(v => v.toFixed(3)).join(', ')}]`);
  console.log('────────────────────────────────────────────────────────────\n');
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

async function runPipeline(inputs: StagedInput[]): Promise<void> {
  console.log(`\n[staging] Pipeline start — ${inputs.length} input(s) — Target: ${COLLECTION}\n`);

  for (const input of inputs) {
    try {
      const payload = await embedAndShatter(input, { collection: COLLECTION });
      await upsertToQdrant(payload);
      await forwardToHandler(payload);
      printSummary(payload);
    } catch (err) {
      console.error(`[staging] Failed for ${input.source}: ${err}`);
    }
  }

  console.log(`[staging] Pipeline complete.`);
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  npx tsx src/staging/stage.ts --file <path> [--collection <name> | --sector <type>]
  npx tsx src/staging/stage.ts --jsonl <path> [--collection <name> | --sector <type>]
  npx tsx src/staging/stage.ts --dir <directory> [--collection <name> | --sector <type>]
  npx tsx src/staging/stage.ts --inline "<text>" [--collection <name> | --sector <type>]

Sectors: web, luau, crypto, arb
    `);
    process.exit(0);
  }

  let inputs: StagedInput[] = [];

  // Simple arg parser
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') { inputs = [ingestFile(args[++i])]; }
    else if (args[i] === '--jsonl') { inputs = ingestJsonl(args[++i]); }
    else if (args[i] === '--dir') { inputs = ingestDirectory(args[++i]); }
    else if (args[i] === '--inline') { inputs = [ingestInline(args[++i])]; }
    else if (args[i] === '--collection') { COLLECTION = args[++i]; }
    else if (args[i] === '--sector') {
      const sector = args[++i];
      CURRENT_SECTOR = sector;
      COLLECTION = SECTOR_MAP[sector] || COLLECTION;
    }
  }

  if (inputs.length === 0) {
    console.error(`No inputs provided.`);
    process.exit(1);
  }

  await runPipeline(inputs);
}

main().catch((err) => {
  console.error('[staging] Fatal:', err);
  process.exit(1);
});
