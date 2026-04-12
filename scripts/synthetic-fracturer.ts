import fs from 'fs';
import path from 'path';

/**
 * METROPOLIS SYNTHETIC FRACTURER (The Shatter Engine)
 * 
 * Purpose: Intentionally "shatters" canonical Luau logic to create 
 * training benchmarks for the Repair Shop swarm.
 */

interface ShatterConfig {
    intensity: number; // 0.0 to 1.0 (e.g., 0.4 = 40% shatter)
    preservation: string[]; // Keywords or lines to preserve (e.g., 'return')
}

export class SyntheticFracturer {
    
    /**
     * Shatters a canonical file by mutating logic blocks.
     */
    shatter(filePath: string, config: ShatterConfig): string {
        const original = fs.readFileSync(filePath, 'utf8');
        const lines = original.split('\n');
        
        console.log(`\n🔨 SHATTERING: ${path.basename(filePath)} | Intensity: ${config.intensity * 100}%`);

        // Identify "Foundational Logic Nodes" (Functions, Tables, State changes)
        // We use a regex-based block identification for speed and robustness over full AST parsing here.
        const mutatedLines = lines.map(line => {
            // Preservation check
            if (config.preservation.some(p => line.includes(p))) return line;
            if (line.trim().startsWith('--')) return line; // Keep comments
            
            // Random Shatter check
            if (Math.random() < config.intensity) {
                // Determine mutation type
                const dice = Math.random();
                if (dice < 0.3) {
                    return `-- 🔻 SHATTERED LINE: ${line.trim()}`; // Comment out
                } else if (dice < 0.6) {
                    return line.replace(/([a-zA-Z0-9_]+)/g, (match) => Math.random() < 0.2 ? `_${match}_SHATTERED` : match); // Mutate vars
                } else {
                    return ` -- [FRACTURE] Logic void detected here.`; // Remove completely
                }
            }
            
            return line;
        });

        const shatteredCode = mutatedLines.join('\n');
        
        // Add Shatter Metadata
        const metaHeader = `-- [METROPOLIS SHATTER REPORT]\n-- Intensity: ${config.intensity}\n-- Status: FRACTURED\n-- Law: ${path.basename(filePath)}\n\n`;
        
        return metaHeader + shatteredCode;
    }

    /**
     * Saves the shattered artifact to the dissections queue.
     */
    commit(shatteredCode: string, targetName: string) {
        const dissectionDir = path.resolve(process.cwd(), 'incoming/dissections');
        if (!fs.existsSync(dissectionDir)) fs.mkdirSync(dissectionDir, { recursive: true });

        const reportName = `shattered_${Date.now()}_${targetName.replace(/\.lua$/, '.json')}`;
        const report = {
            DropFile: targetName,
            ShatterSource: "SyntheticFracturer_v1",
            Violations: [
                {
                    type: "StructuralShatter",
                    message: "Intentional topological fracture for agent training.",
                    resonance: 0.2 // Low resonance
                }
            ],
            ShatteredCode: shatteredCode
        };

        fs.writeFileSync(path.join(dissectionDir, reportName), JSON.stringify(report, null, 2));
        
        // Also save the shattered code directly for the ingestor/spectra mapper to see
        const codePath = path.join(dissectionDir, targetName);
        fs.writeFileSync(codePath, shatteredCode);

        console.log(`💎 SHATTER COMMITTED: ${reportName}`);
        return reportName;
    }
}

// CLI Execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const fracturer = new SyntheticFracturer();
    const source = process.argv[2] || 'src/canonical/TagGameClient.lua';
    const intensity = parseFloat(process.argv[3] || '0.4');

    if (fs.existsSync(source)) {
        const shattered = fracturer.shatter(source, { intensity, preservation: ['return', 'local CanonicalModule', 'ReplicatedStorage'] });
        fracturer.commit(shattered, path.basename(source));
    } else {
        console.error(`❌ Source not found: ${source}`);
    }
}
