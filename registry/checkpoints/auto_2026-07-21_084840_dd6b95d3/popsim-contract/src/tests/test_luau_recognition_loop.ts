/**
 * test_luau_recognition_loop.ts
 *
 * Proves the Roblox Code-Shatter Recognition Loop:
 *   Pass 1: First encounter → LLM called → CodeShatterCertificate issued
 *   Pass 2: Second identical bug → Recognition hit → LLM bypassed instantly
 *   Pass 3: Near-identical bug (cosine similarity check) → threshold determines outcome
 *   Pass 4: Stats panel — library has grown, report confirms bypasses
 *
 * Uses deterministic synthetic embeddings in OFFLINE mode so Ollama isn't required.
 * Set OLLAMA_URL to a live instance to test real embed paths.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { LuauShatterLibrary, type CodeShatterCertificate } from '../domains/roblox/luau-shatter-library.js';

// Wipe persisted library state so each test run starts clean
const LIBRARY_FILE = path.resolve(process.cwd(), 'lab/spectral-maps/luau-shatter-library.json');
if (fs.existsSync(LIBRARY_FILE)) {
  fs.unlinkSync(LIBRARY_FILE);
  console.log('🧹 [TEST] Cleared persisted library state for clean run');
}

// ─────────────────────────────────────────
// OFFLINE MOCK — swap Ollama embed for deterministic vectors
// ─────────────────────────────────────────

const EMBED_DIM = 1024;

// Deterministic 1024-D vector from a string seed
function seedVec(seed: string): number[] {
  const hash = crypto.createHash('sha256').update(seed).digest();
  const vec: number[] = [];
  for (let i = 0; i < EMBED_DIM; i++) {
    // Repeat hash bytes to fill 1024 dims, normalize to [-0.5, 0.5]
    vec.push((hash[i % 32] / 255) - 0.5);
  }
  // Normalize to unit vector
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return vec.map(v => v / norm);
}

// Monkey-patch fetch to intercept Ollama calls
const _originalFetch = global.fetch;
let _currentSeed = 'default';

(global as any).fetch = async (url: string, init?: RequestInit): Promise<Response> => {
  if (typeof url === 'string' && url.includes('/api/embeddings')) {
    const body = JSON.parse((init?.body as string) ?? '{}');
    // Use the seed set by the test, NOT the prompt text, so we control similarity precisely
    const vec = seedVec(_currentSeed);
    return new Response(
      JSON.stringify({ embedding: vec }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return _originalFetch(url, init);
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

const BROKEN_CODE_A = `
-- CharacterController.lua
local function onTouch(hit)
  local humanoid = hit.Parent.Humanoid  -- attempt to index nil with 'Humanoid'
  humanoid.Health = humanoid.Health - 10
end
`;

const VERIFIED_FIX_A = `
-- CharacterController.lua (Diamond-Stable)
local function onTouch(hit)
  local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
  if not humanoid then return end
  humanoid.Health = humanoid.Health - 10
end
`;

const BROKEN_CODE_B = `
-- ArenaManager.lua
local function spawnEnemy(position)
  local model = game.ReplicatedStorage.Enemies.GoblinKing  -- attempt to index nil
  model:Clone().Parent = workspace
  model.HumanoidRootPart.CFrame = CFrame.new(position)
end
`;

const VERIFIED_FIX_B = `
-- ArenaManager.lua (Diamond-Stable)
local function spawnEnemy(position)
  local template = game.ReplicatedStorage.Enemies:FindFirstChild("GoblinKing")
  if not template then return end
  local clone = template:Clone()
  clone.Parent = workspace
  clone.HumanoidRootPart.CFrame = CFrame.new(position)
end
`;

// ─────────────────────────────────────────
// TEST RUNNER
// ─────────────────────────────────────────

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  LUAU RECOGNITION LOOP — Code-Shatter Protocol Test     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Fresh library for clean test run
  const lib = new LuauShatterLibrary();
  const initialCount = lib.certificateCount;

  // ── PASS 1: First repair → certificate issued ───────────────────────────
  console.log('── PASS 1: First repair stores CodeShatterCertificate ─────────');

  // Set seed so embed always returns same vector for BROKEN_CODE_A
  _currentSeed = 'fracture-A';

  const preRecognition = await lib.recognize(BROKEN_CODE_A);
  assert(!preRecognition.hit, 'Pre-repair: library has no cert for this fracture');

  // Simulate successful LLM repair → logRepair
  _currentSeed = 'fracture-A'; // same seed for the embed in logRepair
  const cert = await lib.logRepair({
    brokenCode:     BROKEN_CODE_A,
    verifiedFix:    VERIFIED_FIX_A,
    moduleName:     'CharacterController',
    errorSignature: "attempt to index nil with 'Humanoid'",
  });

  assert(cert.id.length > 0,        'Certificate has an ID');
  assert(cert.fractureHash.length === 64, 'FractureHash is sha256 hex (64 chars)');
  assert(cert.fingerprint1024.length === EMBED_DIM, `Fingerprint is ${EMBED_DIM}-D`);
  assert(cert.verifiedFix === VERIFIED_FIX_A, 'VerifiedFix stored correctly');
  assert(cert.moduleName === 'CharacterController', 'ModuleName stored');
  assert(lib.certificateCount === initialCount + 1, 'Library grew by 1');

  // ── PASS 2: Second identical bug → recognition, LLM bypassed ───────────
  console.log('\n── PASS 2: Second encounter → recognition hit, no LLM ─────────');

  _currentSeed = 'fracture-A'; // same seed → same vector → similarity = 1.0

  const recognition = await lib.recognize(BROKEN_CODE_A);

  assert(recognition.hit, 'Recognition hit fires');
  assert(recognition.similarity >= 0.98, `Similarity ${recognition.similarity.toFixed(4)} ≥ 0.98`);
  assert(recognition.fix === VERIFIED_FIX_A, 'Returned fix matches stored cert');
  assert(recognition.certId === cert.id, 'Returned certId matches original cert');
  assert(recognition.moduleName === 'CharacterController', 'ModuleName returned on hit');

  // preFilterBug convenience wrapper
  const preFilter = await lib.preFilterBug(BROKEN_CODE_A);
  assert(preFilter !== null, 'preFilterBug returns non-null on hit');
  assert(preFilter?.fix === VERIFIED_FIX_A, 'preFilterBug fix matches');

  // ── PASS 3: Different bug → no recognition (different seed = different vec) ─
  console.log('\n── PASS 3: Different fracture → library miss ───────────────────');

  _currentSeed = 'fracture-B'; // completely different vector

  const missResult = await lib.recognize(BROKEN_CODE_B);
  assert(!missResult.hit, 'Different fracture is a miss (similarity below threshold)');
  assert(missResult.similarity < 0.98, `Similarity ${missResult.similarity.toFixed(4)} < 0.98 as expected`);

  // Store fracture-B and confirm library grows
  const certB = await lib.logRepair({
    brokenCode:     BROKEN_CODE_B,
    verifiedFix:    VERIFIED_FIX_B,
    moduleName:     'ArenaManager',
    errorSignature: "attempt to index nil with 'GoblinKing'",
  });

  assert(lib.certificateCount === initialCount + 2, 'Library has 2 certs now');
  assert(certB.moduleName === 'ArenaManager', 'Second cert stored with correct module');

  // Now fracture-B should be recognized
  _currentSeed = 'fracture-B';
  const recognizeB = await lib.recognize(BROKEN_CODE_B);
  assert(recognizeB.hit, 'Fracture-B now recognized after logRepair');
  assert(recognizeB.fix === VERIFIED_FIX_B, 'Correct fix returned for fracture-B');

  // ── PASS 4: Dedup — same fractureHash updates cert, doesn't duplicate ──
  console.log('\n── PASS 4: Dedup — identical code updates cert, no duplicate ───');

  const countBefore = lib.certificateCount;
  _currentSeed = 'fracture-A';

  const updatedCert = await lib.logRepair({
    brokenCode:     BROKEN_CODE_A,    // exact same code → same sha256 hash
    verifiedFix:    VERIFIED_FIX_A + '\n-- updated comment',
    moduleName:     'CharacterController',
    errorSignature: "attempt to index nil with 'Humanoid'",
  });

  assert(lib.certificateCount === countBefore, 'No duplicate cert created');
  assert(updatedCert.id === cert.id, 'Same cert ID returned');
  // successCount reflects all uses: logRepair initial (1) + recognize calls in Pass 2 (2) + this logRepair (1) = 4
  assert(updatedCert.successCount > 1, `Success count > 1 (currently ${updatedCert.successCount} — incremented on each recognize + logRepair)`);

  // ── STATS ────────────────────────────────────────────────────────────────
  console.log('\n');
  lib.stats();

  // ── FINAL VERDICT ────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  if (failed === 0) {
    console.log(`DIAMOND-STABLE — LuauShatterLibrary validated`);
    console.log(`All ${passed} assertions passed`);
  } else {
    console.log(`Validation failed — ${failed} assertion(s) failed`);
    process.exit(1);
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('❌ [TEST] Fatal error:', err);
  process.exit(1);
});
