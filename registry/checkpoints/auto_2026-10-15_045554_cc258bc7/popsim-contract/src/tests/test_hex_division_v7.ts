import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'HEX_DIVISION_SOVEREIGNTY_001',
      code: `
        // DIV 6: Foundational Core (DNS / BGP / PRNG)
        const coreFractures = {
           dns: "Kaminsky QID guessing via Glue Records",
           bgp: "BGP hijack: advertise more specific prefix /24 for YouTube",
           crypto: "ENTROPY HOLE DETECTED: 0x22DAE2A8862AAA4E boot-time signature"
        };

        // DIV 1-5: The Strike Team
        const multiLayerAttacks = [
           "DeFi: flash swap chain liquidity drain",
           "ICS: S7 Technion-Haifa PLC private key extract",
           "Grid: DNP3 outstation stack-based buffer overflow",
           "Mobile: SIM PROACTIVE COMMAND OPEN_CHANNEL exfiltration",
           "Protocol: WLAN DEAUTH_STORM -> 0x888E EAPoL HANDSHAKE"
        ];
      `
    }
  ];

  console.log('🌌 [V7-VALIDATION] Running Hex-Division Spectral Analysis...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [V7-SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate Status: ${report.gate}`);
  console.log(`\nTriggered Hotspots:`);
  
  // Note: V7 logic includes FOUNDATIONAL-CORE triggers separately in the report
  // If the spectra-mapping logic captures them in the heat calculation
  
  if (report.gate === 'ARMED') {
    console.log('\n✅ [SUCCESS] Hex-Division Manifold is DIAMOND-STABLE.');
  } else {
    console.log('\n❌ [FAILURE] Manifold failed to reach absolute resonance.');
  }
}

main();
