import fetch from 'node-fetch';

const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'spectral-heatmap';

function computePCA(vectors: number[][], dims: number = 3): number[][] {
  const n = vectors.length;
  const m = vectors[0].length;

  // Center the data
  const mean = new Array(m).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < m; i++) mean[i] += v[i];
  }
  for (let i = 0; i < m; i++) mean[i] /= n;

  const centered = vectors.map(v => v.map((x, i) => x - mean[i]));

  // Compute covariance matrix
  const cov = Array(m).fill(0).map(() => Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = i; j < m; j++) {
      let sum = 0;
      for (const v of centered) sum += v[i] * v[j];
      cov[i][j] = sum / (n - 1);
      cov[j][i] = sum / (n - 1);
    }
  }

  // Power iteration for top eigenvectors
  const eigenvectors: number[][] = [];
  let remaining = centered.map(v => [...v]);

  for (let d = 0; d < dims; d++) {
    let v = Array(m).fill(0).map(() => Math.random());
    v = v.map(x => x / Math.sqrt(v.reduce((s, x) => s + x * x, 0)));

    for (let iter = 0; iter < 100; iter++) {
      const newV = Array(m).fill(0);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) newV[i] += cov[i][j] * v[j];
      }
      const norm = Math.sqrt(newV.reduce((s, x) => s + x * x, 0));
      if (norm < 0.0001) break;
      v = newV.map(x => x / norm);
    }

    eigenvectors.push(v);

    // Deflate covariance
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        cov[i][j] -= v[i] * v[j] * 100; // Simple deflation
      }
    }
  }

  // Project onto eigenvectors
  return vectors.map(v => {
    const result: number[] = [];
    for (const e of eigenvectors) {
      let sum = 0;
      for (let i = 0; i < m; i++) sum += v[i] * e[i];
      result.push(sum);
    }
    return result;
  });
}

async function main() {
  console.log('=== Computing PCA for all points ===\n');

  // Fetch all points with vectors
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/scroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 100, with_vector: true, with_payload: true })
  });

  const data: any = await res.json();
  const points = data.result.points;

  console.log(`Found ${points.length} points in Qdrant`);

  // Extract vectors
  const vectors = points.map((p: any) => p.vector);
  const ids = points.map((p: any) => p.id);

  console.log('Computing PCA (3072D -> 3D)...');
  const positions3d = computePCA(vectors, 3);

  console.log('Updating points with 3D positions...');

  // Update each point with new position, one at a time
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const pos = positions3d[i];

    try {
      const updateRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: [{
            id: point.id,
            payload: {
              ...point.payload,
              position3d: pos
            }
          }]
        })
      });

      if (i % 5 === 0) console.log(`  Updated ${i + 1}/${points.length}`);
    } catch (e) {
      console.log(`  Retry ${i + 1}...`);
      await new Promise(r => setTimeout(r, 500));
      i--;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log('All points now have 3D positions. Refresh the dashboard.');
}

main().catch(console.error);
