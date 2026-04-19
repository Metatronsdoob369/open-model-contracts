/**
 * OMC Bridge Server — Entry Point
 *
 * Reference implementation of the Phase 2 Escrow service.
 * Provides endpoints for creating, querying, and consuming escrow sessions.
 *
 * Usage:
 *   cd server/bridge && npm install && npm run build && npm start
 *
 * Environment variables:
 *   PORT            — HTTP port (default: 3099)
 *   OMC_AUDIT_LOG   — Path to JSONL audit log file (default: <tmpdir>/omc-bridge-audit.jsonl)
 */

import express from 'express';
import escrowRouter from './routes/escrow';
import telemetryRouter from './routes/telemetry';
import { getAuditLogPath } from './audit-logger';

const PORT = parseInt(process.env['PORT'] ?? '8080', 10);

const app = express();

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// DEBUG: Log all requests
app.use((req, _res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  next();
});

// Trust proxy headers when behind ngrok or a local reverse proxy
app.set('trust proxy', 1);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'omc-bridge', version: '1.0.0' });
});

// Escrow routes
app.use('/escrow', escrowRouter);

// Telemetry routes
app.use('/telemetry', telemetryRouter);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OMC Bridge] listening on http://localhost:${PORT}`);
  console.log(`[OMC Bridge] audit log → ${getAuditLogPath()}`);
  console.log(`[OMC Bridge] POST /escrow          — create escrow session`);
  console.log(`[OMC Bridge] POST /telemetry       — receive telemetry pulse`);
  console.log(`[OMC Bridge] GET  /escrow/:id/manifest  — retrieve manifest`);
  console.log(`[OMC Bridge] GET  /escrow/:id/modules   — retrieve module bundle`);
  console.log(`[OMC Bridge] POST /escrow/:id/consume   — consume session`);
});

export default app;
