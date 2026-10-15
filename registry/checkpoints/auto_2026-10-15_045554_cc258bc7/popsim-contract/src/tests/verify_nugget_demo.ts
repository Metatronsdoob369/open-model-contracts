import { SourcifyBridgeService } from '../core/sourcify-bridge.js';

async function main() {
    const bridge = new SourcifyBridgeService();

    console.log('🚀 [FORENSIC-SIM] Starting Sourcify Bridge Validation...');

    // 1. Resolve selectors from the "me_br_3" predatory engine
    const selectors = ['0xdd62ed3e', '0x095ea7b3', '0xa9059cbb'];
    for (const sel of selectors) {
        const results = await bridge.resolveSelector(sel);
        console.log(`🔹 Fragment ${sel}: ${results.join(' | ')}`);
    }

    // 2. Check a known verified address (WETH on Ethereum Mainnet)
    const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const chainId = 1;

    const vData = await bridge.verifyByAddress(weth, chainId);
    console.log(`\n💎 [WETH CHECK] Verified: ${vData.verified}`);
    if (vData.verified) {
        console.log(`✅ Metadata Found: ${vData.metadata ? 'YES' : 'NO'}`);
        console.log(`📁 Files pulled: ${vData.files?.length || 0}`);
    }

    // 3. Multi-address check simulation
    const results = await bridge.checkAddresses([weth], [1, 137]);
    console.log(`\n🔎 [MULTI-CHECK] Results:`, JSON.stringify(results, null, 2));

    console.log('\n✨ [FORENSIC-SIM] Validation complete.');
}

main().catch(err => {
    console.error('❌ [FORENSIC-SIM] Failed:', err);
    process.exit(1);
});
