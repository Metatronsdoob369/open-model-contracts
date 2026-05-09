import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

/**
 * METROPOLIS LAB: SHATTER ORCHESTRATOR
 * 
 * Logic: 
 * 1. Read files from lab/canonical-legacy
 * 2. Segment them based on logic blocks or function boundaries
 * 3. Save as individual shards with unique fingerprints
 */

const CANONICAL_DIR = path.resolve(process.cwd(), 'lab/canonical-legacy');
const SHATTER_DIR = path.resolve(process.cwd(), 'lab/shatter-zone');

async function shatterSource() {
    console.log("💎 [CRONOS] Starting Shatter Operation...");

    if (!fs.existsSync(CANONICAL_DIR)) {
        console.error("❌ Canonical legacy folder missing.");
        return;
    }

    const files = fs.readdirSync(CANONICAL_DIR).filter(f => 
        f.endsWith('.ts') || 
        f.endsWith('.lua') || 
        f.endsWith('.yaml') || 
        f.endsWith('.yml')
    );

    if (files.length === 0) {
        console.log("⚠️ No legacy source found in /canonical-legacy. Waiting for ingestion...");
        console.log(`🔍 Checked: ${CANONICAL_DIR}`);
        return;
    }

    for (const file of files) {
        const filePath = path.join(CANONICAL_DIR, file);
        const code = fs.readFileSync(filePath, 'utf-8');
        
        console.log(`📡 Shattering: ${file}...`);

        // Fragment by code blocks (functions) or YAML blocks (id:, info:)
        const shards = code.split(/-- \[\[SHATTER_POINT\]\]|\/\* SHATTER_POINT \*\/|function|id:|info:/);

        shards.forEach((content, index) => {
            if (content.trim().length < 20) return; // Skip empty/thin shards

            const shardId = `SHARD_${randomBytes(4).toString('hex')}`;
            const shardName = `${path.basename(file, path.extname(file))}_${shardId}.${path.extname(file).substring(1)}`;
            const shardPath = path.join(SHATTER_DIR, shardName);

            fs.writeFileSync(shardPath, `-- [[OMC_SHARD]]\n-- Source: ${file}\n-- ShardIndex: ${index}\n\n${content}`);
            console.log(`   ✅ Manifested: ${shardName}`);
        });
    }

    console.log("💎 [CRONOS] Shatter Operation Complete. Shards ready for mapping.");
}

shatterSource().catch(console.error);
