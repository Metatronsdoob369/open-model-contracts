/**
 * OMC Submit Auth Middleware
 *
 * Layer 1: API key check — rejects any /submit request without the correct header.
 * Layer 3: HMAC-SHA256 signature verification — proves payload wasn't tampered with.
 *
 * Environment variables:
 *   OMC_SUBMIT_KEY    — shared secret API key (min 32 chars)
 *   OMC_SUBMIT_HMAC   — shared secret for HMAC signing (min 32 chars)
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SUBMIT_KEY = process.env['OMC_SUBMIT_KEY'] ?? '';
const SUBMIT_HMAC = process.env['OMC_SUBMIT_HMAC'] ?? '';

if (!SUBMIT_KEY || SUBMIT_KEY.length < 32) {
  console.warn('[OMC Submit Auth] WARNING: OMC_SUBMIT_KEY not set or too short — /submit is unprotected!');
}
if (!SUBMIT_HMAC || SUBMIT_HMAC.length < 32) {
  console.warn('[OMC Submit Auth] WARNING: OMC_SUBMIT_HMAC not set or too short — payload signing disabled!');
}

// ── Layer 1: API Key ──────────────────────────────────────────────────────────
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!SUBMIT_KEY) {
    // No key configured — skip check (dev mode only)
    next();
    return;
  }

  const provided = req.headers['x-omc-key'] as string | undefined;
  if (!provided) {
    res.status(401).json({ error: 'Missing x-omc-key header', code: 'AUTH_MISSING' });
    return;
  }

  // Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(provided.padEnd(64));
    const b = Buffer.from(SUBMIT_KEY.padEnd(64));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(403).json({ error: 'Invalid API key', code: 'AUTH_INVALID' });
      return;
    }
  } catch {
    res.status(403).json({ error: 'Invalid API key', code: 'AUTH_INVALID' });
    return;
  }

  next();
}

// ── Layer 3: HMAC Signature ───────────────────────────────────────────────────
// Marsh's MCP signs the payload: HMAC-SHA256(body_string, OMC_SUBMIT_HMAC)
// Bridge verifies before writing anything to disk.
export function verifyHmac(req: Request, res: Response, next: NextFunction): void {
  if (!SUBMIT_HMAC) {
    // No HMAC secret configured — skip (dev mode only)
    next();
    return;
  }

  const signature = req.headers['x-omc-sig'] as string | undefined;
  if (!signature) {
    res.status(401).json({ error: 'Missing x-omc-sig header', code: 'SIG_MISSING' });
    return;
  }

  // req.body has already been parsed — re-serialize deterministically
  const bodyString = JSON.stringify(req.body);
  const expected = createHmac('sha256', SUBMIT_HMAC).update(bodyString).digest('hex');

  try {
    const a = Buffer.from(signature.padEnd(128));
    const b = Buffer.from(expected.padEnd(128));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(403).json({ error: 'Payload signature mismatch', code: 'SIG_INVALID' });
      return;
    }
  } catch {
    res.status(403).json({ error: 'Payload signature mismatch', code: 'SIG_INVALID' });
    return;
  }

  next();
}

// ── Signing helper (used by Marsh's MCP) ─────────────────────────────────────
export function signPayload(body: unknown, hmacSecret: string): string {
  return createHmac('sha256', hmacSecret).update(JSON.stringify(body)).digest('hex');
}
