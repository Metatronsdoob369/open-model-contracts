import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * METROPOLIS LAB: REAL 3072-D MAPPING ORCHESTRATOR
 *
 * Architecture: Temporal Concatenation (T, T-1, T-start)
 * - T       = current shard content embedding     [1024-D]
 * - T-1     = previous shard embedding (or zeros) [1024-D]
 * - T-start = first shard seen (anchor)           [1024-D]
 * Concatenated → 3072-D sovereign vector
 *
 * Nothing leaves the box. All embeddings via local Ollama mxbai-embed-large.
 */

const SHATTER_DIR  = path.resolve(process.cwd(), 'lab/shatter-zone');
const SPECTRAL_DIR = path.resolve(process.cwd(), 'lab/spectral-maps');
const MANIFEST_PATH = path.resolve(process.cwd(), 'lab/shatter-zone/manifest.json');
const STATE_PATH   = path.resolve(process.cwd(), 'lab/spectral-maps/temporal-state.json');

const OLLAMA_URL   = 'http://localhost:11434/api/embeddings';
const OLLAMA_MODEL = 'mxbai-embed-large';
const NATIVE_DIM   = 1024;
const TARGET_DIM   = 3072;

// ─────────────────────────────────────────
// OLLAMA EMBED — single chunk
// ─────────────────────────────────────────
async function embedChunk(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text })
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

// ─────────────────────────────────────────
// CHUNK + EMBED — Max-Magnitude Weft Synthesis
// Preserves spectral density of full shard
// ─────────────────────────────────────────
async function embed(text: string, chunkSize = 800, overlap = 200): Promise<number[]> {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    try {
      embeddings.push(await embedChunk(chunk));
    } catch (err: any) {
      console.warn(`   ⚠️  Chunk embed failed, skipping: ${err.message}`);
    }
  }

  if (embeddings.length === 0) throw new Error('All chunks failed to embed');

  // Max-Magnitude Pooling across chunks → single 1024-D vector
  const pooled = new Array(NATIVE_DIM).fill(0);
  for (let i = 0; i < NATIVE_DIM; i++) {
    let maxMag = 0;
    let val = 0;
    for (const emb of embeddings) {
      if (Math.abs(emb[i]) > maxMag) {
        maxMag = Math.abs(emb[i]);
        val = emb[i];
      }
    }
    pooled[i] = val;
  }

  return pooled;
}

// ─────────────────────────────────────────
// TEMPORAL CONCATENATION → 3072-D
// T || T-1 || T-start
// ─────────────────────────────────────────
function temporalCat(
  t: number[],
  tMinus1: number[],
  tStart: number[]
): Float32Array {
  const vec = new Float32Array(TARGET_DIM);
  for (let i = 0; i < NATIVE_DIM; i++) {
    vec[i]                    = t[i]        ?? 0; // T        [0..1023]
    vec[i + NATIVE_DIM]       = tMinus1[i]  ?? 0; // T-1      [1024..2047]
    vec[i + NATIVE_DIM * 2]   = tStart[i]   ?? 0; // T-start  [2048..3071]
  }
  return vec;
}

// ─────────────────────────────────────────
// MANHATTAN RESONANCE (heat)
// ─────────────────────────────────────────
function manhattanHeat(vec: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += Math.abs(vec[i]);
  return sum / (TARGET_DIM * 10); // normalize to ~0..1
}

