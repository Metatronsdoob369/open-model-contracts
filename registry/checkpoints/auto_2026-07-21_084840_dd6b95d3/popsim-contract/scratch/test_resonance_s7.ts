import { SpectraMappingService } from '../src/core/spectra-mapping.js';
import fs from 'fs';

async function runTest() {
    const mapper = new SpectraMappingService();
    const s7Code = fs.readFileSync('/Users/joewales/.gemini/antigravity/scratch/test_s7_fracture.js', 'utf8');

    console.log('🧪 Running resonance check on ICS S7 Fracture...');
    
    const results = await mapper.mapBatch([{ id: 's7_fracture_test', code: s7Code }]);
    console.log('\n--- RESONANCE REPORT ---');
    console.log(`[SPECTRA-MAP] Status: ${results[0].gate}`);
    console.log(`[SPECTRA-MAP] Resonance Signature: ${results[0].intentSignature}`);
}

runTest().catch(console.error);
