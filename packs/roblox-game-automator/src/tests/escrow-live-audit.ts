import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface LatestResponse {
  ready: boolean;
  session_id: string | null;
  token: string | null;
  created_at: string | null;
  expires_at: string | null;
  pipeline_id: string | null;
  pack_id: string | null;
  pack_version: string | null;
}

interface ModuleEntry {
  module_id: string;
  name: string;
  content: string;
  sha256: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRIDGE_URL = (process.env.OMC_BRIDGE_URL ?? 'http://127.0.0.1:3099').replace(/\/+$/, '');
const POLL_MS = Number.parseInt(process.env.OMC_AUDIT_POLL_MS ?? '2000', 10);
const OUT_DIR = path.resolve(__dirname, '../../generated/live-audits');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeModuleFlags(code: string, moduleName: string): string[] {
  const flags: string[] = [];
  const lower = moduleName.toLowerCase();

  if (/loadstring\(/.test(code)) flags.push('dynamic_exec_loadstring');
  if (/HttpService\s*:\s*GetAsync\(/.test(code) || /https?:\/\//.test(code)) flags.push('external_http_dependency');
  if (!lower.includes('client') && /Players\.LocalPlayer/.test(code)) flags.push('client_api_in_server_module');
  if (/agsValue\./.test(code)) flags.push('probable_typo_agsValue');
  if (/PlatformStand\s*=\s*true/.test(code)) flags.push('forces_platformstand');
  if (/SpawnLocation[\s\S]{0,240}Vector3\.new\(0,\s*1,\s*0\)/.test(code)) flags.push('spawn_origin_overlap_risk');

  return flags;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  let seen = '';

  console.log(`[live-audit] bridge=${BRIDGE_URL} poll_ms=${POLL_MS}`);

  while (true) {
    try {
      const latest = await getJson<LatestResponse>(`${BRIDGE_URL}/escrow/latest`);
      if (!latest.ready || !latest.session_id || !latest.token) {
        await sleep(POLL_MS);
        continue;
      }

      if (latest.session_id === seen) {
        await sleep(POLL_MS);
        continue;
      }

      seen = latest.session_id;
      const modulesResponse = await getJson<{ session_id: string; modules: ModuleEntry[] }>(
        `${BRIDGE_URL}/escrow/${latest.session_id}/modules?token=${encodeURIComponent(latest.token)}`
      );

      const audits = modulesResponse.modules.map((m) => {
        const code = Buffer.from(m.content, 'base64').toString('utf8');
        const lines = code.split(/\r?\n/).length;
        const flags = decodeModuleFlags(code, m.name);
        return {
          module_id: m.module_id,
          name: m.name,
          sha256: m.sha256,
          lines,
          flags,
          preview: code.slice(0, 300),
        };
      });

      const out = {
        generated_at: new Date().toISOString(),
        bridge_url: BRIDGE_URL,
        session_id: latest.session_id,
        pipeline_id: latest.pipeline_id,
        pack_id: latest.pack_id,
        module_count: audits.length,
        flagged_count: audits.filter((a) => a.flags.length > 0).length,
        modules: audits,
      };

      const outPath = path.join(OUT_DIR, `${latest.session_id}.json`);
      writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

      console.log(`[live-audit] session=${latest.session_id.slice(0, 8)} modules=${audits.length} flagged=${out.flagged_count}`);
      console.log(`[live-audit] report=${outPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[live-audit] ${message}`);
    }

    await sleep(POLL_MS);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[live-audit] fatal\n${message}`);
  process.exit(1);
});
