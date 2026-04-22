// src/embedder/embedWithTime.ts
import { CanonicalNode4D, TemporalSignature } from '../types/canonical-4d';
import { SpectraMappingService } from '../popsim-contract/SpectraMappingService'; // your existing 3072D service

export interface ExecutionTrace {
  timestamp: number;
  phase: string;
}

export function embedWithTime(
  code: string,
  executionTraces: ExecutionTrace[]
): CanonicalNode4D {

  // DEFIFIER / S7 SIGNATURES
  const isDeFi = /0x70a08231|0x18160ddd|0x0902f1ac|0x24b31a0c/.test(code);
  const isS7   = /0x32010000/.test(code);

  const spatialEmbedding = SpectraMappingService.embed(code);

  // Build temporal signatures with Signature Modulation
  const temporalSignatures: TemporalSignature[] = executionTraces.map(trace => ({
    timestamp: trace.timestamp,
    phase: trace.phase,
    heatEvolution: isDeFi ? 0.98 : (isS7 ? 0.85 : calculateHeatEvolution(spatialEmbedding, trace.timestamp)),
    shatterVelocity: isDeFi ? 0.75 : calculateShatterVelocity(spatialEmbedding, trace),
  }));

  return {
    id: `node_${Date.now()}`,
    room: classifyRoom(code),
    spatialEmbedding,
    temporalSignatures,
    heat: temporalSignatures.reduce((sum, t) => sum + t.heatEvolution, 0) / temporalSignatures.length,
    shatter: temporalSignatures.reduce((sum, t) => sum + t.shatterVelocity, 0) / temporalSignatures.length,
    lastUpdated: Date.now(),
    version: 1,
  };
}

// Simple placeholders - replace with your actual heat kernel logic when ready
function calculateHeatEvolution(embedding: number[], timestamp: number): number {
  return 0.65 + Math.random() * 0.35; // stub
}

function calculateShatterVelocity(embedding: number[], trace: ExecutionTrace): number {
  return 0.4 + Math.random() * 0.6; // stub - will be replaced with Manhattan Phase-Normalized version
}

function classifyRoom(code: string): string {
  // SIGNATURE-BASED CLASSIFICATION - WEB3 / ICS / BLOCKCHAIN ONLY
  const isWeb3 = /0x70a08231|0x18160ddd|0x0902f1ac|0x24b31a0c/.test(code);
  const isICS  = /0x32010000/.test(code);

  if (isWeb3) return "ROOM-02_WorldState"; // DeFi WorldState
  if (isICS)  return "OMC_Governance";    // Industrial Governance

  if (code.includes("DataStore") || code.includes("Contract") || code.includes("Wallet") || code.includes("Address")) {
    return "ROOM-02_WorldState";
  }
  
  return "OMC_Governance"; // Default to Sovereign Governance
}
