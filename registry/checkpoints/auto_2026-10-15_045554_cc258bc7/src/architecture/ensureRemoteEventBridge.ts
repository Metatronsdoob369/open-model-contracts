// src/architecture/ensureRemoteEventBridge.ts
import { RegisterIssue } from '../omc/governance';

export interface BridgeMetadata {
  id: string;
  name: string;
  sourceRoom: string;
  targetRoom: string;
  fracturePath: string;
  created: boolean;   // true if newly created this mutation
}

export async function ensureRemoteEventBridge(
  sourceRoom: string,
  targetRoom: string,
  fracturePath: string
): Promise<BridgeMetadata> {

  // Canonical bridge naming
  const bridgeName = `Bridge_${sourceRoom}_to_${targetRoom}_${fracturePath.replace(/[^a-zA-Z0-9]/g, '')}`;

  // In a real implementation, check if the RemoteEvent already exists in ReplicatedStorage.
  // For this minimal loop, we simulate creation.
  const exists = false; // TODO: replace with actual ReplicatedStorage check when integrating

  if (!exists) {
    RegisterIssue("BridgeCreated", {
      bridgeName,
      sourceRoom,
      targetRoom,
      fracturePath
    });
  }

  return {
    id: bridgeName,
    name: bridgeName,
    sourceRoom,
    targetRoom,
    fracturePath,
    created: !exists
  };
}
