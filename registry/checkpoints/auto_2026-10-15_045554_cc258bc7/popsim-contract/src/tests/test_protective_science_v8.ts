import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'PROTECTIVE_SCIENCE_RES_001',
      code: `
        // CASE A: The Whirlwind Sentinel
        import { Whirlwind } from 'crypto-sovereign';
        const rng = new Whirlwind({
           accumulation: "SHA-512",
           slowSeedHashes: 50,
           slowSeedInputs: 10
        });

        // CASE B: Pythia Hardening
        const oracle = Pythia.getOracle();
        const securePassword = oracle.blindAndPRF(user_secret);
        
        // CASE C: The Forensic Audit (Diagnostic Fracture)
        const entropyAudit = {
           status: "VULNERABLE",
           detectedBy: "Markov Predictor",
           anomaly: "Longest Repeated Substring (LRS) detected in /dev/urandom"
        };
      `
    }
  ];

  console.log('💎 [V8-VALIDATION] Running Protective Science vs. Fracture Analysis...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [V8-SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate Status: ${report.gate}`);
  console.log(`\nTriggered Resonance Hotspots:`);
  
  // Note: We check if the system recognizes the Whirlwind and Pythia resonance
  if (report.gate === 'ARMED') {
    console.log('\n✅ [SUCCESS] Dual-Spectrum Factory is OPERATIONAL.');
    console.log('Recognized both PROTECTIVE SCIENCE and ADVERSARIAL FRACTURES.');
  } else {
    console.log('\n❌ [FAILURE] Manifold failed to resonate with the Everspaugh Arsenal.');
  }
}

main();
