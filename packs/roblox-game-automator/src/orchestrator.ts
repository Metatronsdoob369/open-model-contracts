import { DirectorRuntime } from './lib/director/director-runtime.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * LawCRON Orchestrator
 * End-to-End Roblox Game Generation Pipeline
 */
async function runOrchestrator(prompt: string) {
  console.log('🚀 LawCRON Orchestrator Starting...');
  console.log(`📝 Seed: "${prompt}"`);

  const runId = randomUUID().substring(0, 8);
  const buildDir = path.resolve(process.cwd(), 'temp-builds', runId);
  const srcDir = path.join(buildDir, 'src');

  try {
    // 1. Intelligence & Manifestation
    const director = new DirectorRuntime({ 
      model: 'qwen2.5-coder:7b', 
      apiKey: process.env.OPENAI_API_KEY 
    });

    console.log('🧠 Phase 1: Intelligence (Director-01)...');
    const spec = await director.direct({ prompt });
    console.log(`✅ Spec Generated: ${spec.parsedIntent.genre} (${spec.parsedIntent.mood})`);

    console.log('🛠️ Phase 2: Manifestation (Specialist Swarm)...');
    const results = await director.dispatch(spec);
    
    // 2. Setup Build Directory
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

    const moduleNames: string[] = [];

    for (const result of results) {
      for (const [name, content] of Object.entries(result.generatedModules)) {
        const fileName = name.endsWith('.lua') ? name : `${name}.lua`;
        fs.writeFileSync(path.join(srcDir, fileName), content);
        moduleNames.push(fileName.replace('.lua', ''));
        console.log(`💾 Saved Module: ${fileName}`);
      }
    }

    // 3. Generate Main.lua (The Orchestrator)
    const mainLua = `
-- LawCRON Generated Main Orchestrator
-- This script initializes all specialists in the correct order

local ServerScriptService = game:GetService("ServerScriptService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local modules = {
${moduleNames.map(name => `  ["${name}"] = require(script.Parent:WaitForChild("${name}")),`).join('\n')}
}

print("[LawCRON] 🚀 Initializing Game Modules...")

for name, module in pairs(modules) do
  if module.Initialize then
    print("[LawCRON] Initializing: " .. name)
    local ok, err = pcall(function() module:Initialize() end)
    if not ok then
      warn("[LawCRON] ❌ Failed to initialize " .. name .. ": " .. tostring(err))
    end
  else
    warn("[LawCRON] ⚠️ Module " .. name .. " has no Initialize function.")
  end
end

print("[LawCRON] ✅ All modules initialized.")
`;
    fs.writeFileSync(path.join(srcDir, 'Main.lua'), mainLua);

    // 4. Generate project.rojo.json
    const projectRojo = {
      name: spec.parsedIntent.levelName || "LawCRON_Generated_Game",
      tree: {
        "$className": "DataModel",
        "ServerScriptService": {
          "$className": "ServerScriptService",
          "LawCRON": {
            "$path": "src"
          }
        }
      }
    };
    fs.writeFileSync(path.join(buildDir, 'project.rojo.json'), JSON.stringify(projectRojo, null, 2));

    // 5. Build .rbxl
    console.log('🏗️ Phase 3: Build (Rojo)...');
    const outputPath = path.resolve(process.cwd(), 'generated', `${runId}_game.rbxl`);
    if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    try {
      execSync(`rojo build --output "${outputPath}"`, { cwd: buildDir });
      console.log(`✅ Build Success! File: ${outputPath}`);
    } catch (buildErr) {
      console.error('❌ Rojo Build Failed:', buildErr);
      throw buildErr;
    }

    console.log('✨ Pipeline Complete.');
    return outputPath;

  } catch (error) {
    console.error('❌ Orchestrator Failed:', error);
    throw error;
  }
}

// CLI Entry Point
const seed = process.argv[2] || "A minimalist city with a tag game mechanic and pizza delivery points";
runOrchestrator(seed).then(path => {
  console.log(`\nDONE! Your game is ready at: ${path}`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
