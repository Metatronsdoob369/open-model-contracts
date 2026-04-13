import { NextResponse } from 'next/server';

/**
 * MISSION CONTROL MEMORY API
 * Bridge to the Sovereign Vault (Qdrant:6340)
 */
export async function GET() {
  const QDRANT_URL = 'http://localhost:6340';
  const COLLECTION = 'cif-memory';

  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/scroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 100,
        with_vector: true,
        with_payload: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vault Offline: ${response.statusText}`);
    }

    const data = await response.json();
    const points = data.result.points.map((p: any, i: number) => {
      // 3072-D Projection Logic: Simple XYZ Mapping for the Radar
      // We use the first 3 indices of the 3072-D IntentSignature
      const vector = p.vector;
      
      // Heuristic: Map 3D space by clustering vectors
      // We magnify the coordinates to fit the Three.js scene [0,0,15]
      const scale = 20;
      return {
        id: p.id,
        position: [
          vector[0] * scale,
          vector[1] * scale,
          vector[2] * scale,
        ],
        heatmap: p.payload?.confidence || 0.8,
        label: p.payload?.text?.substring(0, 50) || "Neural_Node",
        source: p.payload?.source || "Sealed_Vault"
      };
    });

    return NextResponse.json({ 
      status: 'ok', 
      count: points.length,
      points 
    });

  } catch (error: any) {
    console.error("MISSION_CONTROL_API_FAILURE:", error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      points: [] 
    }, { status: 500 });
  }
}
