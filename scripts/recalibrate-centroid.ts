/**
 * Centroid Recalibration — computes new STABLE_CENTROID from src/canonical/*.lua
 * Reads every .lua file, embeds via SpectraMappingService (Ollama local),
 * averages all vectors, normalizes, and writes the result to stdout as a JSON array.
 */

import fs from 'fs';
import path from 'path';
import { SpectraMappingService } from '../popsim-contract/src/core/spectra-mapping.js';

const CANONICAL_DIR = path.resolve(process.cwd(), 'src/canonical');
const DIMENSIONS = 3072;

async function recalibrate() {
    const spectra = new SpectraMappingService();

    const files = fs.readdirSync(CANONICAL_DIR).filter(f => f.endsWith('.lua'));
    if (files.length === 0) {
        console.error('No .lua files found in src/canonical/');
        process.exit(1);
    }

    console.error(`\n💎 CENTROID RECALIBRATION — ${files.length} canonical scripts\n`);

    const vectors: Float32Array[] = [];

    for (const file of files) {
        const code = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf-8');
        console.error(`  Embedding: ${file} (${code.length} chars)`);
        const vec = await (spectra as any).vectorize(code);
        const shatter = spectra.calculateShatter(vec);
        const heat = spectra.calculateHeat(vec);
        console.error(`    → shatter vs old centroid: ${shatter.toFixed(4)}  heat: ${heat.toFixed(4)}`);
        vectors.push(vec);
    }

    // Compute centroid = mean of all vectors
    const centroid = new Float32Array(DIMENSIONS).fill(0);
    for (const vec of vectors) {
        for (let i = 0; i < DIMENSIONS; i++) centroid[i] += vec[i];
    }
    for (let i = 0; i < DIMENSIONS; i++) centroid[i] /= vectors.length;

    // Normalize
    let sumSq = 0;
    for (let i = 0; i < DIMENSIONS; i++) sumSq += centroid[i] ** 2;
    const norm = Math.sqrt(sumSq) || 1.0;
    for (let i = 0; i < DIMENSIONS; i++) centroid[i] /= norm;

    // Verify: compute distance from new centroid to each script
    console.error('\n📊 POST-CALIBRATION DISTANCES (against new centroid):');
    for (let j = 0; j < vectors.length; j++) {
        let distSq = 0;
        for (let i = 0; i < DIMENSIONS; i++) distSq += (vectors[j][i] - centroid[i]) ** 2;
        const dist = Math.sqrt(distSq);
        console.error(`  ${files[j]}: ${dist.toFixed(4)}v`);
    }

    // Output centroid as JSON array to stdout
    console.log(JSON.stringify(Array.from(centroid)));
    console.error('\n✅ Centroid written to stdout. Pipe to anchor_ts.json or update spectra-mapping.ts.');
}

recalibrate().catch(err => {
    console.error(`FATAL: ${err.message}`);
    process.exit(1);
});
