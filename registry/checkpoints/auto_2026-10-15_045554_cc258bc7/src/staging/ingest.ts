/**
 * src/staging/ingest.ts
 *
 * Staging area ingestion layer.
 * Accepts raw input (code string, file path, or free text) and normalizes
 * it into a StagedInput ready for embedding and shatter mapping.
 */

import fs from 'fs';
import path from 'path';

export type InputKind = 'luau' | 'text' | 'json' | 'jsonl' | 'unknown';

export interface StagedInput {
  id: string;
  kind: InputKind;
  source: string;        // file path or 'inline'
  raw: string;
  byteSize: number;
  ingestedAt: number;
}

function detectKind(source: string, content: string): InputKind {
  if (source.endsWith('.lua') || source.endsWith('.luau')) return 'luau';
  if (source.endsWith('.json')) return 'json';
  if (source.endsWith('.jsonl')) return 'jsonl';
  if (source === 'inline') {
    // Heuristic: Luau code has these patterns
    if (/local\s+\w+|function\s+\w+|game:|workspace\./m.test(content)) return 'luau';
    try { JSON.parse(content); return 'json'; } catch {}
    return 'text';
  }
  return 'unknown';
}

function generateId(source: string): string {
  const base = path.basename(source, path.extname(source)).replace(/[^a-zA-Z0-9]/g, '_');
  return `staged_${base}_${Date.now()}`;
}

/**
 * Ingest a file from disk.
 */
export function ingestFile(filePath: string): StagedInput {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`[ingest] File not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf-8');
  const kind = detectKind(resolved, raw);
  return {
    id: generateId(resolved),
    kind,
    source: resolved,
    raw,
    byteSize: Buffer.byteLength(raw, 'utf-8'),
    ingestedAt: Date.now(),
  };
}

/**
 * Ingest a raw string (inline code or text).
 */
export function ingestInline(content: string, hint?: InputKind): StagedInput {
  const kind = hint ?? detectKind('inline', content);
  return {
    id: generateId('inline'),
    kind,
    source: 'inline',
    raw: content,
    byteSize: Buffer.byteLength(content, 'utf-8'),
    ingestedAt: Date.now(),
  };
}

/**
 * Ingest a JSONL file, returning one StagedInput per line.
 */
export function ingestJsonl(filePath: string): StagedInput[] {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`[ingest] File not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim().length > 0);
  
  return lines.map((line, i) => {
    return {
      id: `${generateId(resolved)}_l${i}`,
      kind: 'jsonl',
      source: `${resolved}:${i+1}`,
      raw: line,
      byteSize: Buffer.byteLength(line, 'utf-8'),
      ingestedAt: Date.now(),
    };
  });
}

/**
 * Ingest all files in a directory (non-recursive, .lua/.luau/.ts).
 */
export function ingestDirectory(dirPath: string): StagedInput[] {
  const resolved = path.resolve(dirPath);
  const allowed = new Set(['.lua', '.luau', '.ts', '.json', '.jsonl', '.txt', '.md']);
  const files = fs.readdirSync(resolved)
    .filter(f => allowed.has(path.extname(f)))
    .map(f => path.join(resolved, f));

  return files.flatMap(f => {
    if (f.endsWith('.jsonl')) return ingestJsonl(f);
    return [ingestFile(f)];
  });
}
