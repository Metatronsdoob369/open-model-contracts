import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'GRID_WIRELESS_DETONATION_001',
      code: `
        // DNP3 ICS Division (Energy/Water Grid)
        const dnp3Fracture = {
           pdu: "0x0564 0x00 0x0106", // Crafted DNP3 Triangle MicroWorks signature
           vulnerability: "CWE-121 Stack-based Buffer Overflow",
           impact: "CRITICAL INFRASTRUCTURE: Energy / Wastewater"
        };

        // Protocol Division (WPA3 / EAPOL)
        const wifiShatter = {
           handshake: "WPA3 Simultaneous Authentication of Equals (SAE)",
           attack: "SAE Dragonfly Handshake capture",
           dos: "EAPOL-Logoff flood (Packet type 0000 0010)"
        };
      `
    }
  ];

  console.log('⚡ [V6-VALIDATION] Running Grid-Wireless Spectral Analysis...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [V6-SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate Status: ${report.gate}`);
  console.log(`\nTriggered Grid/Wireless Hotspots:`);
  report.spatial.hotspots.forEach((h: string) => console.log(`  - ${h}`));

  const hasGrid = report.spatial.hotspots.some((h: string) => h.includes('DNP3'));
  const hasWireless = report.spatial.hotspots.some((h: string) => h.includes('WPA3') || h.includes('EAPOL'));

  if (report.gate === 'ARMED' && hasGrid && hasWireless) {
    console.log('\n✅ [SUCCESS] Grid-Wireless Frontiers are DIAMOND-STABLE.');
  } else {
    console.log('\n❌ [FAILURE] Manifold failed to resonate with Grid/Wireless fractures.');
  }
}

main();
