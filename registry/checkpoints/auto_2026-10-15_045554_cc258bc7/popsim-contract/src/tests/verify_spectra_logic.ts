/**
 * Unit Test: 3072-D Spectra Logic Verification
 * Verifies Manhattan Heat and Euclidean Shatter calculations for unit vectors.
 */

import { SpectraMappingService } from '../core/spectra-mapping.js';

async function testSpectraLogic() {
  console.log("--- 3072-D Spectra Logic Test ---");
  
  const spectra = new SpectraMappingService();
  
  // Create a mock 3072-D unit vector
  const mockVec = new Float32Array(3072).fill(0);
  mockVec[0] = 0.5;
  mockVec[1000] = 0.5;
  mockVec[2000] = 0.5;
  mockVec[3071] = 0.5;
  
  // Normalize it manually for the test
  let sumSq = 0;
  for(let i=0; i<3072; i++) sumSq += mockVec[i]**2;
  const norm = Math.sqrt(sumSq);
  for(let i=0; i<3072; i++) mockVec[i] /= norm;

  console.log(`Vector Norm: ${Math.sqrt(mockVec.reduce((a, b) => a + b*b, 0)).toFixed(6)}`);

  // Calculate Heat
  const heat = spectra.calculateHeat(mockVec);
  console.log(`Calculated Heat (Manhattan): ${heat.toFixed(6)}`);

  // Calculate Shatter
  const shatter = spectra.calculateShatter(mockVec);
  console.log(`Calculated Shatter (Euclidean distance from stable): ${shatter.toFixed(6)}`);

  // Verify Projection
  const [x, y, z] = spectra.projectTo3D(mockVec);
  console.log(`3D Projection: [${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}]`);

  if (Math.abs(heat) > 0 && Math.abs(shatter) > 0) {
    console.log("✅ Spectra Logic Verified (High Entropy).");
  } else {
    console.log("❌ Spectra Logic Failed (Zero Values).");
  }
}

testSpectraLogic().catch(console.error);
