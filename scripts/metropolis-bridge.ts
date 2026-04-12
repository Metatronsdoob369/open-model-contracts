import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3072;
const LANDING_ZONE = '/tmp/roblox-games/tycoon';

app.use(express.json({ limit: '50mb' }));

app.post('/ingest', (req, res) => {
    const { name, source } = req.body;
    if (!name || !source) return res.status(400).send('Missing payload');

    const filePath = path.join(LANDING_ZONE, `${name.replace(/\./g, '_')}.lua`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, source);

    console.log(`📥 [INGEST] Beamed: ${name} -> ${filePath}`);
    res.send('Success');
});

app.get('/', (req, res) => {
    res.json({
        status: 'PROTOCOL_STABLE',
        port: PORT,
        location: LANDING_ZONE,
        message: 'Metropolis Bridge is manifest and listening.'
    });
});

app.get('/heartbeat', (req, res) => {
    res.json({ pulse: 'ACTIVE', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🚀 [BRIDGE] Metropolis Ingestor Live on Port ${PORT}`);
    console.log(`📡 Waiting for Studio to 'beam' the logic...`);
});
