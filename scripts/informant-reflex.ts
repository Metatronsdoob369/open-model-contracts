
import * as fs from 'fs';
import * as path from 'path';
import { SpectraMappingService } from '../popsim-contract/src/core/spectra-mapping.js';

const ROOT = process.cwd();
const TARGET_DIRS = [
    'src/canonical',
    'server/bridge/src',
    'dashboard',
    'popsim-contract/src/core'
];

async function runSelfAudit() {
    console.log("💎 INITIATING SELF-REFLEXIVE AUDIT (Metropolis Informant)");
    console.log("----------------------------------------------------------");

    const spectra = new SpectraMappingService();
    const filesToAnalyze: { id: string, code: string }[] = [];

    for (const dir of TARGET_DIRS) {
        const fullDir = path.join(ROOT, dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = fs.readdirSync(fullDir);
        for (const file of files) {
            if (file.endsWith('.ts') || file.endsWith('.lua') || file.endsWith('.js')) {
                const filePath = path.join(fullDir, file);
                const code = fs.readFileSync(filePath, 'utf-8');
                filesToAnalyze.push({ id: `${dir}/${file}`, code });
            }
        }
    }

    console.log(`📡 Analyzing ${filesToAnalyze.length} core platform components...`);

    try {
        const results = await spectra.mapBatch(filesToAnalyze);
        
        // Critical Summary
        const highShatter = results.filter(p => p.overallShatter > 0.4);
        const avgShatter = results.reduce((acc, p) => acc + p.overallShatter, 0) / results.length;

        console.log("\n📊 SELF-DETERMINATION REPORT:");
        console.log(`- Average System Shatter: ${(avgShatter * 100).toFixed(2)}%`);
        console.log(`- Vulnerable Components: ${highShatter.length}`);
        
        highShatter.forEach(p => {
             console.log(`  [!] WARNING: ${p.id} - Velocity: ${p.overallShatter.toFixed(2)}v (Topological Fragility Detected)`);
        });

        // Save report
        const reportPath = path.join(ROOT, 'generated/self-audit.json');
        if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            averageShatter: avgShatter,
            vulnerabilities: highShatter,
            fullReport: results
        }, null, 2));

        console.log(`\n💾 Audit Manifest saved to: ${reportPath}`);
        
        if (avgShatter < 0.2) {
            console.log("\n✅ CONCLUSION: Platform is Diamond-Stable. Internal defense grids are mathematically coherent.");
        } else {
            console.log("\n⚠️ CONCLUSION: Internal Drift detected. Recalibrating defense contracts is RECOMMENDED.");
        }

    } catch (e) {
        console.error("❌ Audit Loop Failure:", e);
    }
}

runSelfAudit();
