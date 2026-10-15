// src/architecture/rewireRooms.ts
import { graph } from '../canonical/QuadMap';
import { sequencerQueue } from '../sequencer/queue';
import { ensureRemoteEventBridge } from './ensureRemoteEventBridge';
import { RegisterIssue } from '../omc/governance';

export interface RewireRoomsSignal {
  sourceRoom: string;
  targetRoom: string;
  fracturePath: string;
  velocity: number;
  selectedContract: string;
}

export async function rewireRooms(signal: RewireRoomsSignal): Promise<void> {
  const { sourceRoom, targetRoom, fracturePath, velocity, selectedContract } = signal;

  if (sourceRoom === targetRoom) {
    RegisterIssue("InvalidRewireAttempt", { reason: "Same room", fracturePath });
    return;
  }

  // 1. Sever the illegal direct edge
  await graph.removeDirectEdge(sourceRoom, targetRoom, fracturePath);

  // 2. Create the bridge
  const bridge = await ensureRemoteEventBridge(sourceRoom, targetRoom, fracturePath);

  // 3. Add bridge edges to the 4D graph
  await graph.addBridgeEdges(sourceRoom, bridge.id, targetRoom);

  // 4. Persist mutation
  await graph.persistMutation();

  // 5. Queue Sequencer with enhanced guard instructions
  sequencerQueue.enqueue({
    action: "injectBridgeCalls",
    bridge,
    fracturePath,
    contract: selectedContract,
    // NEW: Tell Sequencer to add robust WaitForChild guards for early-load fractures
    addEarlyLoadGuards: fracturePath.includes("scriptLoad") || fracturePath.includes("characterAdded")
  });

  RegisterIssue("TopologicalRewireCompleted", {
    bridgeId: bridge.id,
    sourceRoom,
    targetRoom,
    fracturePath,
    velocity,
    contractUsed: selectedContract
  });

  console.log(`[Architect] Rewired ${sourceRoom} → ${targetRoom} via bridge ${bridge.id}`);
}
