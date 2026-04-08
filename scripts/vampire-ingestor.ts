import fs from 'fs';
import path from 'path';
import luaparse from 'luaparse';

/**
 * THE VAMPIRE PIPELINE (OMC Knowledge Aggregator)
 * Usage: npx tsx scripts/vampire-ingestor.ts <RAW_GITHUB_URL>
 */

const TARGET_URL = process.argv[2] || "https://raw.githubusercontent.com/MadStudioRoblox/ProfileService/master/ProfileService.lua";

async function harvest() {
    console.log(`\n🦇 VAMPIRE PIPELINE ACTIVATED`);
    console.log(`📡 Targeting open-source architecture at: ${TARGET_URL}`);
    
    try {
        // 1. Rip the code from the web
        const response = await fetch(TARGET_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const code = await response.text();
        
        console.log(`🩸 Harvested ${code.length} bytes of raw Lua DNA.`);
        
        let astNodeCount = 0;
        let logicComposition = 'luau';
        
        let extractedFunctions: string[] = [];
        
        try {
            // Attempt standard Lua 5.1 parsing
            const ast = luaparse.parse(code, { comments: false, luaVersion: '5.1' });
            astNodeCount = ast.body.length;
            logicComposition = ast.type;
            console.log(`🧬 AST Synthesized! Detected ${astNodeCount} top-level architectural nodes.`);
        } catch (parseError: any) {
            console.log(`⚠️ AST Parser tripped on Luau syntax. Initiating heuristic fallbacks...`);
            // Fallback: heuristic node counting (count 'function ' declarations and structured tables)
            const functionMatches = code.match(/function\s+[a-zA-Z0-9_.:]+\([^)]*\)/g) || [];
            astNodeCount = functionMatches.length;
            extractedFunctions = functionMatches;
            logicComposition = 'HeuristicFallback';
            console.log(`🧬 Heuristics Synthesized! Detected approx ${astNodeCount} foundational logic nodes.`);
        }

        // 3. Convert the proven logic directly into an OMC JSON Knowledge Payload
        const payload = {
            metadata: {
                timestamp: new Date().toISOString(),
                source: TARGET_URL,
                classification: "PROVEN_FRAMEWORK_DNA"
            },
            omc_governance: {
                phase: "INGESTED",
                heuristic_safety: "BYPASSED_FOR_ANALYSIS", // We don't block research logic
                mempalace_routing: "PENDING_CLASSIFICATION"
            },
            structural_dna: {
                logic_composition: logicComposition,
                ast_node_count: astNodeCount,
                extracted_functions: extractedFunctions,
                raw_code: code // Save the full code so the AI can learn from it!
            }
        };

        // 4. Output to the JSON Graph
        const outPath = path.resolve('./generated/vampire_drops');
        if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `drain_${timestamp}.json`;
        fs.writeFileSync(path.join(outPath, filename), JSON.stringify(payload, null, 2));

        console.log(`💎 Extracted DNA converted to OMC JSON Protocol: ./generated/vampire_drops/${filename}\n`);
    } catch (e: any) {
        console.error("\n🔴 VAMPIRE FAILED TO DRAIN:", e.message);
    }
}

harvest();
