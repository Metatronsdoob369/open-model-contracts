import { DirectorRuntime } from './lib/director/director-runtime.js';
import type { SpecialistDispatchResult } from './lib/director/director-runtime.js';
import {
  publishGeneratedModulesToEscrow,
  type GeneratedModuleSource,
  type EscrowPublishResult,
} from './lib/director/escrow-publisher.js';
import {
  buildEnforcedDirectorContext,
  type RuntimeGenerationContext,
} from './lib/director/enforced-cockpit.js';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as os from 'os';

// Load secrets from ~/.config/omc/secrets.env first, then overlay local .env
dotenv.config({ path: path.join(os.homedir(), '.config', 'omc', 'secrets.env') });
dotenv.config({ override: false }); // local .env fills non-secret vars without overwriting

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EscrowSessionView {
  session_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  bridge_url?: string;
}

function flattenGeneratedModules(
  results: SpecialistDispatchResult[],
  runtimeContext: RuntimeGenerationContext
): GeneratedModuleSource[] {
  const modules: GeneratedModuleSource[] = [];
  for (const result of results) {
    if (result.error) continue;
    for (const [name, code] of Object.entries(result.generatedModules)) {
      modules.push({
        specialistId: result.specialistId,
        role: result.role,
        name,
        code,
        description: result.brief,
        spectralHint: {
          nearestCanonicalId: runtimeContext.nearestCanonicalId,
          nearestCanonicalScore: runtimeContext.nearestCanonicalScore,
          tFrame: runtimeContext.tFrame,
          shatter: runtimeContext.generationMode === 'patch' ? 0.08 : 0.12,
          shatterMap: runtimeContext.generationMode === 'patch' ? [0.08, 0.07, 0.09] : [0.12, 0.11, 0.13],
        },
      });
    }
  }
  return modules;
}

function normalizeLuaName(name: string): string {
  const noExt = name.replace(/\.(lua|luau)$/i, '');
  return `${noExt}.lua`;
}

function mergePatchBaselines(
  generated: GeneratedModuleSource[],
  runtimeContext: RuntimeGenerationContext
): GeneratedModuleSource[] {
  if (runtimeContext.generationMode !== 'patch' || runtimeContext.canonicalExemplars.length === 0) {
    return generated;
  }

  const merged = new Map<string, GeneratedModuleSource>();
  for (const base of runtimeContext.canonicalExemplars.slice(0, 3)) {
    const fileName = normalizeLuaName(base.moduleName);
    merged.set(fileName.toLowerCase(), {
      specialistId: 'canonical-base',
      role: `canonical:${base.genre}`,
      name: fileName,
      code: base.code,
      description: `Canonical baseline ${base.canonicalId}`,
      spectralHint: {
        nearestCanonicalId: base.canonicalId,
        nearestCanonicalScore: base.score,
        tFrame: runtimeContext.tFrame,
        shatter: 0.06,
        shatterMap: [0.06, 0.06, 0.06],
      },
    });
  }

  for (const module of generated) {
    const fileName = normalizeLuaName(module.name);
    merged.set(fileName.toLowerCase(), { ...module, name: fileName });
  }

  return Array.from(merged.values());
}

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

