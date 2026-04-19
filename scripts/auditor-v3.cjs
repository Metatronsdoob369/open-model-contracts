const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * 🛰️ SECTOR ALPHA AUDITOR V3.0 (SOVEREIGN EDITION)
 * Comparing Live Telemetry against the ROBLOX_AUTONOMY_PRIMER_SECTOR_ALPHA.md.
 */

const AUDIT_LOG_PATH = '/var/folders/pr/mrr0pq5112nbp8_3qrbrp15m0000gn/T/omc-bridge-audit.jsonl';
const TAG_LOGIC_PATH = path.join(__dirname, '../generated/roblox-game-automator/modules/TagLogic.luau');

const RAP = {
    transactional: { tagFreq: 8, cooldown: 12 }
};

async function runAudit() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   🛰️  SECTOR ALPHA AUDITOR V3.0 — FULL PROTOCOL');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!fs.existsSync(AUDIT_LOG_PATH)) {
        console.warn('⚠️  AUDIT LOG MISSING. Fire the session to generate telemetry.');
        return null;
    }

    const logData = fs.readFileSync(AUDIT_LOG_PATH, 'utf8').split('\n').filter(l => l.length > 0);
    if (logData.length === 0) return null;
    
    const latestPulse = JSON.parse(logData[logData.length - 1]);
    const currentTagFreq = latestPulse.details?.tagFreq || 3.0; // Mock 3.0 if pulse is early

    console.log(`📡 Reading live telemetry...`);
    console.log(`   Pulse: ${latestPulse.timestamp} | Uptime: ${latestPulse.uptime?.toFixed(2) || 0}s\n`);

    console.log('⚖️  Calculating dissonance against Primer...');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('   📊 RESONANCE REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Tag Frequency:  ${currentTagFreq.toFixed(2)}/min (Target: ${RAP.transactional.tagFreq}/min)`);
    
    const status = currentTagFreq < 6 ? 'CRITICAL' : 'STABLE';
    console.log(`   Status:         ${status}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (status === 'CRITICAL') {
        console.log('🚨 DISSONANCE DETECTED: CRITICAL\n');
        const proposal = `EXPAND_TAG_DISTANCE [TAG_DISTANCE +15%]`;
        console.log(`📋 PROPOSED FIX: ${proposal}`);
        console.log('⏳ AWAITING "APPROVED" OR "MODIFY" from Sovereign.');
        return { action: 'EXPAND_TAG_DISTANCE', value: 1.15 };
    }

    return null;
}

function promptUser(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`\n❓ ${question}\n> `, answer => {
            rl.close();
            resolve(answer.trim().toUpperCase());
        });
    });
}

async function main() {
    const mutation = await runAudit();
    if (mutation) {
        console.log('\n   [Y] APPROVED — Execute mutation');
        console.log('   [M] MODIFY — Adjust parameters');
        console.log('   [X] EXIT — No action');

        const dec = await promptUser('Decision');

        if (dec === 'Y' || dec === 'APPROVED') {
            console.log('\n⚙️  EXECUTING SOVEREIGN FIX...');
            let content = fs.readFileSync(TAG_LOGIC_PATH, 'utf8');
            content = content.replace(/TAG_DISTANCE = (\d+)/, (match, p1) => {
                const newVal = Math.round(parseInt(p1) * mutation.value);
                return `TAG_DISTANCE = ${newVal}`;
            });
            fs.writeFileSync(TAG_LOGIC_PATH, content);
            console.log('✅ Mutation complete. Syncing to Studio via Rojo.\n');
        } else {
            console.log('❌ Mutation discarded.\n');
        }
    } else {
        console.log('💎 STATUS: DIAMOND-STABLE.\n');
    }
}

main().catch(console.error);
