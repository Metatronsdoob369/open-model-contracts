import * as fs from 'fs';
import * as path from 'path';

const CONTRACT_ID = "72ff90e9-a3fa-4012-8a07-bbb65e76f16f";
const MISSION_DIR = path.join(process.cwd(), 'AI-MCP-PLUGIN-Creations', CONTRACT_ID);
const BRIDGE_URL = "http://localhost:8080/v1/contract";
const API_KEY = "development-only-key"; // From pusher.ts

async function runHotfix() {
    console.log(`🏗️ [HOTFIX] Injecting Architectural Masterpiece for ${CONTRACT_ID}...`);
    
    const files = fs.readdirSync(MISSION_DIR).filter(f => f.endsWith('.lua'));
    const assets = files.map(file => {
        const content = fs.readFileSync(path.join(MISSION_DIR, file), 'utf-8');
        // Clean up the .lua.lua double extension for the bridge
        const moduleName = file.replace('.lua.lua', '.lua');
        return {
            moduleName,
            content
        };
    });

    console.log(`📡 Pushing ${assets.length} corrected modules to Bridge...`);
    
    try {
        const response = await fetch(`${BRIDGE_URL}/assets/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: JSON.stringify({ contractId: CONTRACT_ID, assets })
        });
        
        const data: any = await response.json();
        if (data.success) {
            console.log("\n✅ [SUCCESS] Architecture Hotfix is LIVE.");
            console.log("-----------------------------------------");
            console.log(`Target ID: ${CONTRACT_ID}`);
            console.log("-----------------------------------------");
            console.log("👉 ACTION: Hit STOP and then PLAY in Roblox Studio!");
        } else {
            console.error("❌ Hotfix Failed:", data.error);
        }
    } catch (e) {
        console.error("🔥 Bridge Server is offline. Start it first.");
    }
}

runHotfix().catch(console.error);
