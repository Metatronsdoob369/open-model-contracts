import * as dotenv from 'dotenv';
dotenv.config();

/**
 * @popsim/contract — Agency Pusher (Mechanical Bridge Simulator)
 * This script allows you to type a prompt, generate assets, and 
 * push them to the bridge server "Escrow" for Roblox to pull.
 */

import { translator } from '../lib/nl-to-game/nl-to-contracts.js';
import { AssetGeneratorSwarm } from '../lib/nl-to-game/asset-generator.js';

const BRIDGE_URL = "http://localhost:8080/v1/contract";
const API_KEY = "development-only-key";

async function pushToBridge(prompt: string) {
    console.log(`🚀 [AGENCY] Starting build for: "${prompt}"`);

    // 1. Generate Contract
    const result = await translator.generateContract(prompt);
    if (!result.success || !result.contract) {
        console.error("❌ Failed to generate contract");
        return;
    }

    // 2. Generate Assets (Luau code)
    const swarm = new AssetGeneratorSwarm(result.contract);
    const genResult = await swarm.execute();
    console.log(`✅ Generated ${genResult.assets.length} Luau modules.`);

    // 3. Push to Bridge Server
    console.log(`📡 Pushing components to Bridge Server...`);
    try {
        const response = await fetch(`${BRIDGE_URL}/assets/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({
                contractId: result.contract.contractMetadata.contractId,
                assets: genResult.assets
            })
        });

        const pushData = await response.json();
        if (pushData.success) {
            console.log("\n⚖️  BRIDGE ARMED");
            console.log("--------------------------------------------------");
            console.log(`Contract ID: ${result.contract.contractMetadata.contractId}`);
            console.log(`Template:    ${result.templateUsed?.name}`);
            console.log("--------------------------------------------------");
            console.log("\n👉 NEXT MOVE: Copy the Contract ID and paste it into");
            console.log("   the Roblox Loader.lua script in Roblox Studio!");
        } else {
            console.error("❌ Bridge Push Failed:", pushData.error);
        }
    } catch (e) {
        console.error("🔥 Bridge Server offline. Start it with 'npm start' first.");
    }
}

// Get prompt from CLI args
const userPrompt = process.argv.slice(2).join(" ") || "Build a basic tycoon";
pushToBridge(userPrompt).catch(console.error);
