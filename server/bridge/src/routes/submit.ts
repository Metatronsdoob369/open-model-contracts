/**
 * OMC Bridge — Marsh Submit Route
 * POST /submit
 *
 * Allows Marsh's Claude Code to push game files without touching git directly.
 * Accepts file contents, writes them to disk, branches, commits, and pushes.
 *
 * Body: { author: string, intent: string, files: { path: string, content: string }[] }
 */

import { Router, type Request, type Response } from 'express';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { writeAuditRecord } from '../audit-logger';
import { requireApiKey, verifyHmac } from '../submit-auth';

const router = Router();

// Auth gates on all mutating submit endpoints
router.use(requireApiKey);
router.use(verifyHmac);

// Repo root is two levels up from server/bridge/src/routes/
const REPO_ROOT = resolve(__dirname, '../../../../');

// Only allow writes inside these directories
const ALLOWED_PREFIXES = ['src/server/', 'src/client/', 'generated/'];

function isSafeTarget(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

router.post('/', async (req: Request, res: Response) => {
  const ip = req.ip ?? 'unknown';
  const { author, intent, files } = req.body as {
    author?: string;
    intent?: string;
    files?: { path: string; content: string }[];
  };

  if (!author || !intent || !Array.isArray(files) || files.length === 0) {
    res.status(400).json({
      error: 'Missing required fields: author, intent, files[]',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Validate all paths before writing anything
  const badPaths = files.filter((f) => !isSafeTarget(f.path));
  if (badPaths.length > 0) {
    res.status(403).json({
      error: 'Path outside allowed directories (src/server, src/client, generated)',
      code: 'UNSAFE_PATH',
      paths: badPaths.map((f) => f.path),
    });
    return;
  }

  try {
    // Write files to disk
    for (const file of files) {
      const absPath = join(REPO_ROOT, file.path.replace(/^\/+/, ''));
      mkdirSync(dirname(absPath), { recursive: true });
      writeFileSync(absPath, file.content, 'utf8');
    }

    // Create branch, commit, push
    const slug = author.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const branch = `feat/${slug}-${timestamp}`;
    const token = Math.random().toString(36).slice(2, 10);

    const filePaths = files.map((f) => f.path.replace(/^\/+/, '')).join(' ');

    execSync(`git -C "${REPO_ROOT}" checkout main`, { stdio: 'pipe' });
    execSync(`git -C "${REPO_ROOT}" pull origin main --rebase`, { stdio: 'pipe' });
    execSync(`git -C "${REPO_ROOT}" checkout -b "${branch}"`, { stdio: 'pipe' });
    execSync(`git -C "${REPO_ROOT}" add ${filePaths}`, { stdio: 'pipe' });
    execSync(
      `git -C "${REPO_ROOT}" commit -m "feat(${slug}): ${intent}\n\nOMC-Sync-Token: ${token}\nCanonical-Validation: Pending-CI"`,
      { stdio: 'pipe' }
    );
    execSync(`git -C "${REPO_ROOT}" push origin "${branch}" --set-upstream`, { stdio: 'pipe' });

    writeAuditRecord({
      timestamp: new Date().toISOString(),
      event_type: 'submit.success',
      ip_address: ip,
      detail: `author=${author} branch=${branch} files=${files.length} intent=${intent}`,
    });

    res.status(201).json({
      ok: true,
      branch,
      files_written: files.length,
      pr_url: `https://github.com/Metatronsdoob369/open-model-contracts/compare/${branch}?expand=1`,
      message: `Submitted. CI is running. PR auto-opens — check the link above.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    writeAuditRecord({
      timestamp: new Date().toISOString(),
      event_type: 'submit.error',
      ip_address: ip,
      detail: message,
    });
    res.status(500).json({ error: 'Submit failed', detail: message, code: 'SUBMIT_ERROR' });
  }
});

// GET /submit/status — quick health check for Marsh's MCP
router.get('/status', (_req, res) => {
  try {
    const branch = execSync(`git -C "${REPO_ROOT}" branch --show-current`, { stdio: 'pipe' })
      .toString()
      .trim();
    const lastCommit = execSync(`git -C "${REPO_ROOT}" log -1 --oneline`, { stdio: 'pipe' })
      .toString()
      .trim();
    res.json({ ok: true, branch, last_commit: lastCommit });
  } catch {
    res.json({ ok: false });
  }
});

export default router;
