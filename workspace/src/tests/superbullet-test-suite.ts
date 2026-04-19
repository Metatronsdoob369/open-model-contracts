/**
 * @popsim/contract — Superbullet Test Suite
 * Three-phase validation: Baseline Repair → MiroFish Repair → Full NL Generation
 */

 import * as fs from 'fs';
 import * as path from 'path';
 import { randomUUID } from 'crypto';

 // ─────────────────────────────────────────────
 // TEST CONFIGURATION
 // ─────────────────────────────────────────────

 const TEST_CONFIG = {
 bridgeUrl: process.env.BRIDGE_URL || 'http://localhost:3099',
 superbulletPath: '/Users/joewales/NODE_OUT_Master/open-model-contracts/src/canonical/partner_superbullet.lua',
 workspacePath: '/Users/joewales/NODE_OUT_Master/open-model-contracts/workspace',
 phases: ['repair-baseline', 'repair-mirofish', 'nl-generation'] as const,
 };

 // ─────────────────────────────────────────────
 // BROKEN CODE VARIANTS (Injected Faults)
 // ─────────────────────────────────────────────

 const BROKEN_VARIANTS = [
 {
 name: 'syntax-error-comments',
 fault: 'Uses // instead of -- for comments (invalid Luau)',
 transform: (code: string) => code.replace(/-- /g, '// '),
 },
 {
 name: 'missing-end-statement',
 fault: 'Missing end keyword in function',
 transform: (code: string) => code.replace('end\n\nreturn', 'return'),
 },
 {
 name: 'deprecated-api',
 fault: 'Uses deprecated delay() function',
 transform: (code: string) => code.replace(/delay\(5,/g, 'wait(5) -- deprecated:'),
 },
 {
 name: 'undefined-variable',
 fault: 'References undefined variable',
 transform: (code: string) => code.replace('self.startTime = tick()', 'self.startTime = undefinedVar'),
 },
 {
 name: 'malformed-cframe',
 fault: 'Invalid CFrame constructor',
 transform: (code: string) => code.replace(
 'CFrame.new(self.origin, self.origin + self.velocity)',
 'CFrame.new(self.origin) + self.velocity) -- mismatched parens'
 ),
 },
 ];

 // ─────────────────────────────────────────────
 // TEST ORCHESTRATOR
 // ─────────────────────────────────────────────

 interface TestResult {
 phase: string;
 variant: string;
 contractId: string;
 success: boolean;
 durationMs: number;
 errors: string[];
 mirofishContext?: boolean;
 spatialMapData?: any;
 }

 class SuperbulletTestSuite {
 private results: TestResult[] = [];
 private canonicalCode: string;

 constructor() {
 this.canonicalCode = fs.readFileSync(TEST_CONFIG.superbulletPath, 'utf-8');
 console.log('🧪 Superbullet Test Suite Initialized');
 console.log(`📄 Canonical code: ${this.canonicalCode.split('\n').length} lines`);
 }

 // ─── Phase 1: Baseline Repair (No MiroFish) ───
 async runBaselineRepair(): Promise<TestResult[]> {
 console.log('\n🔧 PHASE 1: Baseline Repair (No Spatial Context)');
 console.log('=' .repeat(60));

 const phaseResults: TestResult[] = [];

 for (const variant of BROKEN_VARIANTS) {
 const contractId = `sb-baseline-${randomUUID().substring(0, 8)}`;
 const brokenCode = variant.transform(this.canonicalCode);

 console.log(`\n📝 Testing: ${variant.name}`);
 console.log(` Fault: ${variant.fault}`);

 const startTime = Date.now();

 try {
 // Call bridge repair endpoint (without MiroFish context)
 const response = await fetch(`${TEST_CONFIG.bridgeUrl}/v1/repair`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 contractId,
 code: brokenCode,
 faultType: variant.name,
 useMiroFish: false, // Baseline: no spatial context
 }),
 });

 const result = await response.json();
 const duration = Date.now() - startTime;

 phaseResults.push({
 phase: 'repair-baseline',
 variant: variant.name,
 contractId,
 success: result.success,
 durationMs: duration,
 errors: result.errors || [],
 mirofishContext: false,
 });

 console.log(` ✅ Result: ${result.success ? 'FIXED' : 'FAILED'} (${duration}ms)`);

 // Save broken and fixed versions
 this.saveTestArtifact(contractId, variant.name, brokenCode, result.fixedCode, 'baseline');

 } catch (error) {
 phaseResults.push({
 phase: 'repair-baseline',
 variant: variant.name,
 contractId,
 success: false,
 durationMs: Date.now() - startTime,
 errors: [(error as Error).message],
 mirofishContext: false,
 });
 console.log(` ❌ Error: ${(error as Error).message}`);
 }
 }

 return phaseResults;
 }

 // ─── Phase 2: MiroFish-Assisted Repair ───
 async runMiroFishRepair(): Promise<TestResult[]> {
 console.log('\n🌌 PHASE 2: MiroFish Repair (3072-D Spatial Context)');
 console.log('=' .repeat(60));

 const phaseResults: TestResult[] = [];

 for (const variant of BROKEN_VARIANTS) {
 const contractId = `sb-mirofish-${randomUUID().substring(0, 8)}`;
 const brokenCode = variant.transform(this.canonicalCode);

 console.log(`\n📝 Testing: ${variant.name}`);
 console.log(` Enhancement: 3072-dim embedding + spatial heat map`);

 const startTime = Date.now();

 try {
 // Step 1: Generate 3072-dim embedding for broken code
 const embedding = await this.generateEmbedding(brokenCode);

 // Step 2: Query Qdrant for nearest canonical neighbors
 const spatialContext = await this.querySpatialMap(embedding);

 // Step 3: Repair with spatial context
 const response = await fetch(`${TEST_CONFIG.bridgeUrl}/v1/repair`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 contractId,
 code: brokenCode,
 faultType: variant.name,
 useMiroFish: true,
 embedding,
 spatialContext, // Heat map showing where code sits in quality space
 }),
 });

 const result = await response.json();
 const duration = Date.now() - startTime;

 phaseResults.push({
 phase: 'repair-mirofish',
 variant: variant.name,
 contractId,
 success: result.success,
 durationMs: duration,
 errors: result.errors || [],
 mirofishContext: true,
 spatialMapData: spatialContext,
 });

 console.log(` ✅ Result: ${result.success ? 'FIXED' : 'FAILED'} (${duration}ms)`);
 console.log(` 📊 Spatial: ${spatialContext.neighbors.length} canonical neighbors`);

 this.saveTestArtifact(contractId, variant.name, brokenCode, result.fixedCode, 'mirofish');

 } catch (error) {
 phaseResults.push({
 phase: 'repair-mirofish',
 variant: variant.name,
 contractId,
 success: false,
 durationMs: Date.now() - startTime,
 errors: [(error as Error).message],
 mirofishContext: true,
 });
 console.log(` ❌ Error: ${(error as Error).message}`);
 }
 }

 return phaseResults;
 }

 // ─── Phase 3: Full NL Generation ───
 async runNLGeneration(): Promise<TestResult> {
 console.log('\n🎮 PHASE 3: Full NL Generation');
 console.log('=' .repeat(60));

 const prompt = "Build a competitive FPS called Superbullet with wall-running, weapon recoil, and projectile physics. Gothic-cyber aesthetic.";
 const contractId = `sb-nl-${randomUUID().substring(0, 8)}`;

 console.log(`📝 Prompt: "${prompt}"`);

 const startTime = Date.now();

 try {
 const response = await fetch(`${TEST_CONFIG.bridgeUrl}/v1/delivery/nl-to-game`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 prompt,
 options: { gate: 'SAFE' },
 }),
 });

 const result = await response.json();
 const duration = Date.now() - startTime;

 const testResult: TestResult = {
 phase: 'nl-generation',
 variant: 'full-pipeline',
 contractId: result.contractId || contractId,
 success: result.success,
 durationMs: duration,
 errors: result.success ? [] : [result.error || 'Generation failed'],
 mirofishContext: false,
 };

 console.log(` ✅ Result: ${result.success ? 'GENERATED' : 'FAILED'} (${duration}ms)`);
 console.log(` 📦 Contract: ${result.contractId}`);

 return testResult;

 } catch (error) {
 return {
 phase: 'nl-generation',
 variant: 'full-pipeline',
 contractId,
 success: false,
 durationMs: Date.now() - startTime,
 errors: [(error as Error).message],
 mirofishContext: false,
 };
 }
 }

 // ─── Helper: Generate 3072-dim Embedding ───
 private async generateEmbedding(code: string): Promise<number[]> {
 // TODO: Integrate with actual embedding service
 // For now, return mock 3072-dim vector
 return Array(3072).fill(0).map(() => Math.random() * 2 - 1);
 }

 // ─── Helper: Query Qdrant Spatial Map ───
 private async querySpatialMap(embedding: number[]): Promise<any> {
 // TODO: Query actual Qdrant instance
 // For now, return mock spatial context
 return {
 queryPoint: embedding.slice(0, 3), // First 3 dims for 3D viz
 neighbors: [
 { id: 'canonical-superbullet', distance: 0.23, quality: 'high' },
 { id: 'canonical-weapon-system', distance: 0.45, quality: 'high' },
 { id: 'canonical-projectile', distance: 0.31, quality: 'high' },
 ],
 heatMap: {
 x: embedding[0],
 y: embedding[1],
 z: embedding[2],
 intensity: Math.random(),
 },
 };
 }

 // ─── Helper: Save Test Artifacts ───
 private saveTestArtifact(
 contractId: string,
 variant: string,
 brokenCode: string,
 fixedCode: string | undefined,
 phase: string
 ): void {
 const testDir = path.join(TEST_CONFIG.workspacePath, 'test-results', contractId);
 if (!fs.existsSync(testDir)) {
 fs.mkdirSync(testDir, { recursive: true });
 }

 fs.writeFileSync(path.join(testDir, 'broken.lua'), brokenCode);
 if (fixedCode) {
 fs.writeFileSync(path.join(testDir, 'fixed.lua'), fixedCode);
 }
 fs.writeFileSync(path.join(testDir, 'meta.json'), JSON.stringify({
 contractId,
 variant,
 phase,
 timestamp: new Date().toISOString(),
 }, null, 2));
 }

 // ─── Generate Comparison Report ───
 generateReport(allResults: TestResult[]): void {
 console.log('\n');
 console.log('╔════════════════════════════════════════════════════════════╗');
 console.log('║ SUPERBULLET TEST SUITE — FINAL REPORT ║');
 console.log('╚════════════════════════════════════════════════════════════╝');
 console.log('');

 // Baseline vs MiroFish comparison
 const baseline = allResults.filter(r => r.phase === 'repair-baseline');
 const mirofish = allResults.filter(r => r.phase === 'repair-mirofish');
 const nlGen = allResults.find(r => r.phase === 'nl-generation');

 console.log('📊 REPAIR COMPARISON (Baseline vs MiroFish Spatial Context)');
 console.log('─'.repeat(60));
 console.log(`${'Variant'.padEnd(25)} | Baseline | MiroFish | Improvement`);
 console.log('─'.repeat(60));

 for (let i = 0; i < BROKEN_VARIANTS.length; i++) {
 const variant = BROKEN_VARIANTS[i].name;
 const base = baseline[i];
 const miro = mirofish[i];

 const baseStatus = base?.success ? '✅' : '❌';
 const miroStatus = miro?.success ? '✅' : '❌';
 const improvement = miro?.success && !base?.success ? '⬆️ FIXED' :
 base?.success === miro?.success ? '—' : '⬇️ REGRESSED';

 console.log(`${variant.padEnd(25)} | ${baseStatus} | ${miroStatus} | ${improvement}`);
 }

 console.log('');
 console.log('🎮 NL GENERATION');
 console.log('─'.repeat(60));
 console.log(`Status: ${nlGen?.success ? '✅ SUCCESS' : '❌ FAILED'}`);
 console.log(`Duration: ${nlGen?.durationMs}ms`);
 console.log(`Contract: ${nlGen?.contractId}`);

 if (nlGen?.errors.length) {
 console.log(`Errors: ${nlGen.errors.join(', ')}`);
 }

 console.log('');
 console.log('💾 Artifacts saved to: workspace/test-results/');
 console.log('');

 // Save full report
 const reportPath = path.join(TEST_CONFIG.workspacePath, 'test-results', `report-${Date.now()}.json`);
 fs.writeFileSync(reportPath, JSON.stringify({
 timestamp: new Date().toISOString(),
 results: allResults,
 summary: {
 baselineSuccessRate: baseline.filter(r => r.success).length / baseline.length,
 mirofishSuccessRate: mirofish.filter(r => r.success).length / mirofish.length,
 nlGenerationSuccess: nlGen?.success || false,
 },
 }, null, 2));

 console.log(`📄 Full report: ${reportPath}`);
 }

 // ─── Execute Full Suite ───
 async execute(): Promise<void> {
 const allResults: TestResult[] = [];

 // Phase 1: Baseline
 const baselineResults = await this.runBaselineRepair();
 allResults.push(...baselineResults);

 // Phase 2: MiroFish
 const mirofishResults = await this.runMiroFishRepair();
 allResults.push(...mirofishResults);

 // Phase 3: NL Generation
 const nlResult = await this.runNLGeneration();
 allResults.push(nlResult);

 // Generate Report
 this.generateReport(allResults);
 }
 }

 // ─────────────────────────────────────────────
 // CLI ENTRY POINT
 // ─────────────────────────────────────────────

 if (require.main === module) {
 const suite = new SuperbulletTestSuite();
 suite.execute().catch(console.error);
 }

 export { SuperbulletTestSuite, BROKEN_VARIANTS };
