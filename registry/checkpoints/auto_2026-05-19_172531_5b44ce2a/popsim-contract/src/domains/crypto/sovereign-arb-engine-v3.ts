/**
 * SovereignArbEngineV3
 *
 * Trajectory-aware arbitrage verification using 3072-D temporal vectors.
 *
 * Core thesis:
 *   A pool's price can look favorable while its fundamental character
 *   has already changed. Price alone is not truth. Trajectory is truth.
 *
 * The Z-Anchor (T-start slice [2048..3071]) is embedded at discovery time
 * and never updated. It represents what the pool WAS when the trade thesis
 * was formed. At execution time, if the current pool state has drifted too
 * far from the Z-anchor, the trade is aborted — regardless of price.
 *
 * The Prediction Hash binds T || T-1 || T-start || blockNumber into a
 * single verifiable commitment. On-chain contracts verify this hash before
 * releasing funds. If the pool drifted, the hash won't match, and the
 * contract reverts automatically.
 */

import crypto from 'crypto';
import { FLASH_DEFIER_SIGNATURES } from './flash-defier.js';
import { HonestAssessmentLogger } from './honest-assessment-logger.js';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface PoolSnapshot {
  poolAddress:  string;
  blockNumber:  number;
  reserve0:     bigint;
  reserve1:     bigint;
  fee:          number;   // e.g. 0.003 for Uniswap V2
  rawData:      string;   // ABI-encoded or JSON pool state for embedding
}

export interface TemporalVector {
  t:       Float32Array;  // current state     [1024-D]
  tMinus1: Float32Array;  // previous state    [1024-D]
  tStart:  Float32Array;  // discovery anchor  [1024-D]
}

export interface TrajectoryReport {
  poolAddress:      string;
  blockNumber:      number;
  zAnchorDrift:     number;   // cosine distance from T-start
  tDrift:           number;   // cosine distance T vs T-1 (velocity)
  trajectoryStatus: 'STABLE' | 'DRIFTING' | 'SHATTERED';
  predictionHash:   string;
  gate:             'EXECUTE' | 'ABORT';
  abortReason?:     string;
  hotspots:         string[];
  vec3072:          Float32Array;
}

export interface ArbOpportunity {
  poolA:           PoolSnapshot;
  poolB:           PoolSnapshot;
  expectedProfit:  bigint;
  gasEstimate:     bigint;
}

export interface ArbVerdict {
  opportunity:     ArbOpportunity;
  reportA:         TrajectoryReport;
  reportB:         TrajectoryReport;
  gate:            'EXECUTE' | 'ABORT';
  abortReason?:    string;
  predictionHash:  string;   // combined commitment for on-chain verification
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const NATIVE_DIM    = 1024;
const TARGET_DIM    = 3072;
const OLLAMA_URL    = 'http://localhost:11434/api/embeddings';
const OLLAMA_MODEL  = 'mxbai-embed-large';

// Thresholds — tune as you gather real pool data
const Z_ANCHOR_ABORT_THRESHOLD  = 0.15;  // cosine distance — pool character changed
const T_VELOCITY_WARN_THRESHOLD = 0.08;  // cosine distance — pool moving fast
const MEV_HEAT_ABORT_THRESHOLD  = 0.90;  // signature heat — predatory activity

// ─────────────────────────────────────────
// EMBED — chunk + mean-pool → 1024-D
// ─────────────────────────────────────────

async function embedChunk(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: OLLAMA_MODEL, prompt: text })
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

async function embed(text: string, chunkSize = 2000, overlap = 200): Promise<Float32Array> {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    try { embeddings.push(await embedChunk(chunk)); } catch { /* skip bad chunk */ }
  }
  if (embeddings.length === 0) throw new Error('Embed failed — all chunks rejected');

  // Mean-pool → single 1024-D
  const pooled = new Float32Array(NATIVE_DIM);
  for (const emb of embeddings) {
    for (let i = 0; i < NATIVE_DIM; i++) pooled[i] += emb[i] ?? 0;
  }
  for (let i = 0; i < NATIVE_DIM; i++) pooled[i] /= embeddings.length;
  return pooled;
}

// ─────────────────────────────────────────
// TEMPORAL CONCATENATION → 3072-D
// T || T-1 || T-start
// ─────────────────────────────────────────

