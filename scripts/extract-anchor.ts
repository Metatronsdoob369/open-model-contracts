
import * as fs from 'fs';
import * as path from 'path';
import { SpectraMappingService } from '../popsim-contract/src/core/spectra-mapping.js';

async function generateAnchor() {
    const spectra = new SpectraMappingService();
    const anchorPath = path.join(process.cwd(), 'server/bridge/src/index.ts');
    const code = fs.readFileSync(anchorPath, 'utf-8');
    
    console.log("⚓ PROCESSING ANCHOR: server/bridge/src/index.ts");
    const vector = await spectra.vectorize(code);
    
    // Save as raw array for easy copy-paste
    const vectorArray = Array.from(vector);
    fs.writeFileSync('anchor_vector_processed.json', JSON.stringify(vectorArray));
    console.log("✅ ANCHOR CAPTURED: anchor_vector_processed.json");
}

generateAnchor();
