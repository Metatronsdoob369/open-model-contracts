import { NextResponse } from 'next/server';

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
  
  // 1. MOVEMENT CLUSTER (Hardened)
  const movementFiles = ['CharacterService', 'MobilityController', 'Sovereign_Auditor'];
  movementFiles.forEach((file, i) => {
    points.push({
      id: `mov_${i}`,
      file: file + '.luau',
      genre: 'MOVEMENT',
      kind: 'canonical',
      position3d: [
        GENRE_ANCHORS.MOVEMENT[0] + (Math.random() - 0.5) * 3,
        GENRE_ANCHORS.MOVEMENT[1] + (Math.random() - 0.5) * 3,
        GENRE_ANCHORS.MOVEMENT[2] + (Math.random() - 0.5) * 3
      ],
      heat: 0.1,
      shatter: 0.05,
      source: 'Metropolis',
      capabilityStrength: 95
    });
  });

  // 2. INTERACTION CLUSTER (Active Swarm)
  const interactionFiles = ['TagGameService', 'VictimService', 'TagLogic', 'TagBot'];
  interactionFiles.forEach((file, i) => {
    points.push({
      id: `int_${i}`,
      file: file + '.luau',
      genre: 'INTERACTION',
      kind: 'canonical',
      position3d: [
        GENRE_ANCHORS.INTERACTION[0] + (Math.random() - 0.5) * 4,
        GENRE_ANCHORS.INTERACTION[1] + (Math.random() - 0.5) * 4,
        GENRE_ANCHORS.INTERACTION[2] + (Math.random() - 0.5) * 4
      ],
      heat: 0.2,
      shatter: 0.1,
      source: 'Grok_Hardened',
      capabilityStrength: 92
    });
  });

  // 3. VISUALS CLUSTER (Atmospheric)
  const visualFiles = ['AtmosphereController', 'DanceFloorService', 'MetropolisLighting'];
  visualFiles.forEach((file, i) => {
    points.push({
      id: `vis_${i}`,
      file: file + '.luau',
      genre: 'VISUALS',
      kind: 'shattered', // Tagging as shattered because of the Bloom fixes
      position3d: [
        GENRE_ANCHORS.VISUALS[0] + (Math.random() - 0.5) * 3,
        GENRE_ANCHORS.VISUALS[1] + (Math.random() - 0.5) * 3,
        GENRE_ANCHORS.VISUALS[2] + (Math.random() - 0.5) * 3
      ],
      heat: 0.4,
      shatter: 0.3,
      source: 'Cathedral',
      capabilityStrength: 75
    });
  });

  // 4. PERSISTENCE CLUSTER (THE GAP - Fragmented)
  const persistenceFiles = ['Orphaned_DataStore_Logic'];
  persistenceFiles.forEach((file, i) => {
    points.push({
      id: `per_${i}`,
      file: file + '.luau',
      genre: 'PERSISTENCE',
      kind: 'shattered',
      position3d: [
        GENRE_ANCHORS.PERSISTENCE[0] + (Math.random() - 0.5) * 2,
        GENRE_ANCHORS.PERSISTENCE[1] + (Math.random() - 0.5) * 2,
        GENRE_ANCHORS.PERSISTENCE[2] + (Math.random() - 0.5) * 2
      ],
      heat: 0.9,
      shatter: 0.8,
      source: 'Legacy_Draft',
      capabilityStrength: 20
    });
  });

  return NextResponse.json({ status: 'ok', points });
}
