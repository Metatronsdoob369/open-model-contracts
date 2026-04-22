import http from 'http';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const PORT = 3100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUD_DIR = '/Users/joewales/METROPOLIS_HUD';
const HUD_PATH = path.join(HUD_DIR, 'telemetry.json');
const MANIFEST_PATH = path.join(HUD_DIR, 'manifest.json');

const PI_IP = '100.113.215.46';
const PI_USER = 'throttleneck-15';

async function getPiStats() {
    try {
        // Query Pi SEC Folder Counts & GPU Status
        const cmd = `ssh -o BatchMode=yes ${PI_USER}@${PI_IP} "
            find /home/throttleneck-15/openclaw-sec/inbox -maxdepth 1 -type f | wc -l;
            find /home/throttleneck-15/openclaw-sec/triage -maxdepth 1 -type f | wc -l;
            find /home/throttleneck-15/openclaw-sec/findings -maxdepth 1 -type f | wc -l;
            ls /dev/vchiq > /dev/null 2>&1 && echo 'V3D_ACTIVE' || echo 'OFFLINE'
        "`;
        const output = execSync(cmd).toString().trim().split('\n');
        return {
            inbox: parseInt(output[0]),
            triage: parseInt(output[1]),
            findings: parseInt(output[2]),
            gpu: output[3]
        };
    } catch (e) {
        return { inbox: 0, triage: 0, findings: 0, gpu: 'OFFLINE' };
    }
}

async function getTelemetry() {
    let liveTelemetry = { status: 'OK', tau: 0.7, lastShard: 'IDLE', cycle: 0 };
    let manifest = [];

    try {
        if (existsSync(HUD_PATH)) {
            liveTelemetry = JSON.parse(readFileSync(HUD_PATH, 'utf-8'));
        }
        if (existsSync(MANIFEST_PATH)) {
            manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
        }
    } catch (e) {}

    const piStats = await getPiStats();

    const spectralReport = manifest.map((item, i) => ({
        id: item.shard.split('_SHARD_')[0],
        room: item.shard.includes('siemens') ? 'Siemens_S7' : 'ENIP_Industrial',
        overallShatter: item.resonance,
        heat: liveTelemetry.status === 'HOLD' ? 0.9 : 0.2,
        phase: item.stealthStatus,
        status: item.status || (item.targetFlag === 'VULN_CLUSTER_A' ? 'VULN_CLUSTER_A' : 'NORMAL')
    }));

    return {
        vampireDrains: [],
        spectralReport: spectralReport,
        avgShatter: liveTelemetry.tau,
        cycle: liveTelemetry.cycle,
        status: liveTelemetry.status,
        piStats: piStats
    };
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/api/telemetry') {
        const telemetry = await getTelemetry();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(telemetry));
        return;
    }

    if (req.url === '/telemetry.json') {
        if (existsSync(HUD_PATH)) {
            const content = readFileSync(HUD_PATH);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        } else {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    if (req.url === '/' || req.url === '/index.html' || req.url === '/nexus' || req.url === '/nexus.html') {
        try {
            const html = readFileSync(path.join(__dirname, 'nexus.html'), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) {
            res.writeHead(404);
            res.end('Nexus Not Found');
        }
        return;
    }

    if (req.url === '/discovery' || req.url === '/discovery-portal.html') {
        try {
            const html = readFileSync(path.join(HUD_DIR, 'discovery-portal.html'), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) {
            res.writeHead(404);
            res.end('Discovery Portal Not Found');
        }
        return;
    }

    if (req.url.startsWith('/static/')) {
        try {
            const staticFile = req.url.slice('/static/'.length);
            const filePath = path.join(__dirname, 'static', staticFile);
            const content = readFileSync(filePath);
            const ext = path.extname(filePath);
            const mime = ext === '.js' ? 'application/javascript' : (ext === '.css' ? 'text/css' : 'text/plain');
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
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
    console.log("💎 Metropolis Consolidated Engine Online [" + PORT + "]");
    console.log("📡 Tethered to Pi Shadow Lab Subnet...");
    console.log("🔥 Vulkan GPU Monitoring Active (V3D)");
    console.log("🔭 Nexus Orbit: http://localhost:3100/");
});
