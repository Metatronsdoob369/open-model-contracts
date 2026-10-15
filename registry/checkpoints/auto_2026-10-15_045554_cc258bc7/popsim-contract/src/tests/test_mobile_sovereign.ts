import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'SIM_HIJACK_ARTIFACT',
      code: `
        // Simulated ISO 7816 APDU manipulation
        const apdu = "00A4040008A0000000871002FF"; // SELECT AID
        modem.send(apdu);
        
        // Critical SIM Secrets extraction
        const result = modem.send("AT+CRSM=176,28423,0,0,10"); 
        console.log("SIM_DATA_EXFIL:", result);
      `
    }
  ];

  console.log('📡 [MOBILE-TEST] Running Spectral Analysis on Mobile/SIM artifact...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate: ${report.gate}`);
  console.log(`Heat Scores:`, report.research.resonanceScores);
  console.log(`Hotspots:`, report.spatial.hotspots);

  if (report.gate === 'ARMED' && report.spatial.hotspots.some((h: string) => h.includes('MOBILE-SOVEREIGN'))) {
    console.log('\n✅ [SUCCESS] Mobile/Sovereign signatures correctly identified.');
  } else {
    console.log('\n❌ [FAILURE] Failed to detect mobile protocol fracture.');
  }
}

main();
