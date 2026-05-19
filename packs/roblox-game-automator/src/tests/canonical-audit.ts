import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface ModuleAudit {
  file: string;
  lines: number;
  functionCount: number;
  flags: string[];
  signals: {
    hasSpawn: boolean;
    hasMobility: boolean;
    hasRoundLoop: boolean;
    hasTagLogic: boolean;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANON_DIR = process.env.OMC_CANON_DIR ?? path.resolve(__dirname, '../../../../src/canonical');
const OUT_DIR = path.resolve(__dirname, '../../generated/canonical-audits');

function listCanonFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.lua') || name.endsWith('.luau'))
    .map((name) => path.join(dir, name));
}

function countMatches(text: string, pattern: RegExp): number {
  const m = text.match(pattern);
  return m ? m.length : 0;
}

function auditFile(absPath: string): ModuleAudit {
  const code = readFileSync(absPath, 'utf8');
  const lines = code.split(/\r?\n/).length;

  const flags: string[] = [];
  if (/loadstring\(/.test(code)) flags.push('dynamic_exec_loadstring');
  if (/HttpService\s*:\s*GetAsync\(/.test(code) || /https?:\/\//.test(code)) flags.push('external_http_dependency');
  if (/Players\.LocalPlayer/.test(code)) flags.push('client_only_api_usage');
  if (/agsValue\./.test(code)) flags.push('probable_typo_agsValue');
  if (/PlatformStand\s*=\s*true/.test(code)) flags.push('forces_platformstand');
  if (/SpawnLocation[\s\S]{0,240}Vector3\.new\(0,\s*1,\s*0\)/.test(code)) flags.push('spawn_origin_overlap_risk');

  const hasSpawn = /SpawnLocation|CharacterAdded|LoadCharacter/.test(code);
  const hasMobility = /Jump|WalkSpeed|HumanoidStateType|PlatformStand|HumanoidRootPart/.test(code);
  const hasRoundLoop = /Heartbeat|while\s+true|task\.wait\(|for\s+_,\s*player\s+in\s+ipairs\(Players:GetPlayers\(\)\)/.test(code);
  const hasTagLogic = /tag|Tag|Score|leaderstats/.test(code);

  return {
    file: path.basename(absPath),
    lines,
    functionCount: countMatches(code, /\bfunction\b/g),
    flags,
    signals: {
      hasSpawn,
      hasMobility,
      hasRoundLoop,
      hasTagLogic,
    },
  };
}

function main(): void {
  const files = listCanonFiles(CANON_DIR);
  const audits = files.map(auditFile);

  const flagged = audits.filter((a) => a.flags.length > 0);
  const report = {
    generated_at: new Date().toISOString(),
    canonical_dir: CANON_DIR,
    file_count: audits.length,
    flagged_count: flagged.length,
    audits,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, 'latest.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[canon-audit] files=${audits.length} flagged=${flagged.length}`);
  for (const a of audits) {
    const f = a.flags.length > 0 ? a.flags.join(',') : 'none';
    console.log(`[canon-audit] ${a.file} lines=${a.lines} functions=${a.functionCount} flags=${f}`);
  }
  console.log(`[canon-audit] report=${outPath}`);
}

main();
