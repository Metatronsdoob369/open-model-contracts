/**
 * src/staging/embed-and-shatter.ts
 *
 * Core processing step of the staging pipeline.
 * Now supports Sliding Window Chunking for large files.
 */

import http from 'http';
import { StagedInput } from './ingest.js';

const QDRANT_URL = 'http://localhost:6340';
const DEFAULT_COLLECTION = 'spectral-heatmap';
const DEFAULT_GENRE = 'staged-input';

// Maximum characters to process total (to avoid runaway runs)
const MAX_FILE_CHARS = 32000;
// Chunk size for the embedding model (Lowered to 800 for context safety)
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

export interface CanonicalPayload {
  id: string;
  vector: number[];
  payload: {
    source: string;
    kind: string;
    genre: string;
    content: string;         // full or sample
    byteSize: number;
    ingestedAt: number;
    heat: number;            // 0–1: proximity to canonical top-1%
    shatter: number;         // 0–1: velocity / dispersion across space
    shatterMap: number[];    // 16-bucket histogram of vector magnitudes
    nearestCanonicalId: string | null;
    nearestCanonicalScore: number | null;
    room: string;
    embeddingModel: string;
    vectorDim: number;
    chunkCount?: number;     // metadata for large files
  };
}

// ── Ollama embedding ──────────────────────────────────────────────────────────

function ollamaEmbed(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'mxbai-embed-large',
      input: text,
    });

    const req = http.request(
      { hostname: 'localhost', port: 11434, path: '/v1/embeddings', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let buf = '';
        res.on('data', d => buf += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(buf);
            if (json.error) {
              reject(new Error(`Ollama error: ${json.error.message}`));
              return;
            }
            if (!json.data || !json.data[0]) {
              reject(new Error(`Ollama empty response: ${buf}`));
              return;
            }
            resolve(json.data[0].embedding as number[]);
          } catch {
            reject(new Error(`Ollama parse error: ${buf.substring(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Qdrant search ────────────────────────────────────────────────────────────

const COLLECTION_GENRE: Record<string, string> = {
  'spectral-heatmap': 'roblox-canonical',
  'vuln-heatmap': 'vuln-canonical',
  'arb-heatmap': 'arb-canonical',
  'crypto-heatmap': 'crypto-canonical',
};

async function findNearestCanonical(vector: number[], collection: string): Promise<{ id: string; score: number } | null> {
  try {
    const canonicalGenre = COLLECTION_GENRE[collection] ?? 'roblox-canonical';
    const body = JSON.stringify({
      vector,
      limit: 1,
      with_payload: true,
      filter: { must: [{ key: 'genre', match: { value: canonicalGenre } }] },
    });

    const res = await fetch(`${QDRANT_URL}/collections/${collection}/points/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) return null;
    const json = await res.json() as { result: Array<{ id: string | number; score: number; payload?: { canonicalId?: string } }> };
    const hit = json.result?.[0];
    if (!hit) return null;
    const id = hit.payload?.canonicalId ?? String(hit.id);
    return { id, score: hit.score };
  } catch {
    return null;
  }
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

function computeShatterMap(vector: number[]): number[] {
  const bucketSize = Math.floor(vector.length / 16);
  const map: number[] = [];
  for (let b = 0; b < 16; b++) {
    const slice = vector.slice(b * bucketSize, (b + 1) * bucketSize);
    const avg = slice.reduce((s, v) => s + Math.abs(v), 0) / slice.length;
    map.push(Number(avg.toFixed(6)));
  }
  return map;
}

function computeShatterVelocity(shatterMap: number[]): number {
  const mean = shatterMap.reduce((s, v) => s + v, 0) / shatterMap.length;
  const variance = shatterMap.reduce((s, v) => s + (v - mean) ** 2, 0) / shatterMap.length;
  return Math.min(1, Math.sqrt(variance) / 0.1);
}

function classifyRoom(code: string): string {
  if (/DataStore|SaveProfile|Global/i.test(code)) return 'ROOM-02_WorldState';
  if (/CharacterAdded|rowdy|\.IT\b|Grok_/i.test(code)) return 'Client_Visual';
  if (/ReplicatedStorage|RemoteEvent|RemoteFunction/i.test(code)) return 'ROOM-01_Bridge';
  return 'OMC_Governance';
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

export interface EmbedOptions {
  collection?: string;
  genre?: string;
}

export async function embedAndShatter(input: StagedInput, options: EmbedOptions = {}): Promise<CanonicalPayload> {
  const collection = options.collection || DEFAULT_COLLECTION;
  const genre = options.genre || (collection === 'vuln-heatmap' ? 'CANONICAL_REFERENCE' : DEFAULT_GENRE);

  const raw = input.raw.substring(0, MAX_FILE_CHARS);
  const chunks: string[] = [];
  
  let cursor = 0;
  while (cursor < raw.length) {
    const end = Math.min(cursor + CHUNK_SIZE, raw.length);
    chunks.push(raw.substring(cursor, end));
    if (end === raw.length) break;
    cursor += (CHUNK_SIZE - CHUNK_OVERLAP);
  }

  console.log(`[staging] Processing: ${input.source} — ${chunks.length} chunk(s) targeting ${collection} (WEFT)`);

  const results: number[][] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const vector = await ollamaEmbed(chunk);
      results.push(vector);
    } catch (err) {
      console.warn(`[staging] Chunk ${i} failed for ${input.source}: ${err}`);
    }
  }

  if (results.length === 0) {
    throw new Error(`[staging] All chunks failed for ${input.source}`);
  }

  // ── WEFT SYNTHESIS: Max-Magnitude Pooling ───────────────────────────────
  const vectorDim = results[0].length;
  const pooledVector = new Array(vectorDim).fill(0);
  
  for (let i = 0; i < vectorDim; i++) {
    let maxMag = 0;
    let val = 0;
    for (const res of results) {
      if (Math.abs(res[i]) > maxMag) {
        maxMag = Math.abs(res[i]);
        val = res[i];
      }
    }
    pooledVector[i] = val;
  }

  // Normalize pooled vector
  const sumSq = pooledVector.reduce((s, v) => s + v * v, 0);
  const norm = Math.sqrt(sumSq) || 1.0;
  const normalizedVector = pooledVector.map(v => v / norm);

  const shatterMap = computeShatterMap(normalizedVector);
  const shatter = computeShatterVelocity(shatterMap);
  const nearest = await findNearestCanonical(normalizedVector, collection);
  const heat = nearest?.score ?? 0;
  const room = classifyRoom(raw);

  console.log(`[staging] Final Result: heat=${heat.toFixed(3)}  shatter=${shatter.toFixed(3)}  room=${room}  nearest=${nearest?.id ?? 'none'} (Pooled across ${chunks.length} chunks)`);

  return {
    id: input.id,
    vector: normalizedVector,
    payload: {
      source: input.source,
      kind: input.kind,
      genre: 'staged-input',
      content: raw.substring(0, 5000), // Larger snippet for context
      byteSize: input.byteSize,
      ingestedAt: input.ingestedAt,
      heat,
      shatter,
      shatterMap,
      nearestCanonicalId: nearest?.id ?? null,
      nearestCanonicalScore: nearest?.score ?? null,
      room,
      embeddingModel: 'mxbai-embed-large',
      vectorDim,
      chunkCount: chunks.length,
    }
  };
}