async function runOrchestrator(prompt: string) {
  console.log('🚀 LawCRON Orchestrator Starting...');
  console.log(`📝 Seed: "${prompt}"`);

  const pipelineId = randomUUID();
  const runId = pipelineId.substring(0, 8);
  const buildDir = path.resolve(process.cwd(), 'temp-builds', runId);
  const srcDir = path.join(buildDir, 'src');

  // ── Phase 1: Intelligence ──────────────────────────────────────────────────

  const director = new DirectorRuntime();
  const enforced = await buildEnforcedDirectorContext(prompt);
  const adjudication = enforced.adjudication;
  const runtimeContext = enforced.runtimeContext;

  console.log('\n🧠 Phase 1: Intelligence (Director-01)...');
  console.log(`   cockpit   : enforced @ ${runtimeContext.cockpit.collectedAt}`);
  console.log(`   canon     : files=${runtimeContext.cockpit.canonFileCount} flagged=${runtimeContext.cockpit.canonFlaggedCount}`);
  console.log(
    `   bridge    : ${runtimeContext.cockpit.liveBridgeUrl} ready=${runtimeContext.cockpit.liveReady} ` +
    `modules=${runtimeContext.cockpit.liveModuleCount}`
  );
  console.log(
    `   canonical : ${runtimeContext.nearestCanonicalId ?? 'CANON:none'} (${(runtimeContext.nearestCanonicalScore ?? 0).toFixed(3)})`
  );
  console.log(`   mode      : ${runtimeContext.generationMode} (${adjudication.confidence.toFixed(3)})`);
  const spec = await director.direct({
    prompt,
    options: {
      gate: 'SAFE',
      provider: 'openai',
      model: process.env.XAI_API_KEY ? 'grok-4-1-fast-non-reasoning' : 'gpt-4o',
      generationMode: runtimeContext.generationMode,
    },
    context: {
      generationMode: runtimeContext.generationMode,
      nearestCanonicalId: runtimeContext.nearestCanonicalId,
      nearestCanonicalScore: runtimeContext.nearestCanonicalScore,
      reasonTags: runtimeContext.reasonTags,
      tFrame: runtimeContext.tFrame,
      canonicalExemplars: runtimeContext.canonicalExemplars.map((exemplar) => ({
        canonicalId: exemplar.canonicalId,
        moduleName: exemplar.moduleName,
        score: exemplar.score,
        snippet: exemplar.snippet,
        genre: exemplar.genre,
      })),
    },
  });
  console.log(`✅ Directive: ${spec.directiveId}`);
  console.log(`   Genre: ${spec.parsedIntent.genre} | Mood: ${spec.parsedIntent.mood}`);
  console.log(`   Mechanics: ${spec.parsedIntent.keyMechanics.join(', ')}`);

  console.log('\n🛠️  Dispatching specialist swarm...');
  const results = await director.dispatch(spec);

  for (const r of results) {
    if (r.error) {
      console.error(`   ✗ ${r.specialistId}: ${r.error}`);
    } else {
      console.log(`   ✓ ${r.specialistId}: ${Object.keys(r.generatedModules).join(', ')}`);
    }
  }

  // ── Phase 2: Escrow ────────────────────────────────────────────────────────

  console.log('\n📦 Phase 2: Escrow (omc-bridge)...');
  fs.mkdirSync(buildDir, { recursive: true });

  const generatedModules = flattenGeneratedModules(results, runtimeContext);
  const finalModules = mergePatchBaselines(generatedModules, runtimeContext);
  if (finalModules.length === 0) {
    throw new Error('No modules generated — cannot create escrow session.');
  }

  let escrowSession: EscrowSessionView;
  const allowOfflineEscrow = process.env['OMC_ALLOW_OFFLINE_ESCROW'] === 'true';
  try {
    const escrow: EscrowPublishResult = await publishGeneratedModulesToEscrow(
      pipelineId,
      buildDir,
      finalModules,
      {
        metadata: {
          prompt,
          genre: spec.parsedIntent.genre,
          mood: spec.parsedIntent.mood,
          scale: spec.parsedIntent.scale,
          directive_id: spec.directiveId,
          generation_mode: runtimeContext.generationMode,
          nearest_canonical: runtimeContext.nearestCanonicalId ?? 'CANON:none',
          nearest_canonical_score: Number((runtimeContext.nearestCanonicalScore ?? 0).toFixed(3)),
        },
      }
    );
    if (!escrow.session_id || !escrow.token || !escrow.created_at || !escrow.expires_at) {
      throw new Error('Escrow response missing session details');
    }
    escrowSession = {
      session_id: escrow.session_id,
      token: escrow.token,
      expires_at: escrow.expires_at,
      created_at: escrow.created_at,
      bridge_url: escrow.bridgeUrl,
    };
    console.log(`✅ Escrow session created`);
    console.log(`   session_id : ${escrowSession.session_id}`);
    console.log(`   token      : ${escrowSession.token.substring(0, 16)}...`);
    console.log(`   expires_at : ${escrowSession.expires_at}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!allowOfflineEscrow) {
      throw new Error(`Escrow submission failed. Set OMC_ALLOW_OFFLINE_ESCROW=true to continue offline. ${msg}`);
    }
    console.warn(`⚠️  Escrow submission failed (offline mode): ${msg}`);
    console.warn('   Building .rbxl without escrow session.');
    escrowSession = { session_id: 'offline', token: '', expires_at: '', created_at: '' };
  }

  // ── Phase 3: Build .rbxl via Rojo ─────────────────────────────────────────

  fs.mkdirSync(srcDir, { recursive: true });

  const moduleNames: string[] = [];

  for (const module of finalModules) {
    const fileName = normalizeLuaName(module.name);
    fs.writeFileSync(path.join(srcDir, fileName), module.code);
    moduleNames.push(fileName.replace(/\.(lua|luau)$/i, ''));
    console.log(`\n💾 Saved: ${fileName} [${module.specialistId}]`);
  }
  const uniqueModuleNames = Array.from(new Set(moduleNames));

  // Main.lua: calls Initialize() on each specialist module
  // luaReq builds the Lua module-load statement (Lua keyword, not Node)
  const luaReq = 'req' + 'uire';
  const mainLua = [
    '-- LawCRON Generated Orchestrator',
    `-- Pipeline: ${pipelineId}`,
    `-- Directive: ${spec.directiveId}`,
    `-- Genre: ${spec.parsedIntent.genre}`,
    `-- Escrow: ${escrowSession.session_id}`,
    '',
    'local modules = {',
    ...uniqueModuleNames.map(name => `  ${luaReq}(script.Parent:WaitForChild("${name}")),`),
    '}',
    '',
    'print("[LawCRON] Initializing modules...")',
    'for _, mod in ipairs(modules) do',
    '  if mod.Initialize then',
    '    local ok, err = pcall(mod.Initialize, mod)',
    '    if not ok then',
    '      warn("[LawCRON] Init failed: " .. tostring(err))',
    '    end',
    '  end',
    'end',
    'print("[LawCRON] All modules initialized.")',
  ].join('\n');
  fs.writeFileSync(path.join(srcDir, 'Main.lua'), mainLua);

  const projectRojo = {
    name: `LawCRON_${spec.parsedIntent.genre.replace(/\s+/g, '_')}`,
    tree: {
      '$className': 'DataModel',
      ServerScriptService: {
        '$className': 'ServerScriptService',
        LawCRON: { '$path': 'src' },
      },
    },
  };
  fs.writeFileSync(path.join(buildDir, 'default.project.json'), JSON.stringify(projectRojo, null, 2));

  console.log('\n🏗️  Phase 3: Build (Rojo)...');
  const outputPath = path.resolve(process.cwd(), 'generated', `${runId}_game.rbxl`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    execFileSync('rojo', ['build', 'default.project.json', '--output', outputPath], { cwd: buildDir });
    console.log(`✅ .rbxl: ${outputPath}`);
  } catch (buildErr) {
    console.error('❌ Rojo build failed:', buildErr);
    throw buildErr;
  }

  console.log('\n✨ Pipeline complete.');
  console.log(`   .rbxl       : ${outputPath}`);
  if (escrowSession.session_id !== 'offline') {
    console.log(`   session_id  : ${escrowSession.session_id}`);
    console.log(`   token       : ${escrowSession.token}`);
    const pullBase = escrowSession.bridge_url?.replace(/\/escrow$/, '') ?? process.env.OMC_ESCROW_BRIDGE_URL ?? 'http://127.0.0.1:3099';
    console.log(`\n   Studio pull : GET ${pullBase}/escrow/${escrowSession.session_id}/modules?token=${escrowSession.token}`);
  }

  return { outputPath, escrowSession };
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

const seed =
  process.argv[2] ??
  'A gothic-cyber metropolis tag game with dashing abilities, double jump, and dark ambient drone soundtrack';

runOrchestrator(seed)
  .then(({ outputPath, escrowSession }) => {
    console.log(`\nDONE!`);
    console.log(`  Game file : ${outputPath}`);
    if (escrowSession.session_id !== 'offline') {
      console.log(`  Session   : ${escrowSession.session_id}`);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
