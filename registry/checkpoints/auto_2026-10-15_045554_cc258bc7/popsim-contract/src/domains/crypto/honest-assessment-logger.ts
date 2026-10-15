/**
 * HonestAssessmentLogger — Sovereign Intelligence Feedback Loop
 *
 * Every ABORT is a labeled training example.
 * Every Shatter Certificate is a dark node in the 3072-D manifold.
 * Dark nodes warp the resonance of nearby vectors — making the engine
 * hypersensitive in known Shatter Zones without any additional simulation cost.
 *
 * The 4D Warp (calculate_warped_resonance):
 *   Instead of just avoiding a specific pool, we warp the entire
 *   embedding space around a signature class. Any future vector that
 *   lands near a dark node gets its Sovereign Health penalized —
 *   proportional to proximity and the dark node's heat multiplier.
 *
 * Flow:
 *   ABORT fires → Shatter Certificate written → Dark node registered
 *   → Next pool analyzed → warped resonance applied BEFORE simulation
 *   → If warped resonance < threshold → skip simulation entirely
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface ShatterCertificate {
  id:               string;       // deterministic: sha256(hash + timestamp)
  combinedHash:     string;       // from SovereignArbEngineV3
  poolAddress:      string;
  blockNumber:      number;
  timestamp:        string;       // ISO
  signatures:       string[];     // triggered MEV/ICS/protocol sigs
  mevHeat:          number;       // peak heat at abort
  zAnchorDrift:     number;
  tVelocity:        number;
  vec3072:          number[];     // full vector at abort time — the dark node
  abortReason:      string;
  signatureClasses: string[];     // e.g. ['MEV_ASSEMBLY', 'DRAIN_LOOP']
}

export interface DarkNode {
  id:             string;
  vector:         Float32Array;   // 3072-D dark node position
  heat:           number;         // original abort heat
  heatMultiplier: number;         // amplification factor — grows with confirmation count
  threshold:      number;         // cosine distance within which repulsion applies
  signatureClass: string;         // e.g. 'SIG_MEV_ASSEMBLY_SWAP'
  confirmations:  number;         // how many times this signature class has aborted
  abortRate:      number;         // aborts / total encounters for this class
}

export interface SignatureWeight {
  id:           string;
  encounters:   number;
  aborts:       number;
  abortRate:    number;
  avgHeat:      number;
  heatMultiplier: number;         // derived: abortRate * 2.0, capped at 3.0
}

export interface WarpedResonance {
  poolAddress:      string;
  rawResonance:     number;       // pre-warp Manhattan resonance
  warpedResonance:  number;       // post-warp Sovereign Health [0..1]
  repulsion:        number;       // total repulsion applied
  triggeredNodes:   string[];     // which dark nodes fired
  skipSimulation:   boolean;      // true if warped resonance below skip threshold
  skipReason?:      string;
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const SKIP_SIMULATION_THRESHOLD = 0.35;  // warped resonance below this → skip
const DEFAULT_NODE_THRESHOLD    = 0.25;  // cosine distance for repulsion radius
const MAX_HEAT_MULTIPLIER       = 3.0;   // cap on amplification
const SPECTRAL_DIR              = path.resolve(process.cwd(), 'lab/spectral-maps');
const CERTIFICATES_FILE         = path.join(SPECTRAL_DIR, 'shatter-certificates.json');
const WEIGHTS_FILE              = path.join(SPECTRAL_DIR, 'signature-weights.json');
const DARK_NODES_FILE           = path.join(SPECTRAL_DIR, 'dark-nodes.json');

// ─────────────────────────────────────────
// COSINE DISTANCE (pure — no dependencies)
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

// ─────────────────────────────────────────
// HONEST ASSESSMENT LOGGER
// ─────────────────────────────────────────

export class HonestAssessmentLogger {
  private certificates: ShatterCertificate[]  = [];
  private weights:      Map<string, SignatureWeight> = new Map();
  private darkNodes:    DarkNode[]            = [];

  constructor() {
    this.load();
  }

  // ───── PERSISTENCE ─────────────────────

  private load() {
    fs.mkdirSync(SPECTRAL_DIR, { recursive: true });

    if (fs.existsSync(CERTIFICATES_FILE)) {
      this.certificates = JSON.parse(fs.readFileSync(CERTIFICATES_FILE, 'utf-8'));
      console.log(`📚 [HAL] Loaded ${this.certificates.length} Shatter Certificates`);
    }

    if (fs.existsSync(WEIGHTS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(WEIGHTS_FILE, 'utf-8'));
      for (const w of raw) this.weights.set(w.id, w);
      console.log(`⚖️  [HAL] Loaded ${this.weights.size} signature weights`);
    }

    if (fs.existsSync(DARK_NODES_FILE)) {
      const raw: any[] = JSON.parse(fs.readFileSync(DARK_NODES_FILE, 'utf-8'));
      this.darkNodes = raw.map(n => ({
        ...n,
        vector: new Float32Array(n.vector)
      }));
      console.log(`🌑 [HAL] Loaded ${this.darkNodes.length} dark nodes`);
    }
  }

  private save() {
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(this.certificates, null, 2));
    fs.writeFileSync(WEIGHTS_FILE,      JSON.stringify([...this.weights.values()], null, 2));
    fs.writeFileSync(DARK_NODES_FILE,   JSON.stringify(
      this.darkNodes.map(n => ({ ...n, vector: Array.from(n.vector) })),
      null, 2
    ));
  }

  // ───── EXTRACT SIGNATURE CLASSES ───────

  private extractClasses(signatures: string[]): string[] {
    const classMap: Record<string, string> = {
      'SIG_MEV_ASSEMBLY_SWAP':     'MEV_ASSEMBLY',
      'SIG_UNISWAP_V2_FEE_MATH':  'MEV_ASSEMBLY',
      'SIG_SELECTOR_BOT_CONSTANTS':'MEV_SELECTOR',
      'SIG_DRAIN_LOOP':            'DRAIN_LOOP',
      'SIG_FLASH_SWAP_CHAIN':      'FLASH_CHAIN',
      'SIG_DB_REDIS_RCE':          'RCE',
      'SIG_IOT_MODBUS_SCAN':       'ICS_RECON',
      'SIG_WEB_SQLI_SLEEP':        'INJECTION',
    };
    const classes = new Set<string>();
    for (const sig of signatures) {
      for (const [key, cls] of Object.entries(classMap)) {
        if (sig.includes(key)) classes.add(cls);
      }
      // Fallback: use sig prefix
      const match = sig.match(/SIG_([A-Z]+)/);
      if (match) classes.add(match[1]);
    }
    return [...classes];
  }

  // ───── LOG ABORT → CERTIFICATE + DARK NODE ─────

  logAbort(params: {
    combinedHash:  string;
    poolAddress:   string;
    blockNumber:   number;
    signatures:    string[];
    mevHeat:       number;
    zAnchorDrift:  number;
    tVelocity:     number;
    vec3072:       Float32Array;
    abortReason:   string;
  }): ShatterCertificate {

    const sigClasses = this.extractClasses(params.signatures);
    const certId     = crypto.createHash('sha256')
      .update(params.combinedHash + Date.now())
      .digest('hex')
      .slice(0, 16);

    // 1. Issue Shatter Certificate
    const cert: ShatterCertificate = {
      id:               certId,
      combinedHash:     params.combinedHash,
      poolAddress:      params.poolAddress,
      blockNumber:      params.blockNumber,
      timestamp:        new Date().toISOString(),
      signatures:       params.signatures,
      mevHeat:          params.mevHeat,
      zAnchorDrift:     params.zAnchorDrift,
      tVelocity:        params.tVelocity,
      vec3072:          Array.from(params.vec3072),
      abortReason:      params.abortReason,
      signatureClasses: sigClasses,
    };

    this.certificates.push(cert);
    console.log(`\n📜 [HAL] Shatter Certificate issued: ${certId}`);
    console.log(`   Pool: ${params.poolAddress} @ block ${params.blockNumber}`);
    console.log(`   Classes: ${sigClasses.join(', ')}`);
    console.log(`   MEV Heat: ${params.mevHeat.toFixed(4)} | Z-drift: ${params.zAnchorDrift.toFixed(4)}`);

    // 2. Update signature weights — learns abort rate per class
    for (const sigClass of sigClasses) {
      const existing = this.weights.get(sigClass) ?? {
        id:             sigClass,
        encounters:     0,
        aborts:         0,
        abortRate:      0,
        avgHeat:        0,
        heatMultiplier: 1.0
      };

      existing.aborts++;
      existing.encounters = Math.max(existing.encounters, existing.aborts);
      existing.abortRate  = existing.aborts / existing.encounters;
      existing.avgHeat    = (existing.avgHeat + params.mevHeat) / 2;
      // Heat multiplier grows with abort rate, capped at 3.0
      existing.heatMultiplier = Math.min(MAX_HEAT_MULTIPLIER, 1.0 + existing.abortRate * 2.0);

      this.weights.set(sigClass, existing);
      console.log(`   ⚖️  ${sigClass}: abortRate=${existing.abortRate.toFixed(2)} multiplier=${existing.heatMultiplier.toFixed(2)}x`);
    }

    // 3. Register dark node — one per signature class at this vector position
    for (const sigClass of sigClasses) {
      const weight = this.weights.get(sigClass)!;

      // Check if we already have a dark node for this class close to this vector
      const vec = params.vec3072;
      const existing = this.darkNodes.find(n =>
        n.signatureClass === sigClass &&
        cosineDist(n.vector, vec) < 0.05  // same cluster
      );

      if (existing) {
        // Strengthen existing node
        existing.confirmations++;
        existing.heatMultiplier = weight.heatMultiplier;
        existing.heat = Math.max(existing.heat, params.mevHeat);
        console.log(`   🌑 Dark node strengthened: ${sigClass} (${existing.confirmations} confirmations)`);
      } else {
        // New dark node
        const node: DarkNode = {
          id:             `${sigClass}_${certId}`,
          vector:         new Float32Array(params.vec3072),
          heat:           params.mevHeat,
          heatMultiplier: weight.heatMultiplier,
          threshold:      DEFAULT_NODE_THRESHOLD,
          signatureClass: sigClass,
          confirmations:  1,
          abortRate:      weight.abortRate,
        };
        this.darkNodes.push(node);
        console.log(`   🌑 New dark node registered: ${sigClass}`);
      }
    }

    this.save();
    return cert;
  }

  // ───── THE 4D WARP ──────────────────────
  //
  // calculate_warped_resonance:
  //   Adjusts the Sovereign Health of a pool based on proximity
  //   to known dark nodes in the 3072-D manifold.
  //
  //   repulsion = Σ (1 - distance) * heatMultiplier  for each nearby dark node
  //   sovereignHealth = 1.0 - repulsion (clamped [0..1])
  //
  //   If sovereignHealth < SKIP_SIMULATION_THRESHOLD → skip simulation entirely.
  //   The agent doesn't simulate — it recognizes and pivots.

  calculateWarpedResonance(
    poolAddress:  string,
    vec3072:      Float32Array,
    rawResonance: number
  ): WarpedResonance {

    let repulsion      = 0;
    const triggeredNodes: string[] = [];

    for (const node of this.darkNodes) {
      const distance = cosineDist(vec3072, node.vector);

      if (distance < node.threshold) {
        const nodeRepulsion = (1.0 - distance) * node.heatMultiplier;
        repulsion += nodeRepulsion;
        triggeredNodes.push(
          `${node.signatureClass} [dist=${distance.toFixed(4)} repulsion=${nodeRepulsion.toFixed(4)} conf=${node.confirmations}]`
        );
      }
    }

    // Sovereign Health — 1.0 is pristine, 0.0 is a confirmed Shatter Zone
    const warpedResonance = Math.max(0, Math.min(1, 1.0 - repulsion));
    const skipSimulation  = warpedResonance < SKIP_SIMULATION_THRESHOLD;

    const result: WarpedResonance = {
      poolAddress,
      rawResonance,
      warpedResonance,
      repulsion,
      triggeredNodes,
      skipSimulation,
      skipReason: skipSimulation
        ? `Sovereign Health ${warpedResonance.toFixed(4)} < ${SKIP_SIMULATION_THRESHOLD} — Shatter Zone recognized, pivot to next pool`
        : undefined
    };

    if (skipSimulation) {
      console.log(`\n⚡ [HAL] SKIP — ${poolAddress}`);
      console.log(`   Sovereign Health: ${warpedResonance.toFixed(4)}`);
      console.log(`   Triggered nodes: ${triggeredNodes.length}`);
      triggeredNodes.forEach(n => console.log(`   🌑 ${n}`));
      console.log(`   → ${result.skipReason}`);
    } else if (triggeredNodes.length > 0) {
      console.log(`\n⚠️  [HAL] WARPED — ${poolAddress}`);
      console.log(`   Raw: ${rawResonance.toFixed(4)} → Warped: ${warpedResonance.toFixed(4)}`);
      triggeredNodes.forEach(n => console.log(`   🌑 ${n}`));
    }

    return result;
  }

  // ───── PRE-FLIGHT CHECK ─────────────────
  // Call this BEFORE any simulation.
  // If skipSimulation=true, don't even call analyzePool.

  preFlightCheck(poolAddress: string, vec3072: Float32Array, rawResonance = 0.5): WarpedResonance {
    console.log(`\n🛫 [HAL] Pre-flight: ${poolAddress}`);
    return this.calculateWarpedResonance(poolAddress, vec3072, rawResonance);
  }

  // ───── STATS ────────────────────────────

  stats() {
    console.log('\n📊 [HAL] Sovereign Intelligence Summary');
    console.log(`   Shatter Certificates: ${this.certificates.length}`);
    console.log(`   Dark Nodes:           ${this.darkNodes.length}`);
    console.log(`   Signature Classes:    ${this.weights.size}`);
    if (this.weights.size > 0) {
      console.log('\n   Signature Weight Table:');
      for (const w of this.weights.values()) {
        console.log(`   ${w.id.padEnd(20)} abortRate=${(w.abortRate * 100).toFixed(0)}% multiplier=${w.heatMultiplier.toFixed(2)}x avgHeat=${w.avgHeat.toFixed(3)}`);
      }
    }
    if (this.darkNodes.length > 0) {
      console.log('\n   Dark Node Registry:');
      for (const n of this.darkNodes) {
        console.log(`   🌑 ${n.signatureClass.padEnd(20)} confirmations=${n.confirmations} heat=${n.heat.toFixed(3)} multiplier=${n.heatMultiplier.toFixed(2)}x`);
      }
    }
  }

  get certificateCount(): number { return this.certificates.length; }
  get darkNodeCount():    number { return this.darkNodes.length; }
  get allDarkNodes():     DarkNode[] { return this.darkNodes; }
}