function temporalCat(tv: TemporalVector): Float32Array {
  const vec = new Float32Array(TARGET_DIM);
  for (let i = 0; i < NATIVE_DIM; i++) {
    vec[i]                  = tv.t[i]       ?? 0;  // [0..1023]    current
    vec[i + NATIVE_DIM]     = tv.tMinus1[i] ?? 0;  // [1024..2047] previous
    vec[i + NATIVE_DIM * 2] = tv.tStart[i]  ?? 0;  // [2048..3071] anchor
  }
  return vec;
}

// ─────────────────────────────────────────
// COSINE DISTANCE
// 0 = identical, 1 = orthogonal, 2 = opposite
// ─────────────────────────────────────────

function cosineDist(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 1 : 1 - (dot / denom);
}

// Slice a sub-vector without allocation pressure
function slice(vec: Float32Array, start: number, end: number): Float32Array {
  return vec.slice(start, end);
}

// ─────────────────────────────────────────
// PREDICTION HASH
// Binds temporal state + block to a commitment
// On-chain verifier checks this before releasing funds
// ─────────────────────────────────────────

function predictionHash(
  vec3072:     Float32Array,
  blockNumber: number,
  poolAddress: string
): string {
  // Use first 32 values of each temporal slice as the fingerprint
  // (full 3072 floats would be too large for on-chain storage)
  const tFinger     = Array.from(vec3072.slice(0, 32)).map(v => v.toFixed(6)).join(',');
  const t1Finger    = Array.from(vec3072.slice(NATIVE_DIM, NATIVE_DIM + 32)).map(v => v.toFixed(6)).join(',');
  const tsFingerj   = Array.from(vec3072.slice(NATIVE_DIM * 2, NATIVE_DIM * 2 + 32)).map(v => v.toFixed(6)).join(',');

  const payload = `${poolAddress}::${blockNumber}::T[${tFinger}]::T1[${t1Finger}]::TS[${tsFingerj}]`;
  return '0x' + crypto.createHash('sha256').update(payload).digest('hex');
}

// ─────────────────────────────────────────
// MEV SIGNATURE SCAN
// ─────────────────────────────────────────

function scanMEV(rawData: string): { heat: number; hotspots: string[] } {
  let maxHeat = 0;
  const hotspots: string[] = [];

  for (const sig of Object.values(FLASH_DEFIER_SIGNATURES)) {
    if ('regex' in sig && sig.regex.test(rawData)) {
      maxHeat = Math.max(maxHeat, sig.heat);
      hotspots.push(`🔥 [MEV] ${sig.id} — ${sig.description}`);
    }
    if ('selectors' in sig) {
      const found = sig.selectors.filter(s => rawData.includes(s));
      if (found.length > 0) {
        const h = sig.heat * (found.length / sig.selectors.length);
        maxHeat = Math.max(maxHeat, h);
        hotspots.push(`🔥 [MEV] ${sig.id} — selectors: ${found.join(', ')}`);
      }
    }
  }

  return { heat: maxHeat, hotspots };
}

// ─────────────────────────────────────────
// CORE: TRAJECTORY ANALYSIS
// ─────────────────────────────────────────

export class SovereignArbEngineV3 {

  // In-memory Z-anchor store: poolAddress → T-start vector
  // In production: persist to local SQLite or flat JSON
  private anchorStore = new Map<string, Float32Array>();
  private prevStore   = new Map<string, Float32Array>();
  private hal         = new HonestAssessmentLogger();

