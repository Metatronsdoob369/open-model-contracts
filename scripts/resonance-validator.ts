import fs from 'fs';
import path from 'path';
import { RepairShopService, TrainingTier } from '../popsim-contract/src/core/repair-shop.js';

/**
 * METROPOLIS RESONANCE VALIDATOR (3072-D Scoring Engine)
 * 
 * Purpose: Evaluates agent repairs against the "Canonical Law"
 * by calculating the 3072-dimensional topological resonance.
 */

export class ResonanceValidator {
    private repairShop: RepairShopService;

    constructor() {
        this.repairShop = new RepairShopService();
    }

    /**
     * Calculates the resonance delta between a repair and its canonical master.
     */
    async validate(repairedPath: string, canonicalFileName: string) {
        if (!fs.existsSync(repairedPath)) {
            throw new Error(`❌ Missing repaired file: ${repairedPath}`);
        }

        const repairedCode = fs.readFileSync(repairedPath, 'utf8');

        console.log(`\n⚖️ VIEWING RESONANCE: [${path.basename(repairedPath)}] vs [${canonicalFileName}]`);

        try {
            // Use the integrated Service to perform the Diamond-Stable evaluation
            const report = await this.repairShop.evaluateRepair(repairedCode, canonicalFileName, TrainingTier.LEVEL_2_REMIX);

            console.log(`📊 DIAMOND-STABLE REPORT:`);
            console.log(`   - IntentSig: ${report.intentSignature.substring(0, 12)}...`);
            console.log(`   - Gate: ${report.gate} ${report.gate === 'SAFE' ? '✅' : '🛑'}`);
            console.log(`   - Resonance: ${report.evalMetrics.resonance}`);
            console.log(`   - Shatter: ${report.output.finalShatter.toFixed(4)}`);
            console.log(`   - Playability: ${report.evalMetrics.playability}%`);

            return report;
        } catch (err: any) {
            console.error(`❌ Resonance Calculation Failed:`, err.message);
            return null;
        }
    }
}

// CLI Execution Support
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new ResonanceValidator();
    const repaired = process.argv[2];
    const canonical = process.argv[3];

    if (repaired && canonical) {
        validator.validate(repaired, canonical).then(() => process.exit(0));
    } else {
        console.log("Usage: tsx resonance-validator.ts <repaired_path> <canonical_filename>");
    }
}
