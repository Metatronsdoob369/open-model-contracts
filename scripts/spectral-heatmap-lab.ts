#!/usr/bin/env npx tsx
/**
 * Spectral Heatmap Lab — Real Embeddings, Real Math, Real Qdrant
 *
 * Embeds 8 Lua game files (6 canonical + 2 shattered) via OpenAI text-embedding-3-large,
 * computes 5 heat map representations per Eve_v2 spectral config, stores in Qdrant.
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../popsim-contract/.env') });

const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'spectral-heatmap';
const DIMS = 3072;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Eve_v2 Spectral Config ──────────────────────────────────
const EVE = {
  heat_tau: 0.1,
  low_k: 8,       // max = number of points
  tau: 0.85,
  sectorWeights: {
    OMC_Threading:      0.95,
    OMC_DataStore_Queue: 0.90,
    OMC_Governance:     0.98,
    Client_Visual:      0.40,
    Mock_TestLayer:     0.70,
  } as Record<string, number>,
};

const SECTORS = Object.keys(EVE.sectorWeights);
const DIMS_PER_SECTOR = Math.floor(DIMS / SECTORS.length);

// ── File Manifest ───────────────────────────────────────────
const ROOT = path.resolve(import.meta.dirname, '..');
const FILES = [
  { rel: 'data/ingestion-landing/tycoon/PizzaPlace_GameService.lua', genre: 'tycoon', kind: 'canonical' },
  { rel: 'data/ingestion-landing/tycoon/PizzaPlace_Main.lua',        genre: 'tycoon', kind: 'canonical' },
  { rel: 'data/ingestion-landing/tycoon/SupportLibrary.lua',         genre: 'tycoon', kind: 'canonical' },
  { rel: 'data/ingestion-landing/tycoon/Global_Law.lua',             genre: 'tycoon', kind: 'canonical' },
  { rel: 'data/ingestion-landing/shooter/partner_superbullet.lua',   genre: 'shooter', kind: 'canonical' },
  { rel: 'data/ingestion-landing/tag/TagGameClient.lua',             genre: 'tag',     kind: 'canonical' },
  { rel: 'data/shattered/trial-batch/PizzaPlace_GameService_SHATTERED.lua', genre: 'tycoon',  kind: 'shattered' },
  { rel: 'data/shattered/trial-batch/SuperBullet_SHATTERED.lua',            genre: 'shooter', kind: 'shattered' },
];

// ── Vector Math ─────────────────────────────────────────────
function dot(a: number[], b: number[]): number {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s;
}
function l2(a: number[]): number { return Math.sqrt(dot(a, a)); }
function cosine(a: number[], b: number[]): number {
  const na = l2(a), nb = l2(b);
  return na > 0 && nb > 0 ? dot(a, b) / (na * nb) : 0;
}
function vecSub(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i]);
}
function vecScale(a: number[], s: number): number[] {
  return a.map(v => v * s);
}
function normalize(a: number[]): number[] {
  const n = l2(a); return n > 0 ? a.map(v => v / n) : a;
}

// ── Matrix Math (small NxN) ─────────────────────────────────
type Mat = number[][];
function zeros(n: number): Mat { return Array.from({ length: n }, () => new Array(n).fill(0)); }
function eye(n: number): Mat { const m = zeros(n); for (let i = 0; i < n; i++) m[i][i] = 1; return m; }
function matMul(A: Mat, B: Mat): Mat {
  const n = A.length, m = B[0].length, k = B.length, C = zeros(n);
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let p = 0; p < k; p++) C[i][j] += A[i][p] * B[p][j];
  return C;
}
function matAdd(A: Mat, B: Mat): Mat { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
function matScale(A: Mat, s: number): Mat { return A.map(r => r.map(v => v * s)); }

// ── Jacobi Eigenvalue Algorithm (symmetric matrices) ────────
function jacobi(M: Mat): { values: number[]; vectors: Mat } {
  const n = M.length;
  let A = M.map(r => [...r]);
  let V = eye(n);

  for (let iter = 0; iter < 200; iter++) {
    let mx = 0, p = 0, q = 1;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[i][j]) > mx) { mx = Math.abs(A[i][j]); p = i; q = j; }
    }
    if (mx < 1e-12) break;

    const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
    const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;

    const nA = A.map(r => [...r]);
    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        nA[i][p] = c * A[i][p] - s * A[i][q]; nA[p][i] = nA[i][p];
        nA[i][q] = s * A[i][p] + c * A[i][q]; nA[q][i] = nA[i][q];
      }
    }
    nA[p][p] = c * c * A[p][p] - 2 * s * c * A[p][q] + s * s * A[q][q];
    nA[q][q] = s * s * A[p][p] + 2 * s * c * A[p][q] + c * c * A[q][q];
    nA[p][q] = 0; nA[q][p] = 0;
    A = nA;

    const nV = V.map(r => [...r]);
    for (let i = 0; i < n; i++) {
      nV[i][p] = c * V[i][p] - s * V[i][q];
      nV[i][q] = s * V[i][p] + c * V[i][q];
    }
    V = nV;
  }

  const values = A.map((r, i) => r[i]);
  return { values, vectors: V };
}

// ── Heat Kernel: H(t) = exp(-t·L) via Taylor series ────────
function heatKernel(L: Mat, t: number): Mat {
  const n = L.length;
  const negTL = matScale(L, -t);
  let result = eye(n);
  let term = eye(n);
  for (let k = 1; k <= 20; k++) {
    term = matScale(matMul(term, negTL), 1 / k);
    result = matAdd(result, term);
  }
  return result;
}

// ── PCA via Kernel Trick (NxN Gram matrix) ──────────────────
function pcaProject3D(vecs: number[][]): number[][] {
  const n = vecs.length;
  // Center
  const mean = new Array(DIMS).fill(0);
  for (const v of vecs) for (let i = 0; i < DIMS; i++) mean[i] += v[i] / n;
  const centered = vecs.map(v => v.map((x, i) => x - mean[i]));

  // Gram matrix
  const G = zeros(n);
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    const d = dot(centered[i], centered[j]);
    G[i][j] = d; G[j][i] = d;
  }

  // Eigendecompose Gram
  const { values, vectors } = jacobi(G);

  // Sort by descending eigenvalue
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const top3 = order.slice(0, 3);

  // Project: coordinate[k] = eigenvector[k][i] * sqrt(eigenvalue[k])
  const scale = 8; // Scale for Three.js scene
  return Array.from({ length: n }, (_, i) => {
    return top3.map(({ v, i: idx }) => {
      const ev = Math.sqrt(Math.max(0, v));
      return vectors[i][idx] * ev * scale;
    });
  });
}

// ── Sector Scoring ──────────────────────────────────────────
function sectorScores(vec: number[], centroid: number[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (let s = 0; s < SECTORS.length; s++) {
    const start = s * DIMS_PER_SECTOR;
    const end = s === SECTORS.length - 1 ? DIMS : (s + 1) * DIMS_PER_SECTOR;
    let distSq = 0;
    for (let i = start; i < end; i++) distSq += (vec[i] - centroid[i]) ** 2;
    const dist = Math.sqrt(distSq);
    // Score: higher = closer to centroid = healthier. Weighted by sector importance.
    scores[SECTORS[s]] = Math.max(0, 1 - dist) * EVE.sectorWeights[SECTORS[s]];
  }
  return scores;
}

// ── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log('\n═══ SPECTRAL HEATMAP LAB ═══\n');

  // 1. Read all files
  console.log('1/6  Reading game files...');
  const samples = FILES.map(f => {
    const abs = path.join(ROOT, f.rel);
    const code = fs.readFileSync(abs, 'utf-8');
    const name = path.basename(f.rel);
    console.log(`     ${f.kind === 'shattered' ? '💥' : '✅'} ${name} (${code.split('\n').length} lines)`);
    return { ...f, name, code };
  });

  // 2. Embed via OpenAI
  console.log('\n2/6  Embedding via text-embedding-3-large (3072-D)...');
  const vectors: number[][] = [];
  for (const s of samples) {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: s.code,
      dimensions: DIMS,
    });
    vectors.push(res.data[0].embedding);
    console.log(`     ✓ ${s.name} embedded`);
  }

  // 3. Compute canonical centroid
  console.log('\n3/6  Computing canonical centroid + per-point metrics...');
  const canonicalIndices = samples.map((s, i) => s.kind === 'canonical' ? i : -1).filter(i => i >= 0);
  const centroid = new Array(DIMS).fill(0);
  for (const idx of canonicalIndices) for (let d = 0; d < DIMS; d++) centroid[d] += vectors[idx][d] / canonicalIndices.length;
  const centroidNorm = normalize(centroid);

  // Per-point metrics
  const pointData = samples.map((s, i) => {
    const vec = vectors[i];
    // Heat: Manhattan resonance (L1 distance from centroid, normalized)
    let manhattan = 0;
    for (let d = 0; d < DIMS; d++) manhattan += Math.abs(vec[d] - centroid[d]);
    const heat = manhattan / DIMS;

    // Shatter: Euclidean distance from centroid
    const shatter = l2(vecSub(vec, centroid));

    // Sector scores
    const sectors = sectorScores(vec, centroid);

    // Nearest canonical
    let bestSim = -1, bestIdx = 0;
    for (const ci of canonicalIndices) {
      if (ci === i) continue;
      const sim = cosine(vec, vectors[ci]);
      if (sim > bestSim) { bestSim = sim; bestIdx = ci; }
    }

    console.log(`     ${s.name}: heat=${heat.toFixed(4)} shatter=${shatter.toFixed(4)} nearest=${samples[bestIdx].name} (cos=${bestSim.toFixed(4)})`);

    return {
      ...s,
      heat,
      shatter,
      sectors,
      nearestCanonical: { file: samples[bestIdx].name, index: bestIdx, similarity: bestSim },
    };
  });

  // 4. Graph-level computations
  console.log('\n4/6  Computing graph Laplacian, heat kernel, eigenvalues...');

  // Adjacency matrix (RBF kernel on cosine distance)
  const n = samples.length;
  const W = zeros(n);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const sim = cosine(vectors[i], vectors[j]);
    const dist = Math.sqrt(2 * Math.max(0, 1 - sim));
    const w = Math.exp(-(dist * dist) / (2 * EVE.tau * EVE.tau));
    W[i][j] = w; W[j][i] = w;
  }

  // Laplacian
  const L = zeros(n);
  for (let i = 0; i < n; i++) {
    let deg = 0;
    for (let j = 0; j < n; j++) { if (i !== j) { L[i][j] = -W[i][j]; deg += W[i][j]; } }
    L[i][i] = deg;
  }

  // Heat kernel H(t) = exp(-t·L)
  const H = heatKernel(L, EVE.heat_tau);
  console.log('     ✓ Heat kernel computed (tau=' + EVE.heat_tau + ')');

  // Eigenvalues
  const { values: eigenvalues, vectors: eigenvectors } = jacobi(L);
  const sortedEigen = [...eigenvalues].sort((a, b) => a - b);
  console.log('     ✓ Eigenvalues:', sortedEigen.map(v => v.toFixed(4)).join(', '));

  // 5. PCA 3D projection
  console.log('\n5/6  PCA projection to 3D...');
  const positions3d = pcaProject3D(vectors);
  for (let i = 0; i < n; i++) {
    console.log(`     ${samples[i].name}: [${positions3d[i].map(v => v.toFixed(2)).join(', ')}]`);
  }

  // Delta vectors for shattered files
  const deltas: (number[] | null)[] = samples.map((s, i) => {
    if (s.kind !== 'shattered') return null;
    const target = pointData[i].nearestCanonical.index;
    return vecSub(positions3d[target], positions3d[i]);
  });

  // 6. Store in Qdrant
  console.log('\n6/6  Storing in Qdrant...');

  // Delete collection if exists
  await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, { method: 'DELETE' }).catch(() => {});

  // Create collection
  const createRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vectors: { size: DIMS, distance: 'Cosine' },
    }),
  });
  if (!createRes.ok) throw new Error(`Failed to create collection: ${await createRes.text()}`);
  console.log('     ✓ Collection created');

  // Upsert points
  const points = pointData.map((p, i) => ({
    id: i + 1,
    vector: vectors[i],
    payload: {
      file: p.name,
      genre: p.genre,
      kind: p.kind,
      position3d: positions3d[i],
      heat: p.heat,
      shatter: p.shatter,
      sectorScores: p.sectors,
      nearestCanonical: { file: p.nearestCanonical.file, similarity: p.nearestCanonical.similarity },
      heatKernelRow: H[i],
      eigenvalues: sortedEigen,
      deltaVector3d: deltas[i],
      deltaTarget: deltas[i] ? p.nearestCanonical.file : null,
    },
  }));

  const upsertRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  });
  if (!upsertRes.ok) throw new Error(`Failed to upsert: ${await upsertRes.text()}`);
  console.log(`     ✓ ${points.length} points upserted`);

  // Store graph-level metadata as a separate point (id=100)
  const graphPoint = {
    id: 100,
    vector: centroid,
    payload: {
      kind: 'graph_metadata',
      adjacencyMatrix: W,
      laplacian: L,
      heatKernelMatrix: H,
      eigenvalues: sortedEigen,
      centroid3d: [0, 0, 0], // centroid projects to origin after PCA centering
      fileOrder: samples.map(s => s.name),
    },
  };

  const metaRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: [graphPoint] }),
  });
  if (!metaRes.ok) throw new Error(`Failed to store metadata: ${await metaRes.text()}`);
  console.log('     ✓ Graph metadata stored');

  // Summary
  console.log('\n═══ COMPLETE ═══');
  console.log(`Collection: ${COLLECTION}`);
  console.log(`Points: ${points.length} game files + 1 graph metadata`);
  console.log(`Modes ready: Thermal Distance, Sector Radar, Heat Diffusion, Eigenvalue Terrain, Delta Vector Field`);
  console.log(`Dashboard: http://localhost:3000\n`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
