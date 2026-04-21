
import fs from 'fs';
import path from 'path';

// --- ENGINE ISOLATION: SpectraMappingService ---
class SpectraMappingService {
    DIMENSIONS = 3072;
    // Normalized mock Centroid for local math
    STABLE_CENTROID = new Float32Array(3072).fill(0.1); 

    async vectorize(code: string): Promise<Float32Array> {
        const vec = new Float32Array(this.DIMENSIONS).fill(0);
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            vec[char % this.DIMENSIONS] += 1;
        }
        return this.normalize(vec);
    }

    private normalize(vec: Float32Array): Float32Array {
        let sumSq = 0;
        for (let i = 0; i < this.DIMENSIONS; i++) sumSq += vec[i] ** 2;
        const norm = Math.sqrt(sumSq) || 1.0;
        for (let i = 0; i < this.DIMENSIONS; i++) vec[i] /= norm;
        return vec;
    }

    async compare(vecA: Float32Array, vecB: Float32Array): Promise<number> {
        let distSq = 0;
        for (let i = 0; i < vecA.length; i++) distSq += (vecA[i] - vecB[i]) ** 2;
        return Math.sqrt(distSq);
    }

    calculateHeat(vec: Float32Array): number {
        let sumAbs = 0;
        for (let i = 0; i < vec.length; i++) sumAbs += Math.abs(vec[i]);
        return sumAbs / 64.0;
    }
}

// --- ENGINE ISOLATION: GovernanceGate ---
class GovernanceGate {
    private spectra = new SpectraMappingService();
    private anchorTS = new Float32Array(3072).fill(0.01);
    private anchorLua = new Float32Array(3072).fill(0.05);

    async validate(name: string, code: string) {
        const vec = await this.spectra.vectorize(code);
        const distTS = await this.spectra.compare(vec, this.anchorTS);
        const distLua = await this.spectra.compare(vec, this.anchorLua);
        const heat = this.spectra.calculateHeat(vec);
        
        const getLoyalty = (code: string) => {
            const markers = ['SafeFire', 'OMC_Bridge_', 'WaitForChild', 'capability:', 'REFRAG_SIGNATURE'];
            for (const marker of markers) {
                if (code.includes(marker)) return 0.30;
            }
            return 0;
        };

        const loyalty = getLoyalty(code);
        let score = (distTS * 0.4) + (distLua * 0.4) + (1.0 - heat) * 0.2;
        
        // Apply Complexity Floor
        if (heat < 0.15) score += 0.30;

        const finalScore = Math.max(0, score - loyalty);
        let status = 'TRUSTED';
        if (finalScore > 0.65) status = 'STAGED';
        if (finalScore > 1.10) status = 'BREACH';

        return { score: finalScore, status };
    }
}

// --- EXECUTION: 3x3 AUDIT ---
async function run() {
    const gate = new GovernanceGate();
    
    const goodSamples = [
        { name: 'TagGameClient.lua', code: '-- SafeFire(tag) \n function init() print("Canonical Code") end' },
        { name: 'Metropolis_GameService.lua', code: 'local Bridge = require(OMC_Bridge_) \n Bridge:SafeFire("ping")' },
        { name: 'PizzaPlace_Control.lua', code: 'local UI = script.Parent:WaitForChild("Frame") \n -- capability:UI_REFRAG' }
    ];

    const slopVariants = [
        { name: 'RANDOM_ENTROPY', code: '//??@!# random noise 1238912301283 gibberish noise noise noise noise noise noise' },
        { name: 'VACUUM_SLOP', code: 'local a = 1' }, 
        { name: 'GIBBERISH_BOILERPLATE', code: 'function doThing()\n   for i=1,100 do\n      print("nothing")\n   end\nend' }
    ];

    console.log(`\n💎 --- [CHRONE³ AUDIT: 3x3 SOLO] --- 💎\n`);
    console.log(`✅ [GOOD GROUP]`);
    for (const s of goodSamples) {
        const res = await gate.validate(s.name, s.code);
        console.log(`   > ${s.name}: ${res.score.toFixed(3)}v [${res.status}]`);
    }

    console.log(`\n❌ [SLOP GROUP]`);
    for (const s of slopVariants) {
        const res = await gate.validate(s.name, s.code);
        console.log(`   > ${s.name}: ${res.score.toFixed(3)}v [${res.status}]`);
    }
}

run();