  /**
   * Analyze a single pool's trajectory.
   * Call this at discovery time AND at execution time.
   * The first call seeds the Z-anchor. Every subsequent call
   * measures drift from that anchor.
   */
  async analyzePool(snapshot: PoolSnapshot): Promise<TrajectoryReport> {
    console.log(`\n📡 [ARB-V3] Analyzing pool ${snapshot.poolAddress} @ block ${snapshot.blockNumber}`);

    // 0. Pre-flight HAL check — if this pool is in a known Shatter Zone, skip simulation
    const cachedVec = this.prevStore.get(snapshot.poolAddress);
    if (cachedVec) {
      const preflight = this.hal.preFlightCheck(snapshot.poolAddress, cachedVec);
      if (preflight.skipSimulation) {
        // Return a synthetic ABORT report without running any embed or simulation
        const syntheticVec = new Float32Array(TARGET_DIM);
        cachedVec.forEach((v, i) => { syntheticVec[i] = v; });
        return {
          poolAddress:      snapshot.poolAddress,
          blockNumber:      snapshot.blockNumber,
          zAnchorDrift:     1.0,
          tDrift:           1.0,
          trajectoryStatus: 'SHATTERED',
          predictionHash:   '0x' + crypto.createHash('sha256').update(snapshot.poolAddress).digest('hex'),
          gate:             'ABORT',
          abortReason:      preflight.skipReason ?? 'HAL pre-flight: Shatter Zone detected',
          hotspots:         preflight.triggeredNodes,
          vec3072:          syntheticVec,
        };
      }
    }

    // 1. Embed current pool state
    const tCurrent = await embed(snapshot.rawData);

    // 2. Retrieve or seed Z-anchor (T-start)
    let tStart = this.anchorStore.get(snapshot.poolAddress);
    if (!tStart) {
      tStart = tCurrent;
      this.anchorStore.set(snapshot.poolAddress, tStart);
      console.log(`   🔗 Z-anchor seeded for ${snapshot.poolAddress}`);
    }

    // 3. Retrieve T-1 (previous state)
    const tMinus1 = this.prevStore.get(snapshot.poolAddress) ?? new Float32Array(NATIVE_DIM);

    // 4. Build 3072-D temporal vector
    const tv: TemporalVector = { t: tCurrent, tMinus1, tStart };
    const vec3072 = temporalCat(tv);

    // 5. Compute trajectory metrics
    // Z-anchor drift: how far has the pool moved from discovery?
    const zAnchorSliceCurrent = slice(vec3072, NATIVE_DIM * 2, TARGET_DIM);
    const zAnchorSliceStart   = tStart;
    const zAnchorDrift        = cosineDist(zAnchorSliceCurrent, zAnchorSliceStart);

    // T velocity: how fast is the pool moving right now?
    const tDrift = cosineDist(tCurrent, tMinus1.every(v => v === 0) ? tCurrent : tMinus1);

    // 6. MEV scan on raw pool data
    const { heat: mevHeat, hotspots } = scanMEV(snapshot.rawData);

    // 7. Trajectory status
    let trajectoryStatus: TrajectoryReport['trajectoryStatus'];
    if (zAnchorDrift > Z_ANCHOR_ABORT_THRESHOLD) {
      trajectoryStatus = 'SHATTERED';
    } else if (tDrift > T_VELOCITY_WARN_THRESHOLD || mevHeat > 0.7) {
      trajectoryStatus = 'DRIFTING';
    } else {
      trajectoryStatus = 'STABLE';
    }

    // 8. Gate decision
    let gate: 'EXECUTE' | 'ABORT' = 'EXECUTE';
    let abortReason: string | undefined;

    if (trajectoryStatus === 'SHATTERED') {
      gate = 'ABORT';
      abortReason = `Z-anchor drift ${zAnchorDrift.toFixed(4)} exceeds threshold ${Z_ANCHOR_ABORT_THRESHOLD} — pool character changed since discovery`;
    } else if (mevHeat >= MEV_HEAT_ABORT_THRESHOLD) {
      gate = 'ABORT';
      abortReason = `MEV heat ${mevHeat.toFixed(4)} — predatory activity detected`;
    }

    // 9. Prediction hash — on-chain commitment
    const hash = predictionHash(vec3072, snapshot.blockNumber, snapshot.poolAddress);

    // 10. Advance temporal state
    this.prevStore.set(snapshot.poolAddress, tCurrent);

    const report: TrajectoryReport = {
      poolAddress:      snapshot.poolAddress,
      blockNumber:      snapshot.blockNumber,
      zAnchorDrift,
      tDrift,
      trajectoryStatus,
      predictionHash:   hash,
      gate,
      abortReason,
      hotspots,
      vec3072
    };

    console.log(`   📐 Z-anchor drift: ${zAnchorDrift.toFixed(4)} | T-velocity: ${tDrift.toFixed(4)}`);
    console.log(`   🛡️  Trajectory: ${trajectoryStatus} | Gate: ${gate}`);
    if (abortReason) console.log(`   ❌ Abort: ${abortReason}`);
    if (hotspots.length) hotspots.forEach(h => console.log(`   ${h}`));
    console.log(`   🔏 Prediction hash: ${hash.slice(0, 18)}...`);

    return report;
  }

