import { Router } from 'express';
import fs from 'fs';
import { getAuditLogPath } from '../audit-logger';

const router = Router();

router.post('/', (req, res) => {
    const payload = req.body;
    const logEntry = {
        timestamp: new Date().toISOString(),
        event_type: 'TELEMETRY_PULSE',
        ...payload
    };

    // Log to file for later Heuristic Analysis
    fs.appendFileSync(getAuditLogPath(), JSON.stringify(logEntry) + '\n');
    
    console.log(`[OMC Telemetry] Pulse received from Sector: ${payload.sector} | Status: ${payload.state}`);
    res.json({ success: true });
});

export default router;
