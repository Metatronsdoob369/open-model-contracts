#!/usr/bin/env node
/**
 * embed-slop-canon.js
 *
 * Parses SLOP_CANON.md, embeds each SC entry via Ollama (local, no outbound),
 * upserts into Qdrant collection 'slop-canon'.
 *
 * Idempotent: tracks embedded entry IDs in a sidecar JSON file.
 * Only embeds entries with Status != EMBEDDED.
 *
 * Usage:
 *   node embed-slop-canon.js          # embed new/updated entries
 *   node embed-slop-canon.js search "query"  # search the vault
 *   node embed-slop-canon.js stats    # collection stats
 *
 * Same infra as CIF Memory Vault (indexer.js) — Ollama + Qdrant, zero cloud.
 */

const fs = require('fs');
const path = require('path');

const SLOP_CANON_PATH = '/Users/joewales/NODE_OUT_Master/open-model-contracts/SLOP_CANON.md';
const SIDECAR_PATH    = '/Users/joewales/NODE_OUT_Master/open-model-contracts/scripts/.slop-canon-embedded.json';
const QDRANT_URL      = process.env.QDRANT_URL || 'http://127.0.0.1:6340';
const OLLAMA_URL      = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const COLLECTION      = 'slop-canon';
const EMBED_MODEL     = 'mxbai-embed-large';
const EMBED_DIMS      = 1024;

// ── Parse SLOP_CANON.md into structured entries ─────────────────────────────

function parseSlopCanon(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const entries = [];

  // Split on ## [SC-XXX] headers
  const sections = raw.split(/\n(?=## \[SC-)/);

  for (const section of sections) {
    const idMatch   = section.match(/## \[SC-(\d+)\]\s+(.+)/);
    if (!idMatch) continue;

    const scNumber  = parseInt(idMatch[1], 10);
    const title     = idMatch[2].trim();
    const statusM   = section.match(/\*\*Status\*\*:\s*(.+)/);
    const problemM  = section.match(/\*\*Problem\*\*:\s*(.+)/);
    const fixM      = section.match(/\*\*(?:Correction|Fix|Proper fix)\*\*:\s*(.+)/);
    const lessonM   = section.match(/\*\*Lesson\*\*:\s*(.+)/);
    const dateM     = section.match(/\*\*Date\*\*:\s*(.+)/);
    const signalsM  = section.match(/\*\*Matched signals\*\*:\s*`(.+?)`/);
    const symptomM  = section.match(/\*\*Symptom\*\*:\s*(.+)/);

    const status = statusM ? statusM[1].trim() : 'UNKNOWN';

    // Build rich text chunk for embedding
    const chunkParts = [
      `SLOP CANON ENTRY SC-${scNumber.toString().padStart(3, '0')}`,
      `Title: ${title}`,
      `Status: ${status}`,
    ];

    if (dateM)    chunkParts.push(`Date: ${dateM[1].trim()}`);
    if (symptomM) chunkParts.push(`Symptom: ${symptomM[1].trim()}`);
    if (problemM) chunkParts.push(`Problem: ${problemM[1].trim()}`);
    if (fixM)     chunkParts.push(`Fix: ${fixM[1].trim()}`);
    if (lessonM)  chunkParts.push(`Lesson: ${lessonM[1].trim()}`);
    if (signalsM) chunkParts.push(`Signals: ${signalsM[1].trim()}`);

    // Include raw section body for full context
    chunkParts.push('\nFull entry:\n' + section.trim().substring(0, 1200));

    entries.push({
      scNumber,
      title,
      status,
      date: dateM ? dateM[1].trim() : null,
      text: chunkParts.join('\n'),
      rawSection: section.trim(),
    });
  }

  return entries;
}

// ── Sidecar: track what's been embedded ─────────────────────────────────────

function loadEmbedded() {
  if (!fs.existsSync(SIDECAR_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(SIDECAR_PATH, 'utf-8'));
  } catch { return {}; }
}

function saveEmbedded(map) {
  fs.mkdirSync(path.dirname(SIDECAR_PATH), { recursive: true });
  fs.writeFileSync(SIDECAR_PATH, JSON.stringify(map, null, 2));
}

// ── Ollama embedding ─────────────────────────────────────────────────────────

async function getEmbedding(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text.substring(0, 8000) })
  });
  const json = await res.json();
  if (!json.embedding) throw new Error(`Embed failed: ${JSON.stringify(json)}`);
  return json.embedding;
}