// ─────────────────────────────────────────
// INTENT SIGNATURE — deterministic hash
// ─────────────────────────────────────────
function intentSig(content: string): string {
  return '3072D_INTENT_' + crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

// ─────────────────────────────────────────
// LOAD / SAVE TEMPORAL STATE
// ─────────────────────────────────────────
interface TemporalState {
  tStart: number[] | null;   // anchor — first shard ever embedded
  tPrev:  number[] | null;   // T-1 for next shard
  count:  number;
}

function loadState(): TemporalState {
  if (fs.existsSync(STATE_PATH)) {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  }
  return { tStart: null, tPrev: null, count: 0 };
}

function saveState(state: TemporalState) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function mapShards() {
  console.log('📡 [CRONOS] 3072-D Temporal Mapping — T || T-1 || T-start');

  if (!fs.existsSync(SPECTRAL_DIR)) fs.mkdirSync(SPECTRAL_DIR, { recursive: true });

  const shards = fs.readdirSync(SHATTER_DIR).filter(f => !f.endsWith('.json'));
  if (shards.length === 0) {
    console.error('❌ No shards found. Run npm run shatter first.');
    return;
  }

  const state = loadState();
  const manifoldEntries: any[] = [];

  for (const shardFile of shards) {
    const content = fs.readFileSync(path.join(SHATTER_DIR, shardFile), 'utf-8');
    console.log(`\n🔍 Embedding: ${shardFile}`);

    let tCurrent: number[];
    try {
      tCurrent = await embed(content);
    } catch (err: any) {
      console.error(`   ❌ Embed failed: ${err.message}`);
      continue;
    }

    // Bootstrap T-start on first shard
    if (!state.tStart) {
      state.tStart = tCurrent;
      console.log('   🔗 T-start anchored (first shard)');
    }

    const tMinus1 = state.tPrev ?? new Array(NATIVE_DIM).fill(0);

    // Concatenate → 3072-D
    const vec3072 = temporalCat(tCurrent, tMinus1, state.tStart);
    const heat    = manhattanHeat(vec3072);
    const sig     = intentSig(content);

    // Snapshot: first 3 dims for 3D projection
    const position3d: [number, number, number] = [
      vec3072[0] * 20,
      vec3072[1024] * 20,   // T-1 dimension for Y — captures drift
      vec3072[2048] * 20    // T-start dimension for Z — captures origin distance
    ];

    const entry = {
      shard:           shardFile,
      intentSignature: sig,
      resonance:       heat,
      stealthStatus:   heat > 0.65 ? 'BREACH_DETECTED' : 'CANONICAL',
      targetFlag:      heat > 0.65 ? 'VULN_CLUSTER_A'  : 'STABLE_NODE',
      priority:        heat > 0.65 ? 'CRITICAL'         : 'LOW',
      position3d,
      temporal: {
        t_dim:     NATIVE_DIM,
        t1_dim:    NATIVE_DIM,
        tstart_dim: NATIVE_DIM,
        total_dim: TARGET_DIM,
        is_tstart: state.count === 0
      },
      // Store full vector for future stages (sniper, discovery)
      vector: Array.from(vec3072)
    };

    // Save individual spectral map file
    const mapFile = path.join(SPECTRAL_DIR, shardFile.replace(/\.[^.]+$/, '.spectral.json'));
    fs.writeFileSync(mapFile, JSON.stringify(entry, null, 2));

    manifoldEntries.push(entry);

    console.log(`   ✅ ${sig}`);
    console.log(`   📐 Dims: [T:0-1023] [T-1:1024-2047] [T-start:2048-3071]`);
    console.log(`   🌡️  Heat: ${heat.toFixed(4)} | Gate: ${entry.stealthStatus}`);
    console.log(`   📍 3D: [${position3d.map(v => v.toFixed(3)).join(', ')}]`);

    // Advance temporal state
    state.tPrev = tCurrent;
    state.count++;
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifoldEntries, null, 2));
  saveState(state);

  console.log(`\n💎 [CRONOS] Mapping complete.`);
  console.log(`   ${manifoldEntries.length} shards → real 3072-D temporal vectors`);
  console.log(`   Spectral maps: ${SPECTRAL_DIR}`);
  console.log(`   Manifest: ${MANIFEST_PATH}`);
  console.log(`   Temporal state: ${STATE_PATH}`);
}

mapShards().catch(console.error);
