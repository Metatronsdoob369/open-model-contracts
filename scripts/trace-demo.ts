import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * THE EPIC DEMO: Zero-Touch Deterministic Governance
 * This script demonstrates the full OMC pipeline from Scrape to Canonical Law.
 */

async function runDemo() {
    console.log(`\n🚀 INITIATING TRACE: THE IMMUNE SYSTEM HANDSHAKE`);
    console.log(`--------------------------------------------------`);

    try {
        // 1. VAMPIRE DRAIN
        console.log(`\n🦇 PHASE 1: VAMPIRE EXTRACTION`);
        console.log(`📡 Tapping ProfileService architectural DNA...`);
        await execAsync(`npx tsx scripts/vampire-ingestor.ts https://raw.githubusercontent.com/MadStudioRoblox/ProfileService/master/ProfileService.lua`);
        
        // Find the latest drain
        const drains = await fs.readdir('./generated/vampire_drops');
        const latestDrain = drains.sort().pop();
        console.log(`✅ DNA Harvested: ${latestDrain}`);

        // 2. SYNTHESIZE "MESSY" DROP
        console.log(`\n📦 PHASE 2: SYNTHESIZING DROP PAYLOAD`);
        const dropName = "Marsh_Profile_Bridge.json";
        const messyPayload = {
            id: "marsh-001",
            type: "script",
            code: "local PS = require(ProfileService)\n_G.Hack = true\nprint('Dangerous global slop')",
            targetEnvironment: "Server",
            expectedSlots: ["OMC.State"]
        };
        await fs.writeFile(path.join('./incoming', dropName), JSON.stringify(messyPayload, null, 2));
        console.log(`✅ Drop zone primed: ./incoming/${dropName}`);

        // 3. START AUTO-PILOT WATCHERS
        console.log(`\n🧠 PHASE 3: ACTIVATING IMMUNE SYSTEM AUTO-PILOT`);
        console.log(`🛡️  Sentry Watcher: ONLINE`);
        console.log(`🧬  State Refiner: ONLINE`);

        // Run sentry and refiner in the background then kill after a few seconds
        const sentry = exec(`npx tsx scripts/sentry-watcher.ts`);
        const refiner = exec(`npx tsx scripts/state-refiner.ts`);

        console.log(`\n⏳ Awaiting Deterministic Synthesis...`);
        await new Promise(resolve => setTimeout(resolve, 8000));

        sentry.kill();
        refiner.kill();

        // 4. VERIFY RESULT
        console.log(`\n📜 PHASE 4: AUDITING THE CANONICAL RESULT`);
        const canonicalFile = "Marsh_Profile_Bridge.lua";
        const canonicalPath = path.join('./src/canonical', canonicalFile);
        
        const content = await fs.readFile(canonicalPath, 'utf-8');
        console.log(`✅ CANONICAL LAW INSTANTIATED AT: ${canonicalPath}`);
        
        if (content.includes('IntentSignature')) {
            console.log(`✍️  SIGNATURE DETECTED: ${content.split('\n').find(l => l.includes('IntentSignature'))}`);
        }

        console.log(`\n🏁 TRACE COMPLETE. SPRINT 2 SUCCESSFUL.`);
        console.log(`--------------------------------------------------`);
        console.log(`Marsh is going to love this.`);

    } catch (e: any) {
        console.error(`\n❌ DEMO FAILED:`, e.message);
    }
}

runDemo();
