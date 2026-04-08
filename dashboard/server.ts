import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { ResearchInference } from '../spec/contracts/v3/amem-payload.js';

const PORT = 3100;

const VAMPIRE_DIR = path.resolve(process.cwd(), 'generated/vampire_drops');
const PROCESSED_DIR = path.resolve(process.cwd(), 'incoming/processed');
const CANONICAL_DIR = path.resolve(process.cwd(), 'src/canonical');

async function getTelemetry() {
    let vampireDrains: any[] = [];
    try {
        const files = await fs.readdir(VAMPIRE_DIR);
        for (const file of files.filter(f => f.endsWith('.json'))) {
            const content = await fs.readFile(path.join(VAMPIRE_DIR, file), 'utf-8');
            const data = JSON.parse(content);
            vampireDrains.push({
                name: path.basename(data.metadata.source || file),
                time: data.metadata.timestamp,
                nodes: data.structural_dna.ast_node_count,
                composition: data.structural_dna.logic_composition
            });
        }
    } catch (e) {}

    let auditLog: any[] = [];
    try {
        const files = await fs.readdir(PROCESSED_DIR);
        for (const file of files.filter(f => f.endsWith('.json'))) {
             const stat = await fs.stat(path.join(PROCESSED_DIR, file));
             if (file.startsWith('report_')) {
                auditLog.push({
                    type: 'Sentry',
                    msg: `Rejected & Audited: ${file.split('_').slice(2).join('_')}`,
                    time: stat.mtime
                });
             }
        }
    } catch (e) {}
    
    try {
        const canonicalFiles = await fs.readdir(CANONICAL_DIR);
        for (const file of canonicalFiles.filter(f => f.endsWith('.lua'))) {
             const stat = await fs.stat(path.join(CANONICAL_DIR, file));
             auditLog.push({
                 type: 'Refiner',
                 msg: `Instantiated Canonical Law: ${file}`,
                 time: stat.mtime
             });
        }
    } catch (e) {}

    // Sort logs by time
    auditLog.sort((a, b) => b.time - a.time);
    vampireDrains.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
        ...ResearchInference.researchData,
        safety: ResearchInference.researchData.safety,
        vampireDrains: vampireDrains.slice(0, 10),
        auditLog: auditLog.slice(0, 15)
    };
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        const html = await fs.readFile(path.join(process.cwd(), 'dashboard/index.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (req.url === '/api/telemetry') {
        const telemetry = await getTelemetry();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(telemetry));
    } else if (req.url === '/thermal_view.png') {
        const img = await fs.readFile(path.join(process.cwd(), 'dashboard/thermal_view.png'));
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\n💎 OMC Sovereign Command Centre Online`);
    console.log(`📡 Dashboard: http://localhost:${PORT}`);
    console.log(`🧠 Monitoring Pipeline Telemetry...`);
});
