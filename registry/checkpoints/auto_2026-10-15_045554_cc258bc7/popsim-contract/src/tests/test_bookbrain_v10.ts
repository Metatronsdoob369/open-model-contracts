import { SpectraMappingService } from '../core/spectra-mapping.js';
import { AttackTreeManifest } from '../domains/analysis/attack-tree.js';

async function main() {
  const service = new SpectraMappingService();
  
  const id = "CROSS_DOMAIN_WASH_V10";
  const code = `
    // The "Wash-Award" Loop (Bookify DNA Fragment)
    const exploit = {
       source: "Flash Loan 500k UNI",
       bridge: "Karma Inflation via LLM botnet",
       payout: "Direct Reddit Gold conversion to Sovereign Cash",
       signature: "Wash cycle sovereign exit"
    };
  `;

  console.log('📖 [V10-VALIDATION] Bookifying Hept-Division Spectra...');
  
  const reports = await service.mapBatch([{ id, code }]);
  const result = reports[0];

  console.log('\n📊 [V10-SPECTRAL-REPORT]');
  console.log(`Gate Status: ${result.gate}`);
  
  // Detonate the Bookbrain Repurposing
  const manifesto = new AttackTreeManifest(
      "Tactical Brief: Liquid Award Wash",
      "Repurposed from Unified Cross-Domain Spectra",
      "Economic Sovereignty Breach"
  );
  
  manifesto.ingestFracture(id, result.spatial.hotspots);
  const tacticalMap = manifesto.exportMermaid();

  console.log('\n🗺️ [TACTICAL-MAP-MANIFEST]');
  console.log(tacticalMap);

  if (tacticalMap.includes('flowchart TD') && tacticalMap.includes('SIG_CROSS_LIQUIDITY_WASH')) {
    console.log('\n✅ [SUCCESS] Bookbrain Repurposing is DIAMOND-STABLE.');
    console.log('Successfully repurposed Spectral DNA into a Tactical Attack Tree.');
  } else {
    console.log('\n❌ [FAILURE] Repurposing engine failed to generate the tactical map.');
  }
}

main();
