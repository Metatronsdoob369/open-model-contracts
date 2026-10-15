import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'CROSS_DOMAIN_UNIFIED_001',
      code: `
        // PHASE 1: The Crypto Origin (DeFi Exploit)
        const cryptoOrigin = "Flash swap chain liquidity drain for 1M USDC";

        // PHASE 2: The Middle Bridge (Reputation Inflation)
        const reputationBridge = {
           action: "Token transfer resonance -> automatic upvote reputation",
           target: "Reddit Karma Threshold 5000 bypass",
           method: "Cross-domain on-chain identity inflation"
        };

        // PHASE 3: The Funding Exit (Economic Payout)
        const economicExit = {
           goal: "Liquid award wash to Reddit Gold conversion",
           payout: "Direct conversion to Sovereign USD via Contributor Program",
           signature: "Wash cycle sovereign exit"
        };
      `
    }
  ];

  console.log('⚡ [V9-VALIDATION] Running Cross-Domain Unified Analysis...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [V9-SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate Status: ${report.gate}`);
  console.log(`\nTriggered Cross-Domain Hotspots:`);
  
  if (report.gate === 'ARMED') {
    console.log('\n✅ [SUCCESS] Manifold has Unified Crypto and Funding.');
    console.log('Detected the CIRCULAR WASH between domains.');
  } else {
    console.log('\n❌ [FAILURE] Manifold failed to bridge the domains.');
  }
}

main();
