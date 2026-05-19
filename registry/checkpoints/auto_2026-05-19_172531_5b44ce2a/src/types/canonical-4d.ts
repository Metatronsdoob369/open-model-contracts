export interface TemporalSignature {
  timestamp: number;
  phase: string;
  heatEvolution: number;
  shatterVelocity: number;
}

export interface CanonicalNode4D {
  id: string;
  room: string;
  spatialEmbedding: number[];           // your 3072D vector
  temporalSignatures: TemporalSignature[];
  heat: number;
  shatter: number;
  lastUpdated: number;
  version: number;
}
