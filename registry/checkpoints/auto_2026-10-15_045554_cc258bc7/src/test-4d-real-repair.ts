// src/test-4d-real-repair.ts
import { embedWithTime, ExecutionTrace } from './embedder/embedWithTime';
import { graph } from './canonical/QuadMap';
import { rewireRooms } from './architecture/rewireRooms';
import { injectBridgeCalls } from './sequencer/injectBridgeCalls';
import * as fs from 'fs/promises';

// ==================== CONFIG ====================
// Paths relative to project root when running from root
const SHATTERED_FILE_PATH = './shattered/GameService_SHATTERED.lua'; 

// Simple execution trace based on your FLog timestamps (adjust as needed)
const executionTrace: ExecutionTrace[] = [
  { timestamp: 1297.218, phase: "scriptLoad" },
  { timestamp: 1301.517, phase: "characterAdded" },
  { timestamp: 1329.483, phase: "dataStoreWrite" },
  { timestamp: 1445.029, phase: "roundStart" },
];

// ===============================================

async function runRealRepairTest() {
  console.log("🚀 Starting 4D Spatio-Temporal Repair Loop Test");
  console.log(`Loading shattered file: ${SHATTERED_FILE_PATH}`);

  // 1. Load the real shattered code
  const shatteredCode = await fs.readFile(SHATTERED_FILE_PATH, 'utf-8');

  // 2. Embed into 4D node (spatial + temporal)
  const node = await embedWithTime(shatteredCode, executionTrace);
  console.log("✅ 4D Node Embedded:", {
    room: node.room,
    heat: node.heat.toFixed(2),
    shatter: node.shatter.toFixed(2),
    temporalCount: node.temporalSignatures.length
  });

  // 3. Store in QuadMap
  await graph.upsertNode(node);
  console.log("✅ Node stored in QuadMap");

  // 4. Simulate high-velocity cross-room fracture (adjust velocity if needed)
  const signal = {
    sourceRoom: "ROOM-02_WorldState",
    targetRoom: "Client_Visual",
    fracturePath: "scriptLoad → characterAdded",
    velocity: 1.85,                    // high enough to trigger rewire
    selectedContract: "OMC_Bridge_StateSync"
  };

  console.log("🔧 Triggering rewireRooms for temporal fracture...");
  await rewireRooms(signal);

  // 5. Run the injection (this is what actually repairs the code)
  console.log("💉 Running injectBridgeCalls...");
  const repairedCode = injectBridgeCalls(shatteredCode, {
    id: "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
    name: "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
    sourceRoom: "ROOM-02_WorldState",
    targetRoom: "Client_Visual",
    fracturePath: "scriptLoad → characterAdded"
  }, "scriptLoad → characterAdded", "OMC_Bridge_StateSync");

  // 6. Output the repaired code
  console.log("\n✅ REPAIRED CODE OUTPUT:");
  console.log("=".repeat(80));
  // Show a snippet to confirm injection
  console.log(repairedCode.substring(0, 500) + "...");
  console.log("=".repeat(80));

  // Optional: Save repaired file
  await fs.writeFile('./repaired/GameService_REPAIRED.lua', repairedCode);
  console.log("💾 Repaired file saved to ./repaired/GameService_REPAIRED.lua");

  console.log("\n🎯 4D Repair Loop Test Complete!");
}

runRealRepairTest().catch(console.error);