// ── Qdrant operations ────────────────────────────────────────────────────────

async function ensureCollection() {
  const check = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
  if (check.ok) {
    const data = await check.json();
    if (data.result) {
      console.log(`Collection '${COLLECTION}' exists — ${data.result.points_count} points`);
      return;
    }
  }

  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vectors: { size: EMBED_DIMS, distance: 'Cosine' },
      on_disk_payload: true
    })
  });
  if (!res.ok) throw new Error(`Collection create failed: ${await res.text()}`);
  console.log(`Collection '${COLLECTION}' created (${EMBED_DIMS} dims, Cosine)`);
}

async function upsertPoint(scNumber, vector, payload) {
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points: [{ id: scNumber, vector, payload }]
    })
  });
  if (!res.ok) throw new Error(`Upsert SC-${scNumber} failed: ${await res.text()}`);
}

async function searchVault(query, limit = 6) {
  const vector = await getEmbedding(query);
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vector, limit, with_payload: true })
  });
  const data = await res.json();
  return data.result || [];
}

async function stats() {
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
  const data = await res.json();
  const r = data.result;
  console.log(`\nCollection: ${COLLECTION}`);
  console.log(`  Qdrant:   ${QDRANT_URL}`);
  console.log(`  Embedder: Ollama/${EMBED_MODEL} (local)`);
  console.log(`  Points:   ${r.points_count}`);
  console.log(`  Status:   ${r.status}`);
}

// ── Main: embed new entries ──────────────────────────────────────────────────

async function embedNew() {
  if (!fs.existsSync(SLOP_CANON_PATH)) {
    console.log(`SLOP_CANON.md not found at ${SLOP_CANON_PATH}`);
    process.exit(0);
  }

  const entries = parseSlopCanon(SLOP_CANON_PATH);
  console.log(`Parsed ${entries.length} SC entries from SLOP_CANON.md`);

  const embedded = loadEmbedded();

  // Filter: skip already-embedded entries unless status changed
  const toEmbed = entries.filter(e => {
    const prev = embedded[e.scNumber];
    if (!prev) return true;  // new entry
    if (prev.status !== e.status) return true;  // status changed (e.g. UNRESOLVED → RESOLVED)
    return false;
  });

  if (toEmbed.length === 0) {
    console.log('No new entries to embed. Vault is current.');
    await stats();
    return;
  }

  console.log(`\nEmbedding ${toEmbed.length} entries...\n`);
  await ensureCollection();

  let success = 0;
  for (const entry of toEmbed) {
    try {
      process.stdout.write(`  SC-${entry.scNumber} "${entry.title.substring(0, 50)}"... `);
      const vector = await getEmbedding(entry.text);
      await upsertPoint(entry.scNumber, vector, {
        sc_id:     `SC-${entry.scNumber.toString().padStart(3, '0')}`,
        title:     entry.title,
        status:    entry.status,
        date:      entry.date,
        text:      entry.text,
        type:      'slop_canon_failure',
        embedded_at: new Date().toISOString(),
      });
      embedded[entry.scNumber] = { status: entry.status, embedded_at: new Date().toISOString() };
      success++;
      console.log('✓');
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }

  saveEmbedded(embedded);
  console.log(`\n${success}/${toEmbed.length} entries embedded into '${COLLECTION}'.`);
  await stats();
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const cmd = process.argv[2];

if (cmd === 'search') {
  const query = process.argv.slice(3).join(' ');
  if (!query) { console.error('Usage: node embed-slop-canon.js search "query"'); process.exit(1); }
  searchVault(query).then(results => {
    console.log(`\nSlop Canon search: "${query}"\n`);
    for (const r of results) {
      const p = r.payload;
      console.log(`[${p.sc_id}] ${p.title} (${p.status}) — score: ${r.score.toFixed(3)}`);
      console.log(`  ${p.text.substring(0, 300).replace(/\n/g, ' ')}`);
      console.log();
    }
  }).catch(console.error);

} else if (cmd === 'stats') {
  stats().catch(console.error);

} else {
  embedNew().catch(err => {
    console.error('Embed failed:', err.message);
    process.exit(1);
  });
}
