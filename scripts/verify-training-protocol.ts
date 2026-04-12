import { TrainingPipelineSchema } from '../popsim-contract/src/domains/roblox/training-protocol.ts';
import { z } from 'zod';

/**
 * 🛰️ PROTOCOL VERIFICATION SCRIPT (OMC-ALIGNED)
 * Tests the new Roblox Training Protocol Zod schemas.
 * Verifies SAFE/ARMED gating logic for 'Vampire' ingestion.
 */

const mockSafeIngestion = {
  intentSignature: '0xblake2b_safe_signature',
  gate: 'SAFE',
  disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
  humanReviewRequired: false,
  domain: 'training-pipeline',
  sourceGame: {
    name: 'Metropolis Core',
    popularity: 0.85,
    daysSustained: 120,
    url: 'https://roblox.com/games/123456',
    provenance: 'MIT',
  },
  maps: {
    intentSignature: '0xmap_sig',
    gate: 'SAFE',
    disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
    domain: 'shatter-report',
    overallShatter: 0.12,
    diamondStable: true,
    spatial: {
      intentSignature: '0xspatial_sig',
      gate: 'SAFE',
      disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
      domain: 'spatial',
      layoutVectors: Array(3072).fill(0.1),
      shatterVariance: 0.05,
      hotspots: [{ pos: [100, 200], lagMs: 15, provenance: 'G1' }]
    },
    structural: {
      intentSignature: '0xstructural_sig',
      gate: 'SAFE',
      disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
      domain: 'structural',
      graphNodes: [{ id: '550e8400-e29b-41d4-a716-446655440000', type: 'core', integralScore: 9.5 }],
      dependencies: [['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']],
      glitches: []
    },
    research: {
      intentSignature: '0xresearch_sig',
      gate: 'SAFE',
      disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
      domain: 'research',
      embeddedDocs: Array(3072).fill(0.2),
      resonanceScores: { 'superbullet': 0.9 },
      patterns: ['efficiency-loop'],
      sourceProvenance: ['https://forum.roblox.com']
    }
  },
  cycles: [
    {
      intentSignature: '0xcycle_sig',
      gate: 'SAFE',
      disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
      humanReviewRequired: false,
      domain: 'repair-cycle',
      stage: 'logic',
      inputPrototype: {
        url: 'https://github.com/Metropolis/shard-alpha',
        version: 'v0.1',
        initialShatter: 0.8
      },
      guidanceMap: {
        intentSignature: '0xmap_sig_internal',
        gate: 'SAFE',
        disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
        domain: 'shatter-report',
        overallShatter: 0.12,
        diamondStable: true,
        spatial: {
          intentSignature: '0xspatial_sig',
          gate: 'SAFE',
          disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
          domain: 'spatial',
          layoutVectors: Array(3072).fill(0.1),
          shatterVariance: 0.05,
          hotspots: []
        },
        structural: {
          intentSignature: '0xstructural_sig',
          gate: 'SAFE',
          disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
          domain: 'structural',
          graphNodes: [],
          dependencies: [],
          glitches: []
        },
        research: {
          intentSignature: '0xresearch_sig',
          gate: 'SAFE',
          disclaimer: 'Fictional sim artifact—OMC governed, no real-world application',
          domain: 'research',
          embeddedDocs: Array(3072).fill(0.1),
          resonanceScores: {},
          patterns: [],
          sourceProvenance: []
        }
      },
      edits: [{ file: 'Main.lua', diff: '+ logic', rationale: 'Alignment', intentSig: '0xedit' }],
      evalMetrics: {
        resonance: 0.9,
        shatterReduction: 0.7,
        playability: 95
      },
      output: {
        url: 'https://github.com/Metropolis/shard-beta',
        version: 'v0.2',
        finalShatter: 0.1
      },
      cycleCount: 1,
      humanReviewRequired: false
    }
  ],
  finalEval: {
    playability: 98,
    latencyMs: 120,
    shatterReductionTotal: 0.85,
    disclaimer: 'Fictional sim artifact—OMC SAFE/ARMED enforced'
  },
  diamondStable: true
};

console.log('--- STARTING PROTOCOL VERIFICATION ---');

try {
  console.log('Validating Mock Ingestion...');
  TrainingPipelineSchema.parse(mockSafeIngestion);
  console.log('✅ VERIFICATION PASSED: TrainingPipelineSchema correctly validated Diamond-Stable ingestion.');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ VERIFICATION FAILED: Schema rejected valid ingestion.');
    console.error(JSON.stringify(error.errors, null, 2));
  } else {
    console.error('❌ UNKNOWN ERROR:', error);
  }
}

console.log('--- VERIFICATION COMPLETE ---');
