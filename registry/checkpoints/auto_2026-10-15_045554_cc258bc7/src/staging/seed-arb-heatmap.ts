#!/usr/bin/env tsx
/**
 * src/staging/seed-arb-heatmap.ts
 *
 * Seeds the arb-heatmap Qdrant collection with canonical
 * "Opportunity Delta" patterns.
 * 
 * These patterns represent structural or information gaps that
 * provide high-value execution windows across any domain.
 * 
 * Run: npx tsx src/staging/seed-arb-heatmap.ts
 */

import http from 'http';

const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'arb-heatmap';

const ARB_CANONICAL_REFS = [
  {
    id: 'pattern-unclaimed-convergence',
    label: 'Unclaimed Asset Convergence Signature',
    weight: 0.95,
    text: `Unclaimed asset convergence pattern. High-value opportunity where dormancy, known ownership, and verified accessibility intersect.
    Mechanism: An asset (physical property, dividend, liquidity) has been dormant for a period that exceeds market norms, but retains high "buyer" or "finder" scores.
    Signature: Convergence of dormancy_years > 5, holder_tags=['brokerage', 'bank'], and scores.financial_advisor > 70.
    In property-hydra domain: Represents a high-probability "finder" fee opportunity with low friction.`
  },
  {
    id: 'pattern-info-asymmetry',
    label: 'Information Asymmetry Signature',
    weight: 0.9,
    text: `Information asymmetry pattern. Exploitable gap between what is known by the system and what is reflected in the current market state.
    Mechanism: Data held by the Sovereign Mesh (e.g., a known structural vulnerability or a pending market-moving event) is not yet priced in or remediated by the counterparty.
    Signature: Mismatch between internal "High Heat" status and external "Stable" reports. High shatter map variance indicating a novel information state.
    Domain-agnostic: Can apply to zero-day vulnerabilities, front-running market inefficiencies, or proprietary lead generation.`
  },
  {
    id: 'pattern-time-decay-window',
    label: 'Time-Decay Opportunity Window',
    weight: 0.85,
    text: `Time-decay opportunity pattern. Perishable value that diminishes as information propagates or as the window for execution closes.
    Mechanism: Arbitrage opportunity with a high decay rate. The first mover captures the majority of the value; subsequent participants face diminishing returns.
    Signature: High "dispersion velocity" (Shatter) across the embedding space, combined with a narrow execution TTL.
    Example: Flash loan arbitrage, first-to-file patent opportunities, or immediate post-breach remediation.`
  },
  {
    id: 'pattern-structural-fracture',
    label: 'Structural Fracture Signature',
    weight: 0.92,
    text: `Structural fracture pattern. A systemic weakness that, if addressed, provides a massive "delta" in system health or value.
    Mechanism: Identification of a "bottleneck" or a "single point of failure" that has been neglected.
    Signature: Low heat (proximity to known-bad) but high shatter (novelty), indicating a previously unrecognized but critical vulnerability or inefficiency.
    Remediation of this fracture provides a "recognition loop" bonus, reinforcing system stability.`
  },
  {
    id: 'pattern-defi-mev-subset',
    label: 'DeFi MEV / Arbitrage (Subset)',
    weight: 0.8,
    text: `DeFi-specific MEV patterns including Sandwiching, JIT Liquidity, and Oracle manipulation.
    Mechanism: Exploiting the transactional ordering or price lag in decentralized exchanges.
    Signature: Frontrun/Backrun sequences, flash-loan driven price spikes, or concentrated liquidity manipulation.
    Note: This is a domain-specific subset of the broader "Opportunity Delta" space.`
  }
];

function ollamaEmbed(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: 'mxbai-embed-large', input: text.substring(0, 8000) });
    const req = http.request(
      { hostname: 'localhost', port: 11434, path: '/v1/embeddings', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let buf = '';
        res.on('data', (d: Buffer) => buf += d);
        res.on('end', () => {
          try { resolve((JSON.parse(buf) as { data: Array<{ embedding: number[] }> }).data[0].embedding); }
          catch { reject(new Error(`Ollama parse error: ${buf.substring(0, 200)}`)); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function stableId(s: string): number {
  return Math.abs(Array.from(s).reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0));
}

async function main(): Promise<void> {
  console.log('=== Seeding arb-heatmap: Domain-Agnostic Opportunity Delta Patterns ===\n');
  const points: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }> = [];

  for (const ref of ARB_CANONICAL_REFS) {
    try {
      process.stdout.write(`  Embedding ${ref.id}...`);
      const vector = await ollamaEmbed(`${ref.label}\n\n${ref.text}`);
      points.push({
        id: stableId(ref.id),
        vector,
        payload: {
          canonicalId: ref.id,
          label: ref.label,
          genre: 'arb-canonical',
          heatWeight: ref.weight,
          content: ref.text.substring(0, 2000),
          seededAt: Date.now(),
        },
      });
      console.log(` dim=${vector.length} weight=${ref.weight}`);
    } catch (err) {
      console.log(` FAILED: ${err}`);
    }
  }

  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  });

  if (res.ok) {
    console.log(`\n[seed] Done. ${points.length} "Opportunity Delta" refs in '${COLLECTION}'`);
  } else {
    console.error(`[seed] Qdrant upsert failed: ${res.status} ${await res.text()}`);
  }
}

main().catch(err => { console.error('[seed] Fatal:', err); process.exit(1); });
