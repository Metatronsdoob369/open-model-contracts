#!/usr/bin/env node
/**
 * index-cif-logs.cjs — Eve_v2 Protocol
 *
 * Indexes OMC session logs into Qdrant 'cif-memory' collection.
 * Embeddings: Ollama /api/embed (batch endpoint) → [v,v,v] = 3072-D tripleConcat
 * AMEM spec: Eve_v2 (matches ingest-spectral-3072.ts house logic)
 * Idempotent via sidecar hash tracking.
 *
 * Usage:
 *   node scripts/index-cif-logs.cjs           # index all new content
 *   node scripts/index-cif-logs.cjs search "query"
 *   node scripts/index-cif-logs.cjs stats
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const ROOT        = '/Users/joewales/NODE_OUT_Master/open-model-contracts';
const QDRANT_URL  = process.env.QDRANT_URL  || 'http://127.0.0.1:6340';
const OLLAMA_URL  = process.env.OLLAMA_URL  || 'http://127.0.0.1:11434';
const COLLECTION  = 'cif-memory';
const EMBED_MODEL = 'mxbai-embed-large';
const EMBED_DIMS  = 3072;   // Eve_v2: tripleConcat [v,v,v]
const CHUNK_LINES = 20;
const SIDECAR     = path.join(ROOT, 'scripts', '.cif-indexed.json');

const LOG_SOURCES = [
  { file: 'dashboard/server.log',     source: 'TELEMETRY' },
  { file: 'circadian.log',            source: 'CIRCADIAN' },
  { file: 'server/bridge/bridge.log', source: 'BRIDGE'    },
  { file: 'server.log',               source: 'SERVER'    },
];

// ── Eve_v2: tripleConcat 1024→3072 ───────────────────────────────
function tripleConcat(v) {
  return [...v, ...v, ...v];
}

// ── Ollama /api/embed (batch endpoint, faster than /api/embeddings) ──
async function embedBatch(texts) {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const j = await res.json();
  // Returns { embeddings: number[][] }
  if (!j.embeddings) throw new Error('No embeddings in response: ' + JSON.stringify(j));
  return j.embeddings;  // array of 1024-D vectors
}

// ── Chunk file into line-groups ──────────────────────────────────
function chunkFile(filePath, sourceName) {
  const raw = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());
  const chunks = [];
  for (let i = 0; i < raw.length; i += CHUNK_LINES) {
    const lines = raw.slice(i, i + CHUNK_LINES);
    const text  = lines.join('\n');
    const id    = crypto.createHash('sha256')
                    .update(sourceName + ':' + i + ':' + text)
                    .digest('hex').slice(0, 16);
    chunks.push({ id, text, source: sourceName, lineStart: i, lineEnd: i + lines.length });
  }
  return chunks;
}

// ── Sidecar ──────────────────────────────────────────────────────
function loadIndexed() {
  if (!fs.existsSync(SIDECAR)) return {};
  try { return JSON.parse(fs.readFileSync(SIDECAR, 'utf-8')); } catch { return {}; }
}
function saveIndexed(map) {
  fs.writeFileSync(SIDECAR, JSON.stringify(map, null, 2));
}

// ── Qdrant ───────────────────────────────────────────────────────
async function ensureCollection() {
  const check = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
  if (check.ok) {
    const d = await check.json();
    if (d.result) { console.log(`Collection '${COLLECTION}' exists — ${d.result.points_count} pts`); return; }
  }
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors: { size: EMBED_DIMS, distance: 'Cosine' }, on_disk_payload: true }),
  });
  if (!res.ok) throw new Error('Collection create failed: ' + await res.text());
  console.log(`Collection '${COLLECTION}' created (${EMBED_DIMS}d / Eve_v2 tripleConcat, Cosine)`);
}

async function upsertBatch(points) {
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  });
  if (!res.ok) throw new Error('Upsert failed: ' + await res.text());
}

async function searchVault(query, limit = 6) {
  const vecs  = await embedBatch([query]);
  const vec3072 = tripleConcat(vecs[0]);
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vector: vec3072, limit, with_payload: true }),
  });
  const d = await res.json();
  return d.result || [];
}

async function stats() {
  const res  = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
  const data = await res.json();
  const r    = data.result;
  console.log(`\nCollection: ${COLLECTION}`);
  console.log(`  Points:   ${r.points_count}`);
  console.log(`  Dims:     ${EMBED_DIMS} (Eve_v2 tripleConcat)`);
  console.log(`  Status:   ${r.status}`);
}

// ── Main: embed new chunks in batches of 10 ──────────────────────
async function indexAll() {
  const indexed = loadIndexed();
  let totalNew  = 0;

  await ensureCollection();

  for (const { file, source } of LOG_SOURCES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) { console.log(`  SKIP (not found): ${file}`); continue; }

    const chunks  = chunkFile(full, source);
    const toIndex = chunks.filter(c => !indexed[c.id]);

    if (toIndex.length === 0) {
      console.log(`  ${source}: up to date (${chunks.length} chunks)`);
      continue;
    }

    console.log(`  ${source}: ${toIndex.length} new chunks (batch mode)...`);
    const BATCH = 10;

    for (let i = 0; i < toIndex.length; i += BATCH) {
      const batch   = toIndex.slice(i, i + BATCH);
      const texts   = batch.map(c => c.text);

      try {
        const vecs1024 = await embedBatch(texts);   // single HTTP call for up to 10 texts
        const points   = vecs1024.map((v1024, j) => {
          const chunk    = batch[j];
          const vec3072  = tripleConcat(v1024);
          const numId    = parseInt(chunk.id.slice(0, 12), 16) % Number.MAX_SAFE_INTEGER;
          indexed[chunk.id] = { source, indexed_at: new Date().toISOString() };
          return {
            id: numId,
            vector: vec3072,
            payload: {
              source:     chunk.source,
              text:       chunk.text,
              line_start: chunk.lineStart,
              line_end:   chunk.lineEnd,
              file,
              indexed_at: new Date().toISOString(),
              type:       'cif_log',
              vectorDim:  EMBED_DIMS,
              protocol:   'Eve_v2',
            },
          };
        });

        await upsertBatch(points);
        process.stdout.write(`  [${Math.min(i + BATCH, toIndex.length)}/${toIndex.length}]\r`);
        totalNew += batch.length;
      } catch (e) {
        console.error(`\n  Batch ${i}-${i+BATCH} failed: ${e.message}`);
      }
    }
    console.log(`  ${source}: done (${toIndex.length} chunks)                `);
  }

  saveIndexed(indexed);
  console.log(`\nTotal new chunks indexed: ${totalNew}`);
  await stats();
}

// ── CLI ───────────────────────────────────────────────────────────
const cmd = process.argv[2];

if (cmd === 'search') {
  const q = process.argv.slice(3).join(' ');
  if (!q) { console.error('Usage: node index-cif-logs.cjs search "query"'); process.exit(1); }
  searchVault(q).then(results => {
    console.log(`\nCIF Memory search: "${q}"\n`);
    for (const r of results) {
      const p = r.payload;
      console.log(`[${p.source}] score: ${r.score.toFixed(3)} | lines ${p.line_start}-${p.line_end}`);
      console.log(`  ${p.text.slice(0, 300).replace(/\n/g, ' | ')}`);
      console.log();
    }
  }).catch(console.error);
} else if (cmd === 'stats') {
  stats().catch(console.error);
} else {
  indexAll().catch(e => { console.error('Index failed:', e.message); process.exit(1); });
}
