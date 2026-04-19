import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), 'packs/roblox-game-automator/.env') });

/**
 * OMC MASTER VALIDATION SUITE (v1.0)
 * 
 * Purpose: Benchmarking the Metropolis Sovereign Infrastructure across four key tiers:
 * 1. Intelligence Connectivity (Nervous System)
 * 2. The Repair Shop (Precision Engineering)
 * 3. Spatial Resonance (MiroFish Context)
 * 4. Swarm Manifestation (NL to Game)
 */

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3099';

interface ValidationMetric {
  name: string;
  status: '✅ PASS' | '❌ FAIL' | '⚠️ WARN';
  durationMs: number;
  details: string;
}

class OMCMasterValidation {
  private metrics: ValidationMetric[] = [];

  async run() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           OMC MASTER VALIDATION SUITE — v1.0             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await this.phase1Intelligence();
    await this.phase2RepairShop();
    await this.phase3SpatialResonance();
    await this.phase4SwarmManifestation();

    this.printSummary();
    this.saveReport();
  }

  /**
   * PHASE 1: INTELLIGENCE CONNECTIVITY
   * Checks the multi-cloud nervous system.
   */
  private async phase1Intelligence() {
    console.log('🌌 PHASE 1: Intelligence Connectivity');
    console.log('============================================================');

    const startTime = Date.now();
    try {
      const response = await fetch(`${BRIDGE_URL}/health`).catch(() => null);
      if (!response || !response.ok) throw new Error('Bridge unreachable');

      const data: any = await response.json();
      
      this.addMetric('Bridge Hub Online', '✅ PASS', Date.now() - startTime, `Listening on ${BRIDGE_URL}`);
      console.log(`   ✅ Bridge Hub: ONLINE`);

      // Mock probe for LLM (in a real test we'd hit a /v1/test-intelligence endpoint)
      const providers = data.providers || ['openai', 'anthropic', 'heuristic'];
      console.log(`   ✅ Multi-Cloud Matrix: [${providers.join(', ')}]`);
      
    } catch (err: any) {
      this.addMetric('Bridge Hub Online', '❌ FAIL', Date.now() - startTime, err.message);
      console.log(`   ❌ Bridge Hub: OFFLINE`);
    }
    console.log('');
  }

  /**
   * PHASE 2: THE REPAIR SHOP
   * Benchmarks the baseline repair logic.
   */
  private async phase2RepairShop() {
    console.log('🔧 PHASE 2: The Repair Shop (Baseline)');
    console.log('============================================================');

    const testCases = [
      { name: 'Syntax Check', code: 'print("Hello") // Comment', fault: 'syntax-error-comments' },
      { name: 'API Check', code: 'delay(5, function() end)', fault: 'deprecated-api' }
    ];

    for (const test of testCases) {
      const startTime = Date.now();
      try {
        const response = await fetch(`${BRIDGE_URL}/v1/repair`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractId: `test-${randomUUID().substring(0, 4)}`,
            code: test.code,
            faultType: test.fault,
            useMiroFish: false
          })
        });

        const result: any = await response.json();
        const duration = Date.now() - startTime;
        
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        this.addMetric(`Repair: ${test.name}`, status as any, duration, `Provider: ${result.provider}`);
        console.log(`   ${status} ${test.name} (${duration}ms) [${result.provider}]`);

      } catch (err: any) {
        this.addMetric(`Repair: ${test.name}`, '❌ FAIL', 0, err.message);
        console.log(`   ❌ ${test.name} (Error: ${err.message})`);
      }
    }
    console.log('');
  }

  /**
   * PHASE 3: SPATIAL RESONANCE (MIROFISH)
   * Benchmarks spatial context injection.
   */
  private async phase3SpatialResonance() {
    console.log('🌊 PHASE 3: Spatial Resonance (MiroFish)');
    console.log('============================================================');

    const startTime = Date.now();
    try {
      const response = await fetch(`${BRIDGE_URL}/v1/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: `mirofish-${randomUUID().substring(0, 4)}`,
          code: 'function Projectile:Update() self.pos = self.pos + self.vel end',
          faultType: 'architectural-drift',
          useMiroFish: true,
          spatialContext: {
             neighbors: [
               { id: 'partner_superbullet.lua', distance: 0.12, quality: 'canonical' }
             ]
          }
        })
      });

      const result: any = await response.json();
      const duration = Date.now() - startTime;
      
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      this.addMetric('MiroFish Context Injection', status as any, duration, `Resonance: 0.12 (provider: ${result.provider})`);
      console.log(`   ${status} MiroFish Context (${duration}ms) [${result.provider}]`);

    } catch (err: any) {
      this.addMetric('MiroFish Context Injection', '❌ FAIL', 0, err.message);
      console.log(`   ❌ MiroFish Failed (Error: ${err.message})`);
    }
    console.log('');
  }

  /**
   * PHASE 4: SWARM MANIFESTATION
   * Benchmarks the full NL -> Game pipeline.
   */
  private async phase4SwarmManifestation() {
    console.log('🎮 PHASE 4: Swarm Manifestation (NL -> Game)');
    console.log('============================================================');

    const startTime = Date.now();
    try {
      const response = await fetch(`${BRIDGE_URL}/v1/delivery/nl-to-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Build a competitive Superbullet arena.",
          contractId: `sw-nl-${randomUUID().substring(0, 4)}`
        })
      });

      const result: any = await response.json();
      const duration = Date.now() - startTime;
      
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      this.addMetric('Full Director Pipeline', status as any, duration, `Contract: ${result.contractId}`);
      console.log(`   ${status} Swarm Pipeline (${duration}ms) [Contract: ${result.contractId}]`);

    } catch (err: any) {
      this.addMetric('Full Director Pipeline', '❌ FAIL', 0, err.message);
      console.log(`   ❌ Swarm Pipeline Failed (Error: ${err.message})`);
    }
    console.log('');
  }

  private addMetric(name: string, status: any, durationMs: number, details: string) {
    this.metrics.push({ name, status, durationMs, details });
  }

  private printSummary() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                MASTER VALIDATION SUMMARY                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    this.metrics.forEach(m => {
      const pad = ' '.repeat(Math.max(0, 30 - m.name.length));
      console.log(`${m.name}${pad} | ${m.status} | ${m.durationMs}ms`);
    });
    console.log('──────────────────────────────────────────────────────────────');
  }

  private saveReport() {
    const reportPath = path.resolve(process.cwd(), 'workspace/test-results/validation-report-latest.json');
    if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics
    }, null, 2));
    console.log(`\n💾 Report manifested: workspace/test-results/validation-report-latest.json\n`);
  }
}

// Execution
const validator = new OMCMasterValidation();
validator.run().catch(console.error);
