// src/test-4d-smoke.ts
import { embedWithTime, ExecutionTrace } from './embedder/embedWithTime';
import { graph } from './canonical/QuadMap';
import { rewireRooms } from './architecture/rewireRooms';
import { injectBridgeCalls } from './sequencer/injectBridgeCalls';

// 1. Sample shattered code (use one of your real GameService fragments)
const shatteredCode = `
local Global = require(script.Parent.Broken_Global_Reference) -- fracture
local Environment = nil -- missing anchor
local Customers = Global.Customers
local Customers = Global.Customers -- duplicate
`;

// 2. Simple execution trace with timestamps
const trace: ExecutionTrace[] = [
  { timestamp: 0.0, phase: "scriptLoad" },
  { timestamp: 1.2, phase: "characterAdded" },
  { timestamp: 3.8, phase: "dataStoreWrite" },
];

async function runSmokeTest() {
  // 3. Embed into 4D node
  const node = embedWithTime(shatteredCode, trace);
  console.log("✅ Embedded 4D Node:", {
    room: node.room,
    heat: node.heat.toFixed(2),
    shatter: node.shatter.toFixed(2),
    temporalCount: node.temporalSignatures.length
  });

  // 4. Store in QuadMap
  await graph.upsertNode(node);

  // 5. Simulate high-velocity cross-room fracture → trigger rewire
  const signal = {
    sourceRoom: "ROOM-02_WorldState",
    targetRoom: "Client_Visual",
    fracturePath: "scriptLoad → characterAdded",
    velocity: 1.8,                    // high velocity = fracture
    selectedContract: "OMC_Bridge_StateSync"
  };

  console.log("🔧 Triggering rewireRooms...");
  await rewireRooms(signal);

  // 6. Demonstrate SafeFire Injection (Sequencer Scale)
  console.log("\n💉 [SEQUENCER] Demonstrating SafeFire Injection...");
  const bridge = { 
    id: "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
    name: "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
    sourceRoom: "ROOM-02_WorldState",
    targetRoom: "Client_Visual",
    fracturePath: "scriptLoad → characterAdded"
  };
  
  // Simulated broken code with a raw FireServer call
  const rawCode = `local obj = {}\nobj:FireServer({ type = "ResonancePulse" })`;
  const repairedCode = injectBridgeCalls(rawCode, bridge, "scriptLoad → characterAdded", "OMC_Bridge_StateSync");

  console.log("--- REPAIRED CODE SNIPPET ---");
  console.log(repairedCode.substring(0, 500) + "...");
  console.log("-----------------------------");

  if (repairedCode.includes("SafeFire") && !repairedCode.includes(":FireServer")) {
    console.log("✅ CONFIRMED: Raw FireServer call replaced with SafeFire wrapper.");
  }

  console.log("✅ Smoke test complete. Check console for rewire logs.");
}

runSmokeTest().catch(console.error);
