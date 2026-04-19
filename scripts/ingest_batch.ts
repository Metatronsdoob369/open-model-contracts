import * as fs from 'fs';
import * as path from 'path';

// Using dynamic import for node-fetch to support native node if needed
import fetch from 'node-fetch'; 

const INGEST_URL = "http://localhost:8080/v1/spectra/ingest";
const CHUNK_SIZE = 10; // Batch size to prevent OpenAI rate limiting

// Target directories (ignoring node_modules and bloated libs)
const TARGET_DIRS = [
    './shattered',
    './generated',
    './src',
    './popsim-contract/AI-MCP-PLUGIN-Creations'
];

function getAllLuaFiles(dirPath: string, arrayOfFiles: string[] = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                // Ignore node_modules
                if (file !== 'node_modules') {
                    arrayOfFiles = getAllLuaFiles(fullPath, arrayOfFiles);
                }
            } else {
                if (file.endsWith('.lua') || file.endsWith('.luau')) {
                    arrayOfFiles.push(fullPath);
                }
            }
        } catch (e) {
            // Ignore broken symlinks or ephemeral files
        }
    });

    return arrayOfFiles;
}

async function ingestBatch(files: string[]) {
    const scriptsPayload = files.map(filePath => {
        try {
            return {
                id: filePath,
                code: fs.readFileSync(filePath, 'utf-8')
            };
        } catch (e) {
            return null;
        }
    }).filter(s => s !== null && s.code.trim().length > 0);

    if (scriptsPayload.length === 0) return;

    try {
        const response = await fetch(INGEST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scripts: scriptsPayload })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log(`✅ Chunk Map Successful: ${scriptsPayload.length} nodes embedded.`);
        } else {
            console.error(`❌ Chunk Ingestion Failed:`, data.error || data);
        }
    } catch (err: any) {
        console.error(`⚠️ HTTP Failed:`, err.message);
    }
}

async function runVampireStrike() {
    console.log("🦇 Initiating Vampire Strike...");
    console.log("Scanning target local archives...");

    let allFiles: string[] = [];
    TARGET_DIRS.forEach(dir => {
        const absoluteDir = path.resolve(process.cwd(), dir);
        allFiles = getAllLuaFiles(absoluteDir, allFiles);
    });

    console.log(`\n🎯 Found ${allFiles.length} Target Luau Scripts.`);
    console.log(`Starting chunked ingestion at ${CHUNK_SIZE} nodes per batch to stabilize OpenAI boundaries.\n`);

    for (let i = 0; i < allFiles.length; i += CHUNK_SIZE) {
        const chunk = allFiles.slice(i, i + CHUNK_SIZE);
        console.log(`[Batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(allFiles.length / CHUNK_SIZE)}] - Embedding ${chunk.length} nodes...`);
        await ingestBatch(chunk);
        
        // Anti-throttle delay (rate limit safety)
        if (i + CHUNK_SIZE < allFiles.length) {
            await new Promise(r => setTimeout(r, 2500));
        }
    }
    
    console.log("\n🦇 Vanguard Mapping Sequence Complete.");
}

runVampireStrike();
