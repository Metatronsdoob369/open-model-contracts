// scripts/batch-repair.ts
import { embedWithTime, ExecutionTrace } from '../src/embedder/embedWithTime';
import { graph } from '../src/canonical/QuadMap';
import { rewireRooms } from '../src/architecture/rewireRooms';
import { injectBridgeCalls } from '../src/sequencer/injectBridgeCalls';
import * as fs from 'fs/promises';
import * as path from 'path';

const SHATTERED_DIR = './shattered';   // ← put all your shattered .lua files here
const REPAIRED_DIR = './repaired';

async function batchRepair() {
  console.log("🚀 Starting 4D Batch Repair Loop (OMC v3.9.5)");

  // Ensure output directory exists
  await fs.mkdir(REPAIRED_DIR, { recursive: true });

  const files = await fs.readdir(SHATTERED_DIR);
  const luaFiles = files.filter(f => f.endsWith('.lua') || f.endsWith('.luau'));

  console.log(`Found ${luaFiles.length} shattered files to repair.\n`);

  for (const filename of luaFiles) {
    const inputPath = path.join(SHATTERED_DIR, filename);
    const outputPath = path.join(REPAIRED_DIR, filename.replace(/(\.luau|\.lua)$/, '_REPAIRED.lua'));

    console.log(`\n🔧 Processing: ${filename}`);

    try {
      const shatteredCode = await fs.readFile(inputPath, 'utf-8');

      // Simple trace — you can make this more sophisticated later
      const trace: ExecutionTrace[] = [
        { timestamp: 0.0, phase: "scriptLoad" },
        { timestamp: 1.2, phase: "characterAdded" },
        { timestamp: 3.8, phase: "dataStoreWrite" },
      ];

      // 1. Embed into 4D
      const node = embedWithTime(shatteredCode, trace);

      // 2. Store in graph
      await graph.upsertNode(node);

      // 3. Trigger rewire if high velocity (you can make this conditional later)
      const signal = {
        sourceRoom: "ROOM-02_WorldState",
        targetRoom: "Client_Visual",
        fracturePath: "scriptLoad → characterAdded",
        velocity: 1.75,                    // adjust threshold as needed
        selectedContract: "OMC_Bridge_StateSync" as any
      };

      await rewireRooms(signal);

      // 4. Inject the bridge logic
      const addEarlyLoadGuards = signal.fracturePath.includes("scriptLoad") || signal.fracturePath.includes("characterAdded");
      
      const repairedCode = injectBridgeCalls(
        shatteredCode,
        {
          id: `Bridge_${signal.sourceRoom}_to_${signal.targetRoom}`,
          name: `Bridge_${signal.sourceRoom}_to_${signal.targetRoom}_${signal.fracturePath.replace(/[^a-zA-Z0-9]/g, "")}`,
          sourceRoom: signal.sourceRoom,
          targetRoom: signal.targetRoom,
          fracturePath: signal.fracturePath
        },
        signal.fracturePath,
        signal.selectedContract,
        addEarlyLoadGuards // NEW: Pass the guard flag
      );

      // 5. Save repaired file
      await fs.writeFile(outputPath, repairedCode);
      console.log(`✅ Repaired → ${path.basename(outputPath)}`);

    } catch (error) {
      console.error(`❌ Failed to repair ${filename}:`, error);
    }
  }

  console.log("\n🎯 Batch repair complete!");
  console.log(`Repaired files saved to ./${REPAIRED_DIR}/`);
}

// Run the batch
batchRepair().catch(console.error);
