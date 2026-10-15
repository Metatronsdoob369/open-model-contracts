/**
 * Sovereign Drift Server — Port 8090
 *
 * Dedicated MiroFish → HAL bridge. Completely isolated from :8080
 * which is reserved for Roblox / Marsh / Mash communications.
 *
 * Responsibility:
 *   Receive MiroFish DriftReports → validate (Zod) → gate check
 *   → if SHATTERED: logAbort via HAL → register dark node
 *   → return RepairResponse with updated SpatialExclusionMap
 *   → write exclusion map to disk for MiroFish to read on next tick
 *
 * MiroFish reads:  GET /v1/sovereign/exclusion-map
 * MiroFish writes: POST /v1/sovereign/drift
 * Telemetry read:  GET /v1/sovereign/stats
 *
 * No Roblox. No Telegram emitters. No spectra mapper.
 * Pure numerical interface — Zod in, Zod out.
 */

import express from 'express';
import { createServer } from 'http';
import { z } from 'zod';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { HonestAssessmentLogger } from './domains/crypto/honest-assessment-logger.js';
import {
  MiroFishDriftReportSchema,
  MiroFishRepairResponseSchema,
  SpatialExclusionMapSchema,
  validateMiroFishGate,
  type MiroFishDriftReport,
  type SpatialExclusionMap,
} from './domains/mirofish.contract.js';

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const PORT             = parseInt(process.env.DRIFT_PORT ?? '8090');
const EXCLUSION_MAP    = path.resolve(process.cwd(), 'lab/spectral-maps/spatial-exclusion.json');
const NODE_15_LOG      = path.resolve(process.cwd(), 'lab/node-15.log');

// ─────────────────────────────────────────
// SINGLETON HAL — one instance, persistent
// All dark nodes and certificates accumulate here across requests
// ─────────────────────────────────────────

const hal = new HonestAssessmentLogger();

// ─────────────────────────────────────────
// NODE 15 LOGGER — sovereign audit trail
// Bypasses all Roblox event emitters
// ─────────────────────────────────────────

function node15(level: 'INFO' | 'WARN' | 'ABORT', message: string, data?: unknown) {
  const entry = JSON.stringify({
    ts:      new Date().toISOString(),
    level,
    message,
    ...(data ? { data } : {}),
  });
  fs.appendFileSync(NODE_15_LOG, entry + '\n');
  const prefix = level === 'ABORT' ? '💀' : level === 'WARN' ? '⚠️ ' : '📡';
  console.log(`${prefix} [NODE-15] ${message}`);
}

// ─────────────────────────────────────────
// EXCLUSION MAP — written after every SHATTERED drift
// MiroFish reads this on each simulation tick
// ─────────────────────────────────────────

function writeExclusionMap(): SpatialExclusionMap {
  const darkNodes = hal.allDarkNodes;

  const darkZones = darkNodes
    .sort((a, b) => (b.heat * b.heatMultiplier) - (a.heat * a.heatMultiplier))
    .map(n => ({
      id:             n.id,
      zone:           n.signatureClass,
      // 3D projection: T[0], T-1[1024], T-start[2048] — scaled for coordinate space
      coordinates: [
        (n.vector[0]    ?? 0) * 20,
        (n.vector[1024] ?? 0) * 20,
        (n.vector[2048] ?? 0) * 20,
      ] as [number, number, number],
      heat:           n.heat,
      heatMultiplier: n.heatMultiplier,
      confirmations:  n.confirmations,
      signatureClass: n.signatureClass,
    }));

  const totalRepulsion = darkZones.reduce((s, z) => s + z.heat * z.heatMultiplier, 0);
  const pauseRecommended = totalRepulsion > 5.0 || darkZones.some(z => z.confirmations > 3);

  const map: SpatialExclusionMap = SpatialExclusionMapSchema.parse({
    updatedAt:        new Date().toISOString(),
    darkZones,
    totalRepulsion,
    pauseRecommended,
  });

  fs.mkdirSync(path.dirname(EXCLUSION_MAP), { recursive: true });
  fs.writeFileSync(EXCLUSION_MAP, JSON.stringify(map, null, 2));

  return map;
}

// ─────────────────────────────────────────
// BUILD PREDICTION COMMITMENT
// OMC-compliant SHA-256 commitment for SovereignArbEngineV3
// ─────────────────────────────────────────

