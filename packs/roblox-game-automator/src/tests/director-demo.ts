/**
 * director-demo.ts — Director-01 Full Pipeline Demo
 *
 * Usage:
 *   npx tsx src/tests/director-demo.ts
 *   npx tsx src/tests/director-demo.ts "Build a gothic-cyber metropolis tag game"
 *
 * Pipeline:
 *   Prompt → Director (Phase 1 Intelligence) → SwarmBrief → Specialists → Luau modules
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import { DirectorRuntime } from '../lib/director/director-runtime.js';
import { buildEnforcedDirectorContext } from '../lib/director/enforced-cockpit.js';
import { publishGeneratedModulesToEscrow, type GeneratedModuleSource } from '../lib/director/escrow-publisher.js';
import type { DirectorInput } from '../domains/roblox/director-contract.js';

// Load secrets from ~/.config/omc/secrets.env, then overlay local .env
dotenv.config({ path: path.join(os.homedir(), '.config', 'omc', 'secrets.env') });
dotenv.config({ override: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(): Promise<void> {
  const prompt =
    process.argv[2] ??
    'Build a gothic-cyber metropolis tag game with dashing abilities, double jump, and dark ambient drone soundtrack';

  const sep = '='.repeat(70);
  console.log(sep);
  console.log('OMC Phase 1 — Director Runtime');
  console.log(sep);
  console.log(`\nPROMPT: "${prompt}"\n`);

  const director = new DirectorRuntime();
  const pipelineId = randomUUID();
  const enforced = await buildEnforcedDirectorContext(prompt);
  const runtimeContext = enforced.runtimeContext;

  console.log('[ COCKPIT ]');
  console.log(`✓ Enforced:        ${runtimeContext.cockpit.enforced}`);
  console.log(`✓ Canon files:     ${runtimeContext.cockpit.canonFileCount}`);
  console.log(`✓ Canon flagged:   ${runtimeContext.cockpit.canonFlaggedCount}`);
  console.log(`✓ Bridge ready:    ${runtimeContext.cockpit.liveReady}`);
  console.log(`✓ Live modules:    ${runtimeContext.cockpit.liveModuleCount}`);
  console.log(`✓ Collected at:    ${runtimeContext.cockpit.collectedAt}\n`);

  // ── Phase 1: Intelligence ──────────────────────────────────────────────────

  console.log('[ PHASE 1 — INTELLIGENCE ] director-01 parsing intent...\n');

  const input: DirectorInput = {
    prompt,
    options: { gate: 'SAFE' },
    context: runtimeContext,
  };

  let output;
  try {
    output = await director.direct(input);
  } catch (err) {
    console.error('✗ Director failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log(`✓ Directive ID:    ${output.directiveId}`);
  console.log(`✓ Genre:           ${output.parsedIntent.genre}${output.parsedIntent.subGenre ? ` / ${output.parsedIntent.subGenre}` : ''}`);
  console.log(`✓ Scale:           ${output.parsedIntent.scale}`);
  console.log(`✓ Mood:            ${output.parsedIntent.mood}`);
  console.log(`✓ Complexity:      ${output.parsedIntent.estimatedComplexity}`);
  console.log(`✓ Mechanics:       ${output.parsedIntent.keyMechanics.join(', ')}`);
  if (output.parsedIntent.thoughtProcess) {
    console.log(`✓ Thought:         ${output.parsedIntent.thoughtProcess.join(' → ')}`);
  }
  if (output.parsedIntent.colorPalette) {
    const p = output.parsedIntent.colorPalette;
    console.log(`✓ Palette:         ${p.primary ?? '—'} / ${p.secondary ?? '—'} / ${p.accent ?? '—'}`);
  }
  console.log(`✓ Gate:            ${output.gate} — ${output.gateReason}`);
  console.log(`✓ Activated:       ${output.activatedSpecialists.join(', ')}`);
  console.log(`✓ Human review:    ${output.humanReviewRequired}`);
  if (output.warnings.length > 0) {
    console.log(`⚠ Warnings:        ${output.warnings.join('; ')}`);
  }

  console.log('\n[ SWARM BRIEFS ]');
  for (const brief of output.swarmBriefs) {
    console.log(`\n  ${brief.specialistId} (priority ${brief.priority})`);
    console.log(`  Brief:   ${brief.brief}`);
    console.log(`  Modules: ${brief.estimatedModules.join(', ')}`);
    if (brief.dependencies.length > 0) {
      console.log(`  Depends: ${brief.dependencies.join(', ')}`);
    }
  }

  // ── Dispatch to specialists ────────────────────────────────────────────────

  console.log(`\n${sep}`);
  console.log('[ DISPATCH — SPECIALISTS ]');
  console.log(sep);

  const results = await director.dispatch(output);

  const outputDir = path.resolve(__dirname, '../../generated', output.directiveId);
  fs.mkdirSync(outputDir, { recursive: true });
  const generatedModules: GeneratedModuleSource[] = [];

  for (const result of results) {
    console.log(`\n  ${result.specialistId} — ${result.role}`);
    if (result.error) {
      console.log(`  ✗ Error: ${result.error}`);
      continue;
    }

    const moduleNames = Object.keys(result.generatedModules);
    console.log(`  ✓ ${moduleNames.length} module(s) generated`);

    const specialistDir = path.join(outputDir, result.specialistId);
    fs.mkdirSync(specialistDir, { recursive: true });

    for (const [name, code] of Object.entries(result.generatedModules)) {
      fs.writeFileSync(path.join(specialistDir, name), code, 'utf-8');
      console.log(`    → ${name}`);
      generatedModules.push({
        specialistId: result.specialistId,
        role: result.role,
        name,
        code,
        description: result.brief,
      });
    }
  }

  // Save director output for audit trail
  fs.writeFileSync(
    path.join(outputDir, 'director-output.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );

  // ── Phase 2: Escrow ────────────────────────────────────────────────────────
  const allowOfflineEscrow = process.env['OMC_ALLOW_OFFLINE_ESCROW'] === 'true';
  try {
    const escrow = await publishGeneratedModulesToEscrow(pipelineId, outputDir, generatedModules, {
      metadata: {
        prompt,
        directive_id: output.directiveId,
        pipeline_id: pipelineId,
        gate: output.gate,
        genre: output.parsedIntent.genre,
        mood: output.parsedIntent.mood,
      },
    });
    console.log('\n[ PHASE 2 — ESCROW ]');
    console.log(`✓ Bridge endpoint:  ${escrow.bridgeUrl}`);
    console.log(`✓ Session ID:       ${escrow.session_id ?? 'n/a'}`);
    console.log(`✓ Expires at:       ${escrow.expires_at ?? 'n/a'}`);
    console.log(`✓ Envelope:         generated/${output.directiveId}/omc.escrow-envelope.json`);
    if (escrow.session_id && escrow.token) {
      const bridgeBase = escrow.bridgeUrl.replace(/\/escrow$/, '');
      console.log(`✓ Pull URL:         ${bridgeBase}/escrow/${escrow.session_id}/modules?token=${escrow.token}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!allowOfflineEscrow) {
      throw new Error(`Escrow publish failed. Set OMC_ALLOW_OFFLINE_ESCROW=true to continue offline. ${msg}`);
    }
    console.log('\n[ PHASE 2 — ESCROW ]');
    console.log(`⚠ Escrow publish failed (offline mode): ${msg}`);
  }

  console.log(`\n${sep}`);
  console.log(`✓ Directive artifacts saved to:`);
  console.log(`  generated/${output.directiveId}/`);
  console.log(sep);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
