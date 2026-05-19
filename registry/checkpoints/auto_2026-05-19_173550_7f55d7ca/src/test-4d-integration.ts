// src/test-4d-integration.ts
import { traceCapture } from './utils/captureTrace';
import { embedWithTime } from './embedder/embedWithTime';
import { injectBridgeCalls } from './sequencer/injectBridgeCalls';
import * as fs from 'fs/promises';

async function runIntegrationTest() {
  console.log("💎 Starting 4D Spatio-Temporal Integration Test (GothTag Assembly)");

  // 1. Record a Dynamic Trace (Simulating a real Studio load pulse)
  traceCapture.record("scriptLoad");
  await new Promise(r => setTimeout(r, 100));
  traceCapture.record("playerAdded");
  await new Promise(r => setTimeout(r, 50));
  traceCapture.record("characterAdded");
  traceCapture.record("roundStart");

  const dynamicTrace = traceCapture.getTrace();
  traceCapture.print();

  // 2. Load the Infilled Mechanic (TagControl)
  const tagControlCode = await fs.readFile('./shattered/GothTag_TagControl_INFILL.lua', 'utf-8');

  // 3. Generate 4D Embedding using the Dynamic Trace
  const node = embedWithTime(tagControlCode, dynamicTrace);
  console.log("\n✅ 4D Node Synthesized from Dynamic Trace:", {
    room: node.room,
    heat: node.heat.toFixed(2),
    shatter: node.shatter.toFixed(2),
  });

  // 4. Inject 4D SafeFire Guards
  console.log("💉 Hardening TagControl with SafeFire Bridges...");
  const bridge = {
    id: "Bridge_GothTag_TagEvents",
    name: "Bridge_GothTag_TagEvents",
    sourceRoom: node.room,
    targetRoom: "OMC_Governance",
    fracturePath: "characterAdded → roundStart"
  };

  const hardenedCode = injectBridgeCalls(tagControlCode, bridge, "characterAdded", "OMC_Bridge_PlayerAction" as any);

  // 5. Final Audit
  console.log("--- HARDENED ASSET PREVIEW ---");
  console.log(hardenedCode.substring(0, 450) + "...");
  console.log("------------------------------");

  if (hardenedCode.includes("SafeFire") && hardenedCode.includes("OMC_Bridge_PlayerAction")) {
    console.log("🎯 TEST PASSED: Assembly is hardened and contract-compliant.");
  }

  await fs.writeFile('./repaired/GothTag_TagControl_FINAL.lua', hardenedCode);
  console.log("💾 Final Diamond-Stable asset saved to ./repaired/GothTag_TagControl_FINAL.lua");
}

runIntegrationTest().catch(console.error);
