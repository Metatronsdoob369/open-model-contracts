import { SpectraMappingService } from '../src/core/spectra-mapping.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
    const mapper = new SpectraMappingService();
    const mevCode = fs.readFileSync('/Users/joewales/.gemini/antigravity/scratch/test_mev_nugget.sol', 'utf8');

    console.log('🧪 Running resonance check on MEV Nugget...');
    
    // We mock the vectorize call to avoid needing a live Ollama for a quick logic test, 
    // but the adversary check runs on the raw string.
    const results = await mapper.mapBatch([{ id: 'me_br_3_test', code: mevCode }]);
    
    console.log('\n--- RESONANCE REPORT ---');
    console.log(JSON.stringify(results, (key, value) => 
        (key === 'layoutVectors' || key === 'embeddedDocs') ? '[VEC]' : value, 2));
}

runTest().catch(console.error);
