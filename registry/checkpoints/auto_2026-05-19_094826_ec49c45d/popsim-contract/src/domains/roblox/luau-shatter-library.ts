/**
 * LuauShatterLibrary — Roblox Code Recognition Loop
 *
 * The HAL dark node pattern applied to Luau code repair.
 *
 * Instead of treating every "attempt to index nil" or "spatial misalignment"
 * as a new problem for the LLM to solve, we treat them as Numerical Signatures.
 * After a successful repair, a CodeShatterCertificate is stored: the fracture hash,
 * a 1024-D embedding of the fracture context, and the verified fix.
 *
 * On the next encounter, before calling the LLM, we check the Shatter Library.
 * If cosine similarity ≥ 0.98 → instant fix. No simulation. No tokens burned.
 *
 * Over time, the agent becomes Expert in your specific game's architecture.
 * It stops Thinking and starts Recognizing.
 *
 * Embedding: mxbai-embed-large via local Ollama (1024-D, single-state)
 * Persistence: lab/spectral-maps/luau-shatter-library.json
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface CodeShatterCertificate {
  id:             string;         // sha256(fractureHash + timestamp)[:16]
  fractureHash:   string;        // sha256 of broken Luau code block
  fingerprint1024: number[];     // 1024-D embedding of fracture context (stored as array)
  verifiedFix:    string;        // the patch that achieved Diamond-Stable resonance
  moduleName:     string;        // e.g. "CharacterController", "ArenaManager"
  errorSignature: string;        // e.g. "attempt to index nil with 'Position'"
  successCount:   number;        // how many times this fix has been applied
  createdAt:      string;        // ISO timestamp
  lastUsedAt:     string;        // ISO timestamp
}

export interface RecognitionResult {
  hit:        boolean;
  fix?:       string;
  certId?:    string;
  similarity: number;           // cosine similarity [0..1]
  moduleName?: string;
  errorSignature?: string;
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const RECOGNITION_THRESHOLD  = 0.98;   // cosine similarity — exact match required
const EMBED_DIM              = 1024;
const OLLAMA_URL             = process.env['OLLAMA_URL'] ?? 'http://localhost:11434';
const OLLAMA_MODEL           = 'mxbai-embed-large';
const SPECTRAL_DIR           = path.resolve(process.cwd(), 'lab/spectral-maps');
const LIBRARY_FILE           = path.join(SPECTRAL_DIR, 'luau-shatter-library.json');

// ─────────────────────────────────────────
// MATH
// ─────────────────────────────────────────

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function fractureHash(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// ─────────────────────────────────────────
// EMBED VIA OLLAMA
// ─────────────────────────────────────────

async function embed(text: string): Promise<Float32Array> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
  });

  if (!res.ok) {
    throw new Error(`[LuauShatterLibrary] Ollama embed failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { embedding: number[] };
  const vec = new Float32Array(data.embedding);

  if (vec.length !== EMBED_DIM) {
    throw new Error(
      `[LuauShatterLibrary] Expected ${EMBED_DIM}-D embedding, got ${vec.length}-D. ` +
      `Is ${OLLAMA_MODEL} loaded? Run: ollama pull ${OLLAMA_MODEL}`
    );
  }

  return vec;
}

// ─────────────────────────────────────────
// LUAU SHATTER LIBRARY
// ─────────────────────────────────────────

export class LuauShatterLibrary {
  private certs: CodeShatterCertificate[] = [];

  constructor() {
    this.load();
  }

  // ───── PERSISTENCE ─────────────────────

  private load() {
    fs.mkdirSync(SPECTRAL_DIR, { recursive: true });

    if (fs.existsSync(LIBRARY_FILE)) {
      this.certs = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf-8'));
      console.log(`📚 [LuauShatterLibrary] Loaded ${this.certs.length} CodeShatterCertificates`);
    } else {
      console.log(`📚 [LuauShatterLibrary] Empty library — will populate on first repair`);
    }
  }

  private save() {
    fs.writeFileSync(LIBRARY_FILE, JSON.stringify(this.certs, null, 2));
  }

  // ───── LOG REPAIR → CERTIFICATE ────────
  //
  // Call after a successful LLM repair.
  // Embeds the broken code, stores cert with fingerprint + fix.

  async logRepair(params: {
    brokenCode:     string;
    verifiedFix:    string;
    moduleName:     string;
    errorSignature: string;
  }): Promise<CodeShatterCertificate> {

    const hash = fractureHash(params.brokenCode);

    // Check if we already have a cert for this exact fracture hash
    const existing = this.certs.find(c => c.fractureHash === hash);
    if (existing) {
      existing.successCount++;
      existing.lastUsedAt = new Date().toISOString();
      existing.verifiedFix = params.verifiedFix; // update to latest successful fix
      this.save();
      console.log(`♻️  [LuauShatterLibrary] Updated cert ${existing.id} (${existing.successCount} successes)`);
      return existing;
    }

    console.log(`\n🔬 [LuauShatterLibrary] Embedding fracture context: ${params.moduleName}`);
    console.log(`   Error: ${params.errorSignature}`);

    const vec = await embed(params.brokenCode);
    const now = new Date().toISOString();

    const cert: CodeShatterCertificate = {
      id:              crypto.createHash('sha256').update(hash + Date.now()).digest('hex').slice(0, 16),
      fractureHash:    hash,
      fingerprint1024: Array.from(vec),
      verifiedFix:     params.verifiedFix,
      moduleName:      params.moduleName,
      errorSignature:  params.errorSignature,
      successCount:    1,
      createdAt:       now,
      lastUsedAt:      now,
    };

    this.certs.push(cert);
    this.save();

    console.log(`✅ [LuauShatterLibrary] CodeShatterCertificate issued: ${cert.id}`);
    console.log(`   Module: ${cert.moduleName} | Error: ${cert.errorSignature}`);
    console.log(`   Library size: ${this.certs.length} certs`);

    return cert;
  }

  // ───── RECOGNIZE ────────────────────────
  //
  // Call BEFORE any LLM patch call.
  // Embeds the broken code and checks against all stored certificates.
  // If similarity ≥ 0.98, return the verified fix immediately.

  async recognize(brokenCode: string): Promise<RecognitionResult> {
    if (this.certs.length === 0) {
      return { hit: false, similarity: 0 };
    }

    console.log(`\n🔍 [LuauShatterLibrary] Recognition scan (${this.certs.length} certs in library)...`);

    const queryVec = await embed(brokenCode);

    let bestSimilarity = 0;
    let bestCert: CodeShatterCertificate | null = null;

    for (const cert of this.certs) {
      const certVec = new Float32Array(cert.fingerprint1024);
      const similarity = cosineSimilarity(queryVec, certVec);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestCert = cert;
      }
    }

    if (bestSimilarity >= RECOGNITION_THRESHOLD && bestCert) {
      bestCert.successCount++;
      bestCert.lastUsedAt = new Date().toISOString();
      this.save();

      console.log(`⚡ [LuauShatterLibrary] RECOGNITION HIT — similarity=${bestSimilarity.toFixed(4)}`);
      console.log(`   Cert: ${bestCert.id} | Module: ${bestCert.moduleName}`);
      console.log(`   Error: ${bestCert.errorSignature} | Used ${bestCert.successCount}x`);
      console.log(`   → Bypassing LLM. Applying verified fix.`);

      return {
        hit:            true,
        fix:            bestCert.verifiedFix,
        certId:         bestCert.id,
        similarity:     bestSimilarity,
        moduleName:     bestCert.moduleName,
        errorSignature: bestCert.errorSignature,
      };
    }

    console.log(`❌ [LuauShatterLibrary] No match (best similarity=${bestSimilarity.toFixed(4)} < ${RECOGNITION_THRESHOLD})`);
    return { hit: false, similarity: bestSimilarity };
  }

  // ───── PRE-FILTER ────────────────────────
  //
  // Convenience wrapper — call at the top of generatePatch().
  // Returns the fix if recognized, null if LLM is needed.

  async preFilterBug(brokenCode: string): Promise<{ fix: string; certId: string; similarity: number } | null> {
    const result = await this.recognize(brokenCode);

    if (result.hit && result.fix && result.certId) {
      return { fix: result.fix, certId: result.certId, similarity: result.similarity };
    }

    return null;
  }

  // ───── STATS ────────────────────────────

  stats() {
    console.log('\n📊 [LuauShatterLibrary] Recognition Loop Summary');
    console.log(`   CodeShatterCertificates: ${this.certs.length}`);

    if (this.certs.length === 0) return;

    const totalUses = this.certs.reduce((sum, c) => sum + c.successCount, 0);
    const topCerts  = [...this.certs]
      .sort((a, b) => b.successCount - a.successCount)
      .slice(0, 5);

    console.log(`   Total LLM bypasses:      ${totalUses}`);
    console.log('\n   Top recognized fractures:');
    for (const c of topCerts) {
      console.log(`   ⚡ ${c.moduleName.padEnd(25)} ${c.errorSignature.slice(0, 40).padEnd(40)} used=${c.successCount}x`);
    }
  }

  get certificateCount(): number { return this.certs.length; }
  get allCertificates():  CodeShatterCertificate[] { return this.certs; }
}
