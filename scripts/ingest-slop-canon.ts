#!/usr/bin/env npx tsx
/**
 * ingest-slop-canon.ts
 * Parse SLOP_CANON.md, embed each entry via Ollama (1024-D), upsert to Qdrant slop-canon collection.
 * Incremental: tracks last-ingested hash per sc_id in .slop-canon-state.json
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const QDRANT_URL  = 'http://127.0.0.1:6340';
const COLLECTION  = 'slop-canon';
const OLLAMA_URL  = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'mxbai-embed-large';

const ROOT        = path.resolve(import.meta.dirname, '..');
const CANON_FILE  = path.join(ROOT, 'SLOP_CANON.md');
const STATE_FILE  = path.join(ROOT, '.slop-canon-state.json');

interface SlopEntry {
  sc_id:   string;
  title:   string;
  status:  string;
  date:    string;
  text:    string;
}

// ── Parse SLOP_CANON.md ────────────────────────────────────────
function parseCanon(md: string): SlopEntry[] {
  const entries: SlopEntry[] = [];
  // Split on ## [SC-XXX] headers
  const blocks = md.split(/\n(?=## \[SC-)/);

  for (const block of blocks) {
    const idMatch    = block.match(/^## \[(SC-\d+)\] (.+)/);
    if (!idMatch) continue;

    const sc_id  = idMatch[1];
    const title  = idMatch[2].trim();
    const date   = block.match(/\*\*Date\*\*:\s*(.+)/)?.[1]?.trim() ?? 'unknown';
    const status = block.match(/\*\*Status\*\*:\s*(.+)/)?.[1]?.trim() ?? 'unknown';

    // Truncate to 1000 chars to stay within Ollama context window
    const text = block.trim().slice(0, 1000);
    entries.push({ sc_id, title, status, date, text });
  }

  return entries;
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
  if (!res.ok) throw new Error(`Qdrant error: ${res.status} ${await res.text()}`);
}

// ── Search mode ────────────────────────────────────────────────
async function search(query: string) {
  console.log(`\n🔍 Searching slop-canon: "${query}"\n`);
  const vec = await embed(query);

  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vector: vec, limit: 3, with_payload: true }),
  });
  const json = await res.json() as { result: { score: number; payload: SlopEntry }[] };

  for (const hit of json.result) {
    console.log(`[${hit.payload.sc_id}] ${hit.payload.title}  (score: ${hit.score.toFixed(4)})`);
    console.log(`  Status: ${hit.payload.status} | Date: ${hit.payload.date}`);
    console.log(`  ${hit.payload.text.split('\n').slice(0, 3).join(' ').slice(0, 160)}...\n`);
  }
}

// ── Main ingest ────────────────────────────────────────────────
async function ingest() {
  const md      = fs.readFileSync(CANON_FILE, 'utf8');
  const entries = parseCanon(md);
  const state   = fs.existsSync(STATE_FILE)
    ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as Record<string, string>
    : {};

  console.log(`\n⚡ [SLOP CANON INGEST] ${entries.length} entries found\n`);

  let ingested = 0;
  let skipped  = 0;

  for (const entry of entries) {
    const hash = crypto.createHash('sha256').update(entry.text).digest('hex').slice(0, 16);

    if (state[entry.sc_id] === hash) {
      console.log(`  ⏭️  ${entry.sc_id} — unchanged, skipping`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ⚡ ${entry.sc_id}: ${entry.title} ... `);
    const vec   = await embed(entry.text);
    const numId = parseInt(crypto.createHash('sha256').update(entry.sc_id).digest('hex').slice(0, 8), 16);

    await upsertPoint(numId, vec, {
      sc_id:  entry.sc_id,
      title:  entry.title,
      status: entry.status,
      date:   entry.date,
      text:   entry.text,
      ingestedAt: Date.now(),
    });

    state[entry.sc_id] = hash;
    console.log(`✅`);
    ingested++;
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`\n🏁 [DONE] ${ingested} ingested, ${skipped} skipped`);
  console.log(`   Collection: ${QDRANT_URL}/collections/${COLLECTION}`);
}

// ── CLI dispatch ───────────────────────────────────────────────
const [,, cmd, ...args] = process.argv;

if (cmd === 'search') {
  search(args.join(' ')).catch(console.error);
} else {
  ingest().catch(console.error);
}
