import http from 'http';
import fs from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Modular Services
import { SpectraMappingService } from '../popsim-contract/src/core/spectra-mapping.js';
import { graph } from '../src/canonical/QuadMap.js';

const execAsync = promisify(exec);
const PORT = 3100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project Directories
const VAMPIRE_DIR = path.resolve(process.cwd(), 'generated/vampire_drops');
const CANONICAL_DIR = path.resolve(process.cwd(), 'src/canonical');
const PROCESSED_DIR = path.resolve(process.cwd(), 'incoming/processed');

const spectra = new SpectraMappingService();

/**
 * 3072-D Spectral Mapping Cache
 */
let spectralCache: { points: any[]; avgShatter: number; mtimeKey: string } | null = null;

async function getSpectralPoints(scriptsToMap: { id: string; code: string; mtime: number }[]): Promise<{ points: any[]; avgShatter: number }> {
    const mtimeKey = scriptsToMap.map(s => `${s.id}:${s.mtime}`).join('|');
    if (spectralCache && spectralCache.mtimeKey === mtimeKey) {
        return { points: spectralCache.points, avgShatter: spectralCache.avgShatter };
    }
    try {
        const points = await spectra.mapBatch(scriptsToMap.map(s => ({ id: s.id, code: s.code })));
        const avgShatter = points.reduce((acc, p) => acc + (p.overallShatter || 0), 0) / (points.length || 1);
        spectralCache = { points, avgShatter, mtimeKey };
        return { points, avgShatter };
    } catch (e) {
        console.error('[SPECTRA] Mapping failed:', e);
        return { points: [], avgShatter: 0 };
    }
}

/**
 * Telemetry Aggregator
 */
async function getTelemetry() {
    let vampireDrains: any[] = [];
    try {
        if (existsSync(VAMPIRE_DIR)) {
            const files = await fs.readdir(VAMPIRE_DIR);
            for (const file of files.filter(f => f.endsWith('.json'))) {
                const content = await fs.readFile(path.join(VAMPIRE_DIR, file), 'utf-8');
                const data = JSON.parse(content);
                vampireDrains.push({
                    id: file,
                    name: data.metadata?.source || file,
                    time: data.metadata?.timestamp || new Date(),
                    nodes: data.structural_dna?.ast_node_count || 0,
                    overallShatter: (data.structural_dna?.shatter_index || 0)
                });
            }
        }
    } catch (e) {}

    let scriptsToMap: { id: string; code: string; mtime: number }[] = [];
    try {
        if (existsSync(CANONICAL_DIR)) {
            const canonicalFiles = await fs.readdir(CANONICAL_DIR);
            for (const file of canonicalFiles.filter(f => f.endsWith('.lua'))) {
                const filePath = path.join(CANONICAL_DIR, file);
                const stat = await fs.stat(filePath);
                const code = readFileSync(filePath, 'utf-8');
                scriptsToMap.push({ id: file, code, mtime: stat.mtimeMs });
            }
        }
    } catch (e) {}

    let realPoints: any[] = [];
    let avgShatter = 0.5;

    if (scriptsToMap.length > 0) {
        const result = await getSpectralPoints(scriptsToMap);
        realPoints = result.points;
        avgShatter = result.avgShatter;
    }

    // 💎 [Fail-Safe Seeds] 💎
    if (realPoints.length === 0) {
        realPoints = [
            { id: 'SEED_CENTROID', room: 'WorldState', spatialEmbedding: [0.1, 0.4, 0.2], overallShatter: 0.15, heat: 0.1, temporalSignatures: [{ shatterVelocity: 0.05, phase: 'STABLE' }] },
            { id: 'SEED_ANOMALY', room: 'Client_Visual', spatialEmbedding: [0.8, -0.2, 0.7], overallShatter: 0.95, heat: 0.8, temporalSignatures: [{ shatterVelocity: 0.96, phase: 'BREACH' }] }
        ];
    }

    return {
        vampireDrains: vampireDrains.slice(0, 15),
        spectralReport: realPoints,
        avgShatter: parseFloat(avgShatter.toFixed(2))
    };
}

/**
 * 💎 METROPOLIS SERVER 💎
 */
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 🛡️ Multi-Portal View Routing 🛡️
    const routes: Record<string, string> = {
        '/': 'views/orchestrator.html',
        '/index.html': 'views/orchestrator.html',
        '/nexus.html': 'views/orchestrator.html',
    };

    if (routes[req.url || '/']) {
        const viewPath = path.join(__dirname, routes[req.url || '/']);
        console.log(`📡 [ROUTER] Incoming: ${req.url} -> ${viewPath}`);
        try {
            const html = await fs.readFile(viewPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) {
            console.error(`❌ [ROUTER] View Load Failed: ${viewPath}`, e);
            res.writeHead(404);
            res.end('View Manifest Failure');
        }
        return;
    }

    // 📡 API Handshakes 📡
    if (req.url === '/api/telemetry') {
        const telemetry = await getTelemetry();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(telemetry));
        return;
    }

    if (req.url === '/api/graph') {
        try {
            const graphPath = path.resolve(process.cwd(), 'graphify-out/graph.json');
            const graph = readFileSync(graphPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
            res.end(graph);
        } catch (e) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'graph.json not found — run /graphify first' }));
        }
        return;
    }

    // 🛡️ Static Asset Handshake 🛡️
    if (req.url?.startsWith('/static/')) {
        try {
            const staticFile = req.url.slice('/static/'.length);
            const filePath = path.join(process.cwd(), 'dashboard/static', staticFile);
            const ext = path.extname(filePath);
            const mimeTypes: Record<string, string> = { 
                '.css': 'text/css', 
                '.js': 'application/javascript; charset=UTF-8',
                '.png': 'image/png'
            };
            const contentType = mimeTypes[ext] || 'text/plain';
            const file = readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
            res.end(file);
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    if (req.url === '/QuadMapRenderer.js') {
        try {
            const js = readFileSync(path.join(process.cwd(), 'dashboard/dist/QuadMapRenderer.js'));
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=UTF-8', 'Cache-Control': 'no-cache' });
            res.end(js);
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`💎 Metropolis Telemetry Engine Online [Port ${PORT}]`);
    console.log(`📡 Mirroring REAL Spectral Analytics...`);
});
