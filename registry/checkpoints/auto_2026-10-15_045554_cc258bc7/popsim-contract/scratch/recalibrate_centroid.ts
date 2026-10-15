import { SpectraMappingService } from '../src/core/spectra-mapping.js';

async function recalibrateCentroid() {
    const mapper = new SpectraMappingService();
    
    const artifacts = [
        { id: 'OMC_SIGN', code: 'export class SignatureEngine { static sign(content) { return crypto.createHash("blake2b512").update(content).digest("hex"); } }' },
        { id: 'OZ_ACCESS', code: 'abstract contract AccessControl { mapping(bytes32 => RoleData) private _roles; function hasRole(bytes32 role, address account) { return _roles[role].members[account]; } }' },
        { id: 'S7_SAFE', code: 'async function secureS7Handshake(clientCert) { if (!verify(clientCert)) throw Error(); return startTLS13({ mutualAuth: true }); }' }
    ];

    console.log('💎 Generating Canonical Resonance Vectors...');
    
    // We get the raw vectors from the internal vectorize method
    const vectors: Float32Array[] = [];
    for (const art of artifacts) {
        // @ts-ignore - reaching into private for calibration
        const vec = await mapper.vectorize(art.code);
        vectors.push(vec);
    }

    // Calculate Average Centroid
    const dimensions = 3072;
    const centroid = new Float32Array(dimensions);
    for (let i = 0; i < dimensions; i++) {
        let sum = 0;
        for (const v of vectors) sum += v[i];
        centroid[i] = sum / vectors.length;
    }

    console.log('\n--- NEW DIAMOND-STABLE CENTROID ---');
    console.log(`[${Array.from(centroid).join(',')}]`);
}

recalibrateCentroid().catch(console.error);
