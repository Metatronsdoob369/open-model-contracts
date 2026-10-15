import fetch from 'node-fetch';

async function main() {
    const url = 'http://localhost:8080/v1/spectra/ingest';
    
    // This is the me_br_3 predatory code from the user's request
    const predatoryCode = `
        pragma solidity =0.6.6; 
        interface Pair { function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external; }
        contract me_br_3 {
            function execute() public {
                // Flash Swap Chain Predatory Pattern
                address pair = 0x...;
                Pair(pair).swap(100, 0, address(this), "0x");
            }
        }
    `;

    console.log('🔥 [TEST] Sending predatory nugget to Spectra-Mapping...');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scripts: [
                    { id: 'predatory_mev_001', code: predatoryCode }
                ]
            })
        });

        const data = await response.json();
        console.log('\n📊 [SPECTRA-REPORT]');
        console.log(`ID: ${data.report[0].id}`);
        console.log(`Gate: ${data.report[0].gate}`);
        console.log(`Hotspots:`, data.report[0].spatial.hotspots);
        console.log(`Shatter: ${data.report[0].overallShatter.toFixed(4)}`);

        if (data.report[0].gate === 'ARMED') {
            console.log('\n✅ [SUCCESS] Neural Arbitrage Factory correctly identified the ARMED threat.');
        } else {
            console.log('\n❌ [FAILURE] System failed to ARM on predatory code.');
        }
    } catch (err) {
        console.log('⚠️ [OFFLINE] Bridge server not running. (This is expected if the server was not started for the test).');
    }
}

main();
