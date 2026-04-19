import fs from 'fs';
import path from 'path';
import https from 'https';

const DOCS_DIR = '/Users/joewales/.claude/.firecrawl/superbullet-docs';
const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'spectral-heatmap';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getEmbedding(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      input: text.substring(0, 8000),
      model: 'text-embedding-3-large'
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.data[0].embedding);
        } catch (e) {
          reject(new Error(`Embedding failed: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function readDocFiles(): Promise<{ id: number; content: string; file: string }[]> {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  const docs = [];

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const num = parseInt(file.replace('.md', '').split('-')[0]);
    docs.push({
      id: 1000 + num, // Use integer IDs
      content,
      file
    });
    console.log(`  Read: ${file} (${content.length} chars)`);
  }

  return docs;
}

async function embedAndUpsert(docs: { id: number; content: string; file: string }[]) {
  const points = [];

  console.log(`\nGenerating embeddings for ${docs.length} doc files...`);

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    try {
      console.log(`  Embedding: ${doc.file}...`);
      const embedding = await getEmbedding(doc.content);

      points.push({
        id: doc.id,
        vector: embedding,
        payload: {
          file: doc.file,
          kind: 'doc',
          genre: 'roblox-canonical',
          content: doc.content.substring(0, 2000),
          position3d: null, // Will be computed via PCA later
          heat: 0,
          shatter: 0,
          sectorScores: [1, 1, 1, 1, 1, 1],
          nearestCanonical: null,
          deltaVector3d: null,
          deltaTarget: null
        }
      });
    } catch (err) {
      console.error(`  Error embedding ${doc.file}: ${err.message}`);
    }
  }

  if (points.length === 0) {
    console.error('No points to upsert');
    return;
  }

  const data = JSON.stringify({ points });

  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: data
  });

  if (response.ok) {
    console.log(`\nIndexed ${points.length} doc files into Qdrant`);
  } else {
    console.error(`Upsert failed: ${response.statusText}`);
    const text = await response.text();
    console.error(text);
  }
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  console.log('=== Embedding Roblox Canonical Docs ===\n');

  const docs = await readDocFiles();
  await embedAndUpsert(docs);

  console.log('\n=== Complete ===');
  console.log('Docs are now in Qdrant. Run PCA to compute 3D positions.');
}

main().catch(console.error);