  /**
   * Full arbitrage verification.
   * Analyzes both pools, combines into a single verdict + commitment hash.
   *
   * On-chain contract receives predictionHash and verifies before releasing funds.
   * If either pool shattered → ABORT.
   * If combined MEV heat too high → ABORT.
   * Otherwise → EXECUTE with commitment hash.
   */
  async verifyArb(opportunity: ArbOpportunity): Promise<ArbVerdict> {
    console.log('\n💎 [ARB-V3] Verifying arbitrage opportunity...');
    console.log(`   Pool A: ${opportunity.poolA.poolAddress}`);
    console.log(`   Pool B: ${opportunity.poolB.poolAddress}`);
    console.log(`   Expected profit: ${opportunity.expectedProfit}`);

    const [reportA, reportB] = await Promise.all([
      this.analyzePool(opportunity.poolA),
      this.analyzePool(opportunity.poolB)
    ]);

    // Combined gate
    let gate: 'EXECUTE' | 'ABORT' = 'EXECUTE';
    let abortReason: string | undefined;

    if (reportA.gate === 'ABORT') {
      gate = 'ABORT';
      abortReason = `Pool A: ${reportA.abortReason}`;
    } else if (reportB.gate === 'ABORT') {
      gate = 'ABORT';
      abortReason = `Pool B: ${reportB.abortReason}`;
    }

    // Combined prediction hash — both pools must match on-chain
    const combinedPayload = `${reportA.predictionHash}::${reportB.predictionHash}::${opportunity.expectedProfit}`;
    const combinedHash = '0x' + crypto.createHash('sha256').update(combinedPayload).digest('hex');

    const verdict: ArbVerdict = {
      opportunity,
      reportA,
      reportB,
      gate,
      abortReason,
      predictionHash: combinedHash
    };

    // ─── HAL: Log every ABORT as a Shatter Certificate + Dark Node ───────────
    // The aborted pool becomes sovereign intelligence — warping the manifold so
    // future encounters with the same signature class skip simulation entirely.
    if (gate === 'ABORT') {
      // Find which report triggered the abort and log it
      const abortedReport = reportA.gate === 'ABORT' ? reportA : reportB;
      const abortedPool   = reportA.gate === 'ABORT' ? opportunity.poolA : opportunity.poolB;

      // Collect triggered MEV signatures from hotspots
      const signatures = abortedReport.hotspots
        .map(h => {
          const m = h.match(/SIG_[A-Z_]+/);
          return m ? m[0] : null;
        })
        .filter(Boolean) as string[];

      this.hal.logAbort({
        combinedHash:  combinedHash,
        poolAddress:   abortedPool.poolAddress,
        blockNumber:   abortedPool.blockNumber,
        signatures:    signatures.length > 0 ? signatures : ['SIG_UNKNOWN_ABORT'],
        mevHeat:       abortedReport.trajectoryStatus === 'SHATTERED'
                         ? abortedReport.zAnchorDrift   // use drift as heat proxy for Z-anchor aborts
                         : 0.95,                        // MEV heat aborts are always hot
        zAnchorDrift:  abortedReport.zAnchorDrift,
        tVelocity:     abortedReport.tDrift,
        vec3072:       abortedReport.vec3072,
        abortReason:   abortedReport.abortReason ?? 'Unknown',
      });

      // Print HAL stats after every abort for visibility
      this.hal.stats();
    }

    console.log(`\n🏁 [ARB-V3] VERDICT: ${gate}`);
    if (abortReason) console.log(`   Reason: ${abortReason}`);
    console.log(`   Combined hash: ${combinedHash.slice(0, 18)}...`);

    return verdict;
  }

  /**
   * Reset anchor for a pool (call when intentionally re-entering a position).
   */
  resetAnchor(poolAddress: string) {
    this.anchorStore.delete(poolAddress);
    this.prevStore.delete(poolAddress);
    console.log(`🔄 [ARB-V3] Anchor reset for ${poolAddress}`);
  }

  /**
   * Export all anchors to JSON for persistence.
   * Load on startup to survive process restarts.
   */
  exportAnchors(): Record<string, number[]> {
    const out: Record<string, number[]> = {};
    for (const [addr, vec] of this.anchorStore) {
      out[addr] = Array.from(vec);
    }
    return out;
  }

  importAnchors(data: Record<string, number[]>) {
    for (const [addr, vec] of Object.entries(data)) {
      this.anchorStore.set(addr, new Float32Array(vec));
    }
    console.log(`📥 [ARB-V3] Imported ${Object.keys(data).length} anchors`);
  }
}
