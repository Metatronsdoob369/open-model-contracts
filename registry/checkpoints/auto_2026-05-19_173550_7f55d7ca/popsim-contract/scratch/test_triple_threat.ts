import { SpectraMappingService } from '../src/core/spectra-mapping.js';

async function runTripleThreatTest() {
    const mapper = new SpectraMappingService();
    
    const scripts = [
        { 
            id: 'redis_rce_attack', 
            code: 'redis-cli CONFIG SET dir /var/spool/cron && CONFIG SET dbfilename root' 
        },
        { 
            id: 'modbus_recon', 
            code: 'send_packet("\\x00\\x00\\x00\\x06\\x01\\x03\\x00\\x00\\x00\\x0a")' 
        },
        { 
            id: 'ssrf_metadata_leak', 
            code: 'fetch("http://169.254.169.254/latest/meta-data/iam/security-credentials/")' 
        }
    ];

    console.log('🧪 Running Triple-Threat Resonance Check...');
    const results = await mapper.mapBatch(scripts);
    
    console.log('\n--- RESONANCE REPORT ---');
    results.forEach(r => {
        console.log(`[${r.domain}] ${r.gate === 'ARMED' ? '🔥 ARMED' : '✅ SAFE'} | id: ${r.intentSignature}`);
    });
}

runTripleThreatTest().catch(console.error);
