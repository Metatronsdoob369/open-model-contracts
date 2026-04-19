/**
 * Research index helper for b0t.
 * Scans notes/research/pdf and notes/research/summaries to emit index.jsonl rows.
 * Optional embedding via EMBED_URL (expects 3072-d vector).
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PDF_DIR = path.join(ROOT, 'notes', 'research', 'pdf');
const SUM_DIR = path.join(ROOT, 'notes', 'research', 'summaries');
const INDEX_PATH = path.join(ROOT, 'notes', 'research', 'index.jsonl');
const EMBED_URL = process.env.EMBED_URL; // optional

type Row = {
  id: string;
  title: string;
  source?: string;
  tags?: string[];
  pdf_path?: string;
  summary_path?: string;
  checksum?: string;
  embedding?: number[];
};

async function embed(text: string): Promise<number[] | undefined> {
  if (!EMBED_URL) return undefined;
  const resp = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error(`Embed HTTP ${resp.status}`);
  const data = (await resp.json()) as { embedding?: number[] };
  if (!data.embedding || data.embedding.length !== 3072) {
    throw new Error(`Embedder returned ${data.embedding?.length ?? 0} dims (expected 3072)`);
  }
  return data.embedding;
}

function sha1(filePath: string): string {
  const crypto = require('crypto');
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function main() {
  const rows: Row[] = [];

  const pdfs = fs.existsSync(PDF_DIR) ? fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf')) : [];
  const sums = fs.existsSync(SUM_DIR) ? fs.readdirSync(SUM_DIR).filter(f => f.endsWith('.md')) : [];

  for (const pdf of pdfs) {
    const id = path.parse(pdf).name;
    const summary = sums.find(s => path.parse(s).name === id);
    const pdfPath = path.join('notes', 'research', 'pdf', pdf);
    const sumPath = summary ? path.join('notes', 'research', 'summaries', summary) : undefined;

    const row: Row = {
      id,
      title: id.replace(/[-_]/g, ' '),
      pdf_path: pdfPath,
      summary_path: sumPath,
      checksum: sha1(path.join(ROOT, pdfPath)),
    };

    if (sumPath) {
      const text = fs.readFileSync(path.join(ROOT, sumPath), 'utf-8');
      row.tags = Array.from(new Set((text.match(/#[A-Za-z0-9_-]+/g) || []).map(t => t.slice(1))));
      if (EMBED_URL) {
        try {
          row.embedding = await embed(text);
        } catch (e) {
          console.warn(`Embed failed for ${id}: ${(e as Error).message}`);
        }
      }
    }

    rows.push(row);
  }

  fs.writeFileSync(INDEX_PATH, rows.map(r => JSON.stringify(r)).join('\n'));
  console.log(`Indexed ${rows.length} entries → ${INDEX_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
