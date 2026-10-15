/**
 * Test: SovereignArbEngineV3
 *
 * Simulates two scenarios:
 *   1. STABLE pool pair → EXECUTE verdict
 *   2. Shattered pool (drifted Z-anchor) → ABORT verdict
 */

import { SovereignArbEngineV3, PoolSnapshot, ArbOpportunity } from '../domains/crypto/sovereign-arb-engine-v3.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSnapshot(
  poolAddress: string,
  blockNumber: number,
  reserve0: bigint,
  reserve1: bigint,
  rawData: string
): PoolSnapshot {
  return { poolAddress, blockNumber, reserve0, reserve1, fee: 0.003, rawData };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const engine = new SovereignArbEngineV3();

  // ──────────────────────────────────────────────
  // SCENARIO 1: Stable pool pair — should EXECUTE
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('SCENARIO 1: Stable pool pair');
  console.log('════════════════════════════════════════');

  const USDC_ETH_POOL  = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
  const DAI_ETH_POOL   = '0x60594a405d53811d3bc4766596efd80fd545a270';

  // Discovery — seed anchors
  await engine.analyzePool(makeSnapshot(
    USDC_ETH_POOL, 19_000_000,
    1_000_000n * 10n**6n,  // 1M USDC
    580n * 10n**18n,       // 580 ETH
    'Uniswap V3 USDC/ETH 0.05% pool. reserve0=1000000000000 reserve1=580000000000000000000 sqrtPriceX96=1823460287491 tick=201845 liquidity=8234710293847'
  ));

  await engine.analyzePool(makeSnapshot(
    DAI_ETH_POOL, 19_000_000,
    1_000_000n * 10n**18n, // 1M DAI
    578n * 10n**18n,       // 578 ETH
    'Uniswap V3 DAI/ETH 0.05% pool. reserve0=1000000000000000000000000 reserve1=578000000000000000000 sqrtPriceX96=1821034592817 tick=201810 liquidity=7129384710293'
  ));

  // Execution — same pool state, minimal drift
  const opp1: ArbOpportunity = {
    poolA: makeSnapshot(
      USDC_ETH_POOL, 19_000_001,
      1_000_100n * 10n**6n,
      579n * 10n**18n,
      'Uniswap V3 USDC/ETH 0.05% pool. reserve0=1000100000000 reserve1=579000000000000000000 sqrtPriceX96=1823461000000 tick=201846 liquidity=8234710293847'
    ),
    poolB: makeSnapshot(
      DAI_ETH_POOL, 19_000_001,
      999_900n * 10n**18n,
      579n * 10n**18n,
      'Uniswap V3 DAI/ETH 0.05% pool. reserve0=999900000000000000000000 reserve1=579000000000000000000 sqrtPriceX96=1821100000000 tick=201812 liquidity=7129384710293'
    ),
    expectedProfit: 50n * 10n**18n,
    gasEstimate:   200_000n
  };

  const verdict1 = await engine.verifyArb(opp1);
  console.log(`\n✅ Scenario 1 result: ${verdict1.gate}`);

  // ──────────────────────────────────────────────
  // SCENARIO 2: Shattered pool — should ABORT
  // Pool B description changes radically between
  // discovery and execution (rug, drain, protocol change)
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('SCENARIO 2: Shattered pool (Z-anchor drift)');
  console.log('════════════════════════════════════════');

  const WBTC_ETH_POOL = '0xcbcdf9626bc03e24f779434178a73a0b4bad62ed';
  const SHADY_POOL    = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

  // Discovery — seed anchor for shady pool at one state
  await engine.analyzePool(makeSnapshot(
    SHADY_POOL, 19_100_000,
    500_000n * 10n**18n,
    250n * 10n**18n,
    'Uniswap V2 TOKEN/ETH pool. reserve0=500000000000000000000000 reserve1=250000000000000000000 totalSupply=350000000000 factory=0x5C69bEe liquidity=normal depth=deep'
  ));

  // Execution — pool state has radically changed (drain event, new token, rug)
  const opp2: ArbOpportunity = {
    poolA: makeSnapshot(
      WBTC_ETH_POOL, 19_100_005,
      1_000n * 10n**8n,
      15n * 10n**18n,
      'Uniswap V3 WBTC/ETH 0.3% pool. reserve0=100000000000 reserve1=15000000000000000000 stable deep-liquidity institutional'
    ),
    poolB: makeSnapshot(
      SHADY_POOL, 19_100_005,
      10n,               // nearly drained
      250n * 10n**18n,
      // Completely different character — MEV bot calldata + assembly swap + drain loop
      `assembly { let x := mload(0x40) let success := call(0xffff, target, 0, x, 0x44, 0, 0) }
       for (uint i = 0; i < victims.length; i++) { token.transfer(address(this), victims[i]); }
       // 0xdd62ed3e 0x095ea7b3 0xa9059cbb 0x0902f1ac
       flashSwap.execute(pair, 1000e18, 0, address(this));
       flashSwap.execute(pair2, 500e18, 0, address(this));
       flashSwap.execute(pair3, 250e18, 0, address(this));`
    ),
    expectedProfit: 500n * 10n**18n,
    gasEstimate:   500_000n
  };

  const verdict2 = await engine.verifyArb(opp2);
  console.log(`\n✅ Scenario 2 result: ${verdict2.gate}`);
  if (verdict2.abortReason) console.log(`   Abort reason: ${verdict2.abortReason}`);

  // ──────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('════════════════════════════════════════');
  console.log(`Scenario 1 (stable):   ${verdict1.gate === 'EXECUTE' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Scenario 2 (shattered): ${verdict2.gate === 'ABORT'  ? '✅ PASS' : '❌ FAIL'}`);

  const passed = verdict1.gate === 'EXECUTE' && verdict2.gate === 'ABORT';
  console.log(`\n${passed ? '💎 DIAMOND-STABLE — SovereignArbEngineV3 validated' : '❌ Validation failed — check thresholds'}`);
}

main().catch(console.error);