function buildCommitment(report: MiroFishDriftReport, certId: string) {
  const vec = report.vec3072;
  const fingerprint = {
    t:       vec.slice(0, 32),
    tMinus1: vec.slice(1024, 1056),
    tStart:  vec.slice(2048, 2080),
  };

  const payload = [
    report.simulationId,
    report.zone,
    report.detectedAt,
    fingerprint.t.map(v => v.toFixed(6)).join(','),
    fingerprint.tMinus1.map(v => v.toFixed(6)).join(','),
    fingerprint.tStart.map(v => v.toFixed(6)).join(','),
  ].join('::');

  return {
    predictionHash: '0x' + crypto.createHash('sha256').update(payload).digest('hex'),
    sourceEventId:  report.eventId,
    zone:           report.zone,
    simulationId:   report.simulationId,
    committedAt:    new Date().toISOString(),
    fingerprint,
    gate: 'ARMED' as const,
  };
}

// ─────────────────────────────────────────
// EXPRESS APP
// ─────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '5mb' }));

// ── Caller whitelist — MiroFish only ─────
app.use((req, res, next) => {
  const caller = req.headers['x-caller'] as string;
  if (caller !== 'mirofish' && caller !== 'system') {
    res.status(403).json({ success: false, error: 'Unauthorized caller' });
    return;
  }
  next();
});

// ─────────────────────────────────────────
// POST /v1/sovereign/drift
// MiroFish submits a drift event.
// SHATTERED → HAL logAbort → dark node → exclusion map updated.
// DRIFTING  → warp applied, no dark node yet.
// NOMINAL   → acknowledge, no action.
// ─────────────────────────────────────────

app.post('/v1/sovereign/drift', async (req, res) => {
  // 1. Parse + validate the incoming report
  const parsed = MiroFishDriftReportSchema.safeParse(req.body);
  if (!parsed.success) {
    node15('WARN', 'Invalid drift report', parsed.error.flatten());
    res.status(400).json({ success: false, error: 'Schema validation failed', details: parsed.error.flatten() });
    return;
  }

  const report = parsed.data;

  // 2. Gate check — ARMED gate must not be expired
  const gateResult = validateMiroFishGate(report);
  if (!gateResult.valid) {
    node15('WARN', `Gate expired for drift event ${report.eventId}`, { reason: gateResult.reason });
    res.status(403).json({ success: false, error: gateResult.reason });
    return;
  }

  node15('INFO', `Drift event received: ${report.eventId}`, {
    zone:          report.zone,
    severity:      report.severity,
    zAnchorDrift:  report.zAnchorDrift,
    signatureHeat: report.signatureHeat,
    simulationId:  report.simulationId,
  });

  let certificateIssued = false;
  let certificateId: string | null = null;
  let warpedResonance = 1.0;
  let skipZone = false;
  let darkZoneCoordinates: [number, number, number] | null = null;

  const vec = new Float32Array(report.vec3072);

  if (report.severity === 'SHATTERED') {
    // ── ABORT path: issue Shatter Certificate, register dark node ──

    node15('ABORT', `SHATTERED zone detected: ${report.zone}`, {
      zAnchorDrift: report.zAnchorDrift,
      heat:         report.signatureHeat,
    });

    // Map signatures to canonical SIG_ format for HAL's extractClasses()
    const signatures = report.signatures.length > 0
      ? report.signatures
      : [`SIG_MIROFISH_STRUCTURAL_DRIFT_${report.zone.toUpperCase()}`];

    const cert = hal.logAbort({
      combinedHash:  buildCommitment(report, 'pending').predictionHash,
      poolAddress:   `mirofish::${report.simulationId}::${report.zone}`,
      blockNumber:   Math.floor(Date.now() / 1000),  // synthetic block = unix seconds
      signatures,
      mevHeat:       report.signatureHeat,
      zAnchorDrift:  report.zAnchorDrift,
      tVelocity:     report.tVelocity,
      vec3072:       vec,
      abortReason:   report.reason,
    });

    certificateIssued = true;
    certificateId     = cert.id;

    // Compute warped resonance for this zone post-registration
    const warp = hal.calculateWarpedResonance(
      `mirofish::${report.simulationId}::${report.zone}`,
      vec,
      1.0 - report.zAnchorDrift
    );

    warpedResonance       = warp.warpedResonance;
    skipZone              = warp.skipSimulation;
    darkZoneCoordinates   = [
      (vec[0]    ?? 0) * 20,
      (vec[1024] ?? 0) * 20,
      (vec[2048] ?? 0) * 20,
    ];

    node15('WARN', `Certificate ${cert.id} issued. Warp: ${warpedResonance.toFixed(4)}. Skip: ${skipZone}`);

  } else if (report.severity === 'DRIFTING') {
    // ── WARP path: compute repulsion but don't register dark node yet ──

    const warp = hal.calculateWarpedResonance(
      `mirofish::${report.simulationId}::${report.zone}`,
      vec,
      1.0 - report.zAnchorDrift
    );

    warpedResonance = warp.warpedResonance;
    skipZone        = warp.skipSimulation;

    node15('WARN', `DRIFTING zone warped: ${report.zone}, resonance=${warpedResonance.toFixed(4)}`);
  }

  // Update exclusion map after any drift event (even NOMINAL — keeps timestamps fresh)
  const exclusionMap = writeExclusionMap();

  // Build response
  const response = MiroFishRepairResponseSchema.parse({
    eventId:             report.eventId,
    certificateIssued,
    certificateId,
    warpedResonance,
    skipZone,
    darkZoneCoordinates,
    halStats: {
      darkNodeCount:    hal.darkNodeCount,
      certificateCount: hal.certificateCount,
    },
    repairedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: response });
});

