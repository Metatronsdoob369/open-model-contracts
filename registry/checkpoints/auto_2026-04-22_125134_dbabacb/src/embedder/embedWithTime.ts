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

  // Use your existing 3072D embedder (SpectraMappingService)
  const spatialEmbedding = SpectraMappingService.embed(code);

  // Build temporal signatures from runtime traces
  const temporalSignatures: TemporalSignature[] = executionTraces.map(trace => ({
    timestamp: trace.timestamp,
    phase: trace.phase,
    heatEvolution: calculateHeatEvolution(spatialEmbedding, trace.timestamp),
    shatterVelocity: calculateShatterVelocity(spatialEmbedding, trace),
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
  if (code.includes("DataStore") || code.includes("SaveProfile") || code.includes("Global")) {
    return "ROOM-02_WorldState";
  }
  if (code.includes("CharacterAdded") || code.includes("rowdy") || code.includes("IT") || code.includes("Grok_")) {
    return "Client_Visual";
  }
  return "OMC_Governance";
}
