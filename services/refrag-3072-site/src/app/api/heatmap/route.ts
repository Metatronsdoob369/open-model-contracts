import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

type HeatmapData = {
  id: string;
  file: string;
  genre: 'MOVEMENT' | 'PERSISTENCE' | 'INTERACTION' | 'VISUALS';
  kind: 'canonical' | 'shattered';
  position3d: [number, number, number];
  heat: number;
  shatter: number;
  source: string;
  capabilityStrength: number;
};

const GENRE_ANCHORS = {
  MOVEMENT: [-6, 0, 0],
  INTERACTION: [6, 0, 0],
  VISUALS: [0, 6, 0],
  PERSISTENCE: [0, -6, 0]
};

export async function GET() {
  const points: HeatmapData[] = [];
  const HUD_PATH = '/Users/joewales/METROPOLIS_HUD/telemetry.json';
  
  let liveTelemetry = { status: 'OK', tau: 0.7, lastShard: 'IDLE', cycle: 0 };
  let manifest: any[] = [];
  
  if (existsSync(HUD_PATH)) {
    try {
      liveTelemetry = JSON.parse(readFileSync(HUD_PATH, 'utf-8'));
    } catch (e) {}
  }

  // 1. INGEST THE SHATTER MANIFEST FROM PI
  const PI_MANIFEST = '/Users/joewales/METROPOLIS_HUD/manifest.json';
  if (existsSync(PI_MANIFEST)) {
    try {
      manifest = JSON.parse(readFileSync(PI_MANIFEST, 'utf-8'));
    } catch (e) {}
  }

  // 2. MANIFEST THE REAL INDUSTRIAL SHARDS WITH SIGNATURE AUDIT
  manifest.forEach((item, i) => {
    const rawData = item.shard + (item.payload || "");
    
    // DEFIFIER SIGNATURES (Flash Loan / Price Manipulation)
    const isDeFi_Source = /0x70a08231|0x18160ddd|0x0902f1ac|0x24b31a0c/.test(rawData);
    const isDeFi_Sink   = /0xa9059cbb|0x23b872dd|0x2e1a7d4d|0xd6febde8|0xd79875eb/.test(rawData);
    
    // S7 INDUSTRIAL SIGNATURES (KIT 1000181993)
    const isSiemens = item.shard.includes('siemens') || /0x32010000/.test(rawData);
    const isENIP = item.shard.includes('enip');
    const isVuln = item.targetFlag === 'VULN_CLUSTER_A' || isDeFi_Source; // DeFi Source is a critical Vuln
    
    let genre: 'MOVEMENT' | 'PERSISTENCE' | 'INTERACTION' | 'VISUALS' = 
      isDeFi_Source || isDeFi_Sink ? 'MOVEMENT' : (isSiemens || isENIP ? 'PERSISTENCE' : 'INTERACTION');
    
    if (isVuln) genre = 'PERSISTENCE'; // Force High-Risk to Persistence (Red)
    
    // DETERMINISTIC TARGETING OVER QUADMAP TOPOLOGY
    const basePos = isVuln ? [4, 4, 4] : GENRE_ANCHORS[genre];

    points.push({
      id: `shard_${i}`,
      file: item.shard.split('_SHARD_')[0] + '.shrd',
      genre: genre as any,
      kind: item.resonance > 0.8 ? 'canonical' : 'shattered',
      position3d: [
        basePos[0] + (Math.random() - 0.5) * (isVuln ? 1 : 4),
        basePos[1] + (Math.random() - 0.5) * (isVuln ? 1 : 4),
        basePos[2] + (Math.random() - 0.5) * (isVuln ? 1 : 4)
      ],
      heat: isDeFi_Source ? 1.0 : (isDeFi_Sink ? 0.9 : item.resonance),
      shatter: isDeFi_Source ? 0.8 : (liveTelemetry.tau / 100),
      source: isDeFi_Source ? 'DEFI_TAINTER_LOCK' : (isVuln ? 'VULN_SNIPER_LOCK' : 'Industrial_Node'),
      capabilityStrength: Math.floor((isDeFi_Source ? 0.99 : item.resonance) * 100)
    });
  });

  // 3. ADD THE MONAD (CENTROID)
  points.push({
    id: 'monad',
    file: 'REFRAG_MONAD_V1',
    genre: 'MOVEMENT',
    kind: 'canonical',
    position3d: [0, 0, 0],
    heat: liveTelemetry.status === 'HOLD' ? 1.0 : 0.5,
    shatter: 0,
    source: 'Pi_Node_15',
    capabilityStrength: 100
  });

  return NextResponse.json({ 
    status: 'ok', 
    points, 
    cycle: liveTelemetry.cycle,
    tau: liveTelemetry.tau,
    holdState: liveTelemetry.status === 'HOLD'
  });
}