// ─────────────────────────────────────────
// GET /v1/sovereign/exclusion-map
// MiroFish reads this on each simulation tick.
// If pauseRecommended=true, swarm holds position.
// ─────────────────────────────────────────

app.get('/v1/sovereign/exclusion-map', (_req, res) => {
  try {
    if (fs.existsSync(EXCLUSION_MAP)) {
      const map = JSON.parse(fs.readFileSync(EXCLUSION_MAP, 'utf-8'));
      res.json({ success: true, data: map });
    } else {
      // No dark nodes yet — clean map
      const empty: SpatialExclusionMap = {
        updatedAt:        new Date().toISOString(),
        darkZones:        [],
        totalRepulsion:   0,
        pauseRecommended: false,
      };
      res.json({ success: true, data: empty });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to read exclusion map' });
  }
});

// ─────────────────────────────────────────
// GET /v1/sovereign/stats
// Telemetry — dark node count, certificate count, top zones
// Sent to Node 15 log on every read.
// ─────────────────────────────────────────

app.get('/v1/sovereign/stats', (_req, res) => {
  const darkNodes = hal.allDarkNodes;
  const topZones = darkNodes
    .sort((a, b) => b.confirmations - a.confirmations)
    .slice(0, 10)
    .map(n => ({
      id:             n.id,
      signatureClass: n.signatureClass,
      confirmations:  n.confirmations,
      heat:           n.heat,
      heatMultiplier: n.heatMultiplier,
    }));

  const stats = {
    darkNodeCount:    hal.darkNodeCount,
    certificateCount: hal.certificateCount,
    topZones,
    exclusionMapPath: EXCLUSION_MAP,
    node15LogPath:    NODE_15_LOG,
  };

  node15('INFO', 'Stats requested', stats);
  res.json({ success: true, data: stats });
});

// ─────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    service:          'sovereign-drift-server',
    port:              PORT,
    darkNodeCount:     hal.darkNodeCount,
    certificateCount:  hal.certificateCount,
    exclusionMapReady: fs.existsSync(EXCLUSION_MAP),
    uptime:            process.uptime(),
  });
});

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────

const httpServer = createServer(app);
fs.mkdirSync(path.dirname(NODE_15_LOG), { recursive: true });

httpServer.listen(PORT, () => {
  node15('INFO', `Sovereign Drift Server online`, { port: PORT });
  node15('INFO', `Dark nodes loaded: ${hal.darkNodeCount}`);
  node15('INFO', `Certificates loaded: ${hal.certificateCount}`);
  console.log(`\n🌑 [DRIFT-SERVER] Port ${PORT} — MiroFish interface active`);
  console.log(`   POST /v1/sovereign/drift        — submit drift events`);
  console.log(`   GET  /v1/sovereign/exclusion-map — swarm pathfinding exclusions`);
  console.log(`   GET  /v1/sovereign/stats         — HAL telemetry → Node 15`);
  console.log(`   GET  /health`);
  console.log(`   Node 15 log: ${NODE_15_LOG}`);
});
