
import fs from 'fs';
import path from 'path';
import { RepairShopService, TrainingTier } from './popsim-contract/src/core/repair-shop.js';

async function ignitePipeline() {
    console.log("=========================================================");
    console.log("🏮 INITIATING SOVEREIGN SHATTER SEQUENCE: VICTIM SERVICE");
    console.log("=========================================================\n");

    const repairShop = new RepairShopService();
    
    // The target for shattering
    const targetFile = 'VictimService.luau'; 
    const targetPath = path.resolve(process.cwd(), 'src/ServerScriptService/OMC_Ignition/Source', targetFile);
    
    if (!fs.existsSync(targetPath)) {
        console.log(`❌ ERROR: Source of truth not found at ${targetPath}`);
        return;
    }

    const code = fs.readFileSync(targetPath, 'utf8');

    console.log(`📡 [EMBEDDING] Vectorizing 3072-D Intent Signature...`);
    // We feed it through the Level 3: RECONSTRUCT tier
    const report = await repairShop.evaluateRepair(code, targetFile, TrainingTier.LEVEL_3_RECONSTRUCT);

    console.log("\n=========================================================");
    console.log("✅ PIPELINE EXECUTION COMPLETE");
    console.log("=========================================================");
    console.log(`   * Resonance Score: ${(report.evalMetrics.resonance * 100).toFixed(2)}%`);
    console.log(`   * Playability: ${report.evalMetrics.playability}%`);
    console.log(`   * Gate Status: ${report.gate}`);
    console.log(`   * Vault: CIF-Memory (Graduated)`);
    console.log("=========================================================\n");
}

ignitePipeline().catch(console.error);
