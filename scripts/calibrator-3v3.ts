
import { GovernanceGate } from '../server/bridge/src/governance-gate';

async function runAudit() {
    console.error(`🛡️ [SYSTEM] Initializing 3x3 Calibration Audit...`);
    const gate = new GovernanceGate();

    const goodSamples = [
        { name: 'TagGameClient.lua', code: '-- SafeFire(tag) \n function init() print("Canonical Code") end' },
        { name: 'Metropolis_GameService.lua', code: 'local Bridge = require(OMC_Bridge_) \n Bridge:SafeFire("ping")' },
        { name: 'PizzaPlace_Control.lua', code: 'local UI = script.Parent:WaitForChild("Frame") \n -- capability:UI_REFRAG' }
    ];

    const slopVariants = [
        { name: 'RANDOM_ENTROPY', code: '//??@!# random noise 1238912301283 gibberish' },
        { name: 'VACUUM_SLOP', code: 'local a = 1\nlocal b = 2\nlocal c = a + b' }, 
        { name: 'GIBBERISH_BOILERPLATE', code: 'function doThing()\n   for i=1,100 do\n      print("nothing")\n   end\nend' }
    ];

    console.error(`\n💎 --- [CHRONE³ CALIBRATION AUDIT: 3x3] --- 💎\n`);

    console.error(`✅ [GOOD GROUP]`);
    for (const sample of goodSamples) {
        const result = await gate.validateSovereignty(sample.name, sample.code);
        console.error(`   > ${sample.name}: ${result.resonanceScore.toFixed(3)}v [${result.status}]`);
    }

    console.error(`\n❌ [SLOP GROUP]`);
    for (const slop of slopVariants) {
        const result = await gate.validateSovereignty(slop.name, slop.code);
        console.error(`   > ${slop.name}: ${result.resonanceScore.toFixed(3)}v [${result.status}]`);
    }
}

runAudit().catch(err => {
    console.error(`🚨 [FATAL] Audit failed: ${err.message}`);
    process.exit(1);
});
