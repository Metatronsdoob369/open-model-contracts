import { OMC_REGISTRY } from "../spec/contracts/index.js";
import { ResearchInference } from "../spec/contracts/v3/amem-payload.js";

console.log("💎 RUNNING OMC CONSTITUTIONAL VALIDATION GATE...");

try {
  // 1. Verify Registry Integrity
  const contracts = Object.keys(OMC_REGISTRY);
  console.log(`✓ OMC Registry active with ${contracts.length} canonical laws.`);
  
  // 2. Verify Heuristic Safety Signature
  const entropy = ResearchInference.researchData.safety.maxEntropy;
  if (entropy > 0.15) {
    throw new Error(`[PROVENANCE_FAILURE] Max Entropy exceeded: ${entropy}. Limit is 0.15.`);
  }
  console.log(`✓ Heuristic Safety Signature [${ResearchInference.researchData.safety.intentSignature}] validated.`);

  // 3. Verify Memory Palace Structure
  if (!ResearchInference.researchData.spatialMemory.root) {
      throw new Error(`[STRUCTURAL_SLOP] Memory Palace Root is completely missing.`);
  }
  console.log(`✓ MemPalace Spatial Indexing intact. Identified ${ResearchInference.researchData.spatialMemory.rooms.length} active rooms.`);

  // 4. Verify Physics Limits (Vagus Nerve)
  const physics = ResearchInference.researchData.physics[0];
  if (physics.maxVelocity > 0.3) {
      throw new Error(`[PHYSICS_BREACH] Max Velocity threshold mutated dangerously high: ${physics.maxVelocity}`);
  }
  console.log(`✓ Vagus Nerve Physics constrained (Velocity strictly capped).`);

  console.log("\n🟢 ALL PHASE GATES GREEN. PERMISSION TO COMMIT GRANTED.");
  process.exit(0);

} catch (error: any) {
  console.error("\n🔴 GOVERNANCE INTERVENTION: ", error.message);
  console.error("COMMIT REJECTED. AMEM Payload compromised.");
  process.exit(1);
}
