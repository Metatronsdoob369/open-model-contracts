import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { DirectorInput } from '../../domains/roblox/director-contract.js';
import {
  selectCanonicalExemplars,
  type CanonicalSelectionResult,
  type TemporalFrame,
} from './canonical-selector.js';
import {
  adjudicateGenerationPlan,
  type AdjudicationDecision,
} from './adjudication.js';

export interface RuntimeGenerationContext {
  generationMode: 'full' | 'patch';
  nearestCanonicalId?: string;
  nearestCanonicalScore?: number;
  reasonTags: string[];
  tFrame: TemporalFrame;
  canonicalExemplars: Array<{
    canonicalId: string;
    moduleName: string;
    score: number;
    snippet: string;
    genre: string;
    code: string;
  }>;
  cockpit: NonNullable<DirectorInput['context']>['cockpit'];
}

export interface EnforcedCockpitResult {
  runtimeContext: RuntimeGenerationContext;
  canonicalSelection: CanonicalSelectionResult;
  adjudication: AdjudicationDecision;
}

interface BridgeLatest {
  ready: boolean;
  session_id: string | null;
  token: string | null;
}

interface BridgeModules {
  modules?: Array<unknown>;
}

function countMatches(text: string, pattern: RegExp): number {
  const m = text.match(pattern);
  return m ? m.length : 0;
}

function canonFlags(code: string): string[] {
  const flags: string[] = [];
  if (/loadstring\(/.test(code)) flags.push('dynamic_exec_loadstring');
  if (/HttpService\s*:\s*GetAsync\(/.test(code) || /https?:\/\//.test(code)) flags.push('external_http_dependency');
  if (/Players\.LocalPlayer/.test(code)) flags.push('client_only_api_usage');
  if (/agsValue\./.test(code)) flags.push('probable_typo_agsValue');
  if (/PlatformStand\s*=\s*true/.test(code)) flags.push('forces_platformstand');
  if (/SpawnLocation[\s\S]{0,240}Vector3\.new\(0,\s*1,\s*0\)/.test(code)) flags.push('spawn_origin_overlap_risk');
  return flags;
}

function buildCanonicalAuditReport(rootDir: string): { reportPath: string; fileCount: number; flaggedCount: number } {
  const canonicalDir = path.resolve(rootDir, 'src/canonical');
  const outDir = path.resolve(rootDir, 'packs/roblox-game-automator/generated/canonical-audits');

  const files = readdirSync(canonicalDir).filter((name) => name.endsWith('.lua') || name.endsWith('.luau'));
  const audits = files.map((file) => {
    const absPath = path.join(canonicalDir, file);
    const code = readFileSync(absPath, 'utf8');
    const flags = canonFlags(code);
    return {
      file,
      lines: code.split(/\r?\n/).length,
      functionCount: countMatches(code, /\bfunction\b/g),
      flags,
    };
  });

  const flaggedCount = audits.filter((a) => a.flags.length > 0).length;
  mkdirSync(outDir, { recursive: true });

  const reportPath = path.join(outDir, 'latest.json');
  const report = {
    generated_at: new Date().toISOString(),
    canonical_dir: canonicalDir,
    file_count: audits.length,
    flagged_count: flaggedCount,
    audits,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  return { reportPath, fileCount: audits.length, flaggedCount };
}

async function fetchBridgeSnapshot(rootDir: string): Promise<{
  bridgeUrl: string;
  liveReady: boolean;
  liveSessionId?: string;
  liveModuleCount: number;
}> {
  const raw = process.env['OMC_BRIDGE_URL'] ?? 'http://127.0.0.1:3099';
  const bridgeUrl = raw.replace(/\/+$/, '');

  const outDir = path.resolve(rootDir, 'packs/roblox-game-automator/generated/live-audits');
  mkdirSync(outDir, { recursive: true });

  try {
    const latestRes = await fetch(`${bridgeUrl}/escrow/latest`);
    if (!latestRes.ok) {
      throw new Error(`latest status=${latestRes.status}`);
    }

    const latest = (await latestRes.json()) as BridgeLatest;
    if (!latest.ready || !latest.session_id || !latest.token) {
      return { bridgeUrl, liveReady: false, liveModuleCount: 0 };
    }

    const modsRes = await fetch(
      `${bridgeUrl}/escrow/${latest.session_id}/modules?token=${encodeURIComponent(latest.token)}`
    );
    if (!modsRes.ok) {
      throw new Error(`modules status=${modsRes.status}`);
    }

    const mods = (await modsRes.json()) as BridgeModules;
    const liveModuleCount = Array.isArray(mods.modules) ? mods.modules.length : 0;

    const snapshotPath = path.join(outDir, 'cockpit-latest.json');
    writeFileSync(
      snapshotPath,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          bridge_url: bridgeUrl,
          ready: true,
          session_id: latest.session_id,
          module_count: liveModuleCount,
        },
        null,
        2
      ),
      'utf8'
    );

    return {
      bridgeUrl,
      liveReady: true,
      liveSessionId: latest.session_id,
      liveModuleCount,
    };
  } catch {
    return { bridgeUrl, liveReady: false, liveModuleCount: 0 };
  }
}

export async function buildEnforcedDirectorContext(prompt: string): Promise<EnforcedCockpitResult> {
  const rootDir = path.resolve(__dirname, '../../../../..');
  const canonicalSelection = selectCanonicalExemplars(prompt, {
    topK: 3,
    minScore: 0.05,
    tFrame: 't_start',
  });
  const adjudication = adjudicateGenerationPlan(prompt, canonicalSelection);

  const canonReport = buildCanonicalAuditReport(rootDir);
  const bridgeSnapshot = await fetchBridgeSnapshot(rootDir);

  const runtimeContext: RuntimeGenerationContext = {
    generationMode: adjudication.mode,
    nearestCanonicalId: adjudication.nearestCanonicalId,
    nearestCanonicalScore: adjudication.nearestCanonicalScore,
    reasonTags: adjudication.reasonTags,
    tFrame: adjudication.tFrame,
    canonicalExemplars: canonicalSelection.exemplars.map((exemplar) => ({
      canonicalId: exemplar.canonicalId,
      moduleName: exemplar.moduleName,
      score: exemplar.score,
      snippet: exemplar.snippet,
      genre: exemplar.genre,
      code: exemplar.code,
    })),
    cockpit: {
      enforced: true,
      collectedAt: new Date().toISOString(),
      canonReportPath: canonReport.reportPath,
      canonFileCount: canonReport.fileCount,
      canonFlaggedCount: canonReport.flaggedCount,
      liveBridgeUrl: bridgeSnapshot.bridgeUrl,
      liveReady: bridgeSnapshot.liveReady,
      liveSessionId: bridgeSnapshot.liveSessionId,
      liveModuleCount: bridgeSnapshot.liveModuleCount,
    },
  };

  return {
    runtimeContext,
    canonicalSelection,
    adjudication,
  };
}
