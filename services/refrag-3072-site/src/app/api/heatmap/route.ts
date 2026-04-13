import { NextResponse } from 'next/server';

const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'spectral-heatmap';

export async function GET() {
  try {
    const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/scroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 100, with_vector: false, with_payload: true }),
    });

    if (!res.ok) throw new Error(`Qdrant: ${res.statusText}`);

    const data = await res.json();
    const allPoints = data.result.points;

    // Separate game points from graph metadata
    const graphMeta = allPoints.find((p: any) => p.payload?.kind === 'graph_metadata');
    const gamePoints = allPoints
      .filter((p: any) => p.payload?.kind !== 'graph_metadata')
      .map((p: any) => ({
        id: p.id,
        file: p.payload.file,
        genre: p.payload.genre,
        kind: p.payload.kind,
        position3d: p.payload.position3d,
        heat: p.payload.heat,
        shatter: p.payload.shatter,
        sectorScores: p.payload.sectorScores,
        nearestCanonical: p.payload.nearestCanonical,
        heatKernelRow: p.payload.heatKernelRow,
        eigenvalues: p.payload.eigenvalues,
        deltaVector3d: p.payload.deltaVector3d,
        deltaTarget: p.payload.deltaTarget,
      }));

    return NextResponse.json({
      status: 'ok',
      count: gamePoints.length,
      points: gamePoints,
      graph: graphMeta ? {
        adjacencyMatrix: graphMeta.payload.adjacencyMatrix,
        heatKernelMatrix: graphMeta.payload.heatKernelMatrix,
        eigenvalues: graphMeta.payload.eigenvalues,
        fileOrder: graphMeta.payload.fileOrder,
      } : null,
    });
  } catch (error: any) {
    console.error('HEATMAP_API_FAILURE:', error);
    return NextResponse.json({ status: 'error', message: error.message, points: [], graph: null }, { status: 500 });
  }
}
