
import fs from 'fs';
import path from 'path';
import { SpectraMappingService } from '../popsim-contract/src/core/spectra-mapping.js';

async function buildExpandedCorpus() {
    const spectra = new SpectraMappingService();
    const luaFiles = [
        'src/canonical/TagGameClient.lua',
        'src/canonical/Metropolis_PizzaService.lua',
        'src/canonical/PizzaPlace_GameService.lua',
        'src/canonical/Marsh_Messy_Drop.lua',
        'src/canonical/TraceCapture.lua',
        'src/canonical/partner_superbullet.lua'
    ];
    
    console.log("⚓ CAPTURING ANCHOR A (Systemic TS)...");
    const tsCode = fs.readFileSync('server/bridge/src/index.ts', 'utf-8');
    const tsVec = await spectra.vectorize(tsCode);
    fs.writeFileSync('server/bridge/anchor_ts.json', JSON.stringify(Array.from(tsVec)));

    console.log("⚓ BUILDING EXPANDED ANCHOR B (6-File Lua Corpus)...");
    let sumVec = new Float32Array(3072).fill(0);
    let count = 0;

    for (const file of luaFiles) {
        if (fs.existsSync(file)) {
            console.log(`⚓ Indexing intelligence: ${file}`);
            const code = fs.readFileSync(file, 'utf-8');
            const vec = await spectra.vectorize(code);
            for (let i = 0; i < 3072; i++) sumVec[i] += vec[i];
            count++;
        } else {
            console.warn(`⚠️ Skipping missing file: ${file}`);
        }
    }

    if (count > 0) {
        const finalVec = new Float32Array(3072);
        for (let i = 0; i < 3072; i++) finalVec[i] = sumVec[i] / count;
        fs.writeFileSync('server/bridge/anchor_lua.json', JSON.stringify(Array.from(finalVec)));
        console.log(`✅ EXPANDED LUA CORPUS GENERATED (${count} files indexed)`);
    }

    console.log("✅ DUAL CALIBRATION COMPLETE.");
}

buildExpandedCorpus().catch(err => {
    console.error("❌ CALIBRATION FAILED:", err);
    process.exit(1);
});
