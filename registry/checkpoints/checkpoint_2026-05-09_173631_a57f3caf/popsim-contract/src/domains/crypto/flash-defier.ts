/**
 * FlashDeFier Signature Library
 * Domain: Crypto-Economic Adversary Analysis
 * 
 * Purpose: This file contains high-fidelity signatures of predatory 
 * liquidity maneuvers, MEV execution patterns, and structural fractures.
 * 
 * Part of the @popsim/contract Neural Arbitrage Factory.
 */

export const FLASH_DEFIER_SIGNATURES = {
    /**
     * @signature SIG_MEV_ASSEMBLY_SWAP
     * Pattern: Direct assembly calls to external contracts for gas-optimized swaps.
     * Detected in: me_br_3.sol
     */
    SIG_MEV_ASSEMBLY_SWAP: {
        id: 'SIG_MEV_ASSEMBLY_SWAP',
        heat: 0.94,
        shatter: 0.05,
        regex: /assembly\s*\{\s*let\s+x\s*:=\s*mload\(0x40\).*?call\(.*?0xffff/s,
        description: 'Hardcoded gas limit (0xffff) with manual memory-pointer injection.'
    },

    /**
     * @signature SIG_UNISWAP_V2_FEE_MATH_ASM
     * Pattern: Inline assembly calculation of the Uniswap V2 0.3% fee.
     */
    SIG_UNISWAP_V2_FEE_MATH_ASM: {
        id: 'SIG_UNISWAP_V2_FEE_MATH_ASM',
        heat: 0.98,
        shatter: 0.02,
        regex: /mul\(\s*mul\(\w+,\s*997\)\s*,\w+\)\s*,\s*add\(\s*mul\(\w+,\s*1000\)/,
        description: 'Raw Uniswap V2 constant product fee math (997/1000) in assembly.'
    },

    /**
     * @signature SIG_SELECTOR_BOT_CONSTANTS
     * Pattern: Specific function selectors used by MEV bots.
     */
    SIG_SELECTOR_BOT_CONSTANTS: {
        id: 'SIG_SELECTOR_BOT_CONSTANTS',
        description: 'Hardcoded common MEV selectors (allowance, approve, etc)',
        selectors: ['0xdd62ed3e', '0x095ea7b3', '0xa9059cbb', '0x0902f1ac'],
        heat: 0.85
    },
    SIG_DRAIN_LOOP: {
        id: 'SIG_DRAIN_LOOP',
        description: 'Iterative transfer/drain loop logic',
        regex: /for[\s\S]*transfer[\s\S]*address/i,
        heat: 0.92
    },
    SIG_FLASH_SWAP_CHAIN: {
        id: 'SIG_FLASH_SWAP_CHAIN',
        description: 'Multi-hop flash swap chain resonance',
        regex: /swap[\s\S]*swap[\s\S]*swap/i,
        heat: 0.89
    }
};
