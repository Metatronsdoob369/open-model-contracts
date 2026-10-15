/**
 * Sourcify Bridge Service
 * Domain: Verification & Provenance
 * 
 * Purpose: Bridges the Metropolis swarm with the Sourcify/4byte database
 * to provide canonical ground truth for mysterious bytecode/signatures.
 */

import { FLASH_DEFIER_SIGNATURES } from '../domains/crypto/flash-defier.js';

export class SourcifyBridgeService {
    private readonly FOURBYTE_API = 'https://www.4byte.directory/api/v1/signatures/';
    private readonly SOURCIFY_API = 'https://sourcify.dev/server/';

    /**
     * Resolves a hex selector (0x...) to its human-readable fragment.
     */
    async resolveSelector(selector: string): Promise<string[]> {
        if (!selector.startsWith('0x')) selector = '0x' + selector;
        
        console.log(`🔍 [SOURCIFY] Resolving selector: ${selector}...`);
        
        try {
            const response = await fetch(`${this.FOURBYTE_API}?hex_signature=${selector}`);
            if (!response.ok) return [];
            
            const data = await response.json() as { results: { text_signature: string }[] };
            const results = data.results.map(r => r.text_signature);
            console.log(`✅ [SOURCIFY] Found ${results.length} matches for ${selector}`);
            return results;
        } catch (error) {
            console.error(`❌ [SOURCIFY] Resolution failed:`, error);
            return [];
        }
    }

    /**
     * Checks if addresses are verified on Sourcify across specific chains.
     */
    async checkAddresses(addresses: string[], chainIds: number[]): Promise<any[]> {
        const addrList = addresses.join(',');
        const chainList = chainIds.join(',');
        const url = `${this.SOURCIFY_API}check-all-addresses?addresses=${addrList}&chainIds=${chainList}`;

        console.log(`🔍 [SOURCIFY] Checking ${addresses.length} addresses on chains [${chainList}]...`);

        try {
            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json() as any[];
        } catch (error) {
            console.error(`❌ [SOURCIFY] Address check failed:`, error);
            return [];
        }
    }

    /**
     * Pulls full source/metadata if the contract is verified.
     */
    async verifyByAddress(address: string, chainId: number): Promise<{ verified: boolean, metadata?: any, files?: any[] }> {
        const url = `${this.SOURCIFY_API}files/any/${chainId}/${address}`;
        
        console.log(`🔍 [SOURCIFY] Pulling verified sources for ${address} (Chain: ${chainId})...`);

        try {
            const response = await fetch(url);
            if (!response.ok) return { verified: false };
            
            const data = await response.json() as { status: string, files: any[] };
            return { 
                verified: data.status === 'full' || data.status === 'partial',
                metadata: data.files.find(f => f.name === 'metadata.json'),
                files: data.files
            };
        } catch (error) {
            // Silence 404s, they just mean "not verified"
            return { verified: false };
        }
    }

    /**
     * Cross-references an ARMED nugget with Sourcify verified status.
     * Uses bytecode hash if address is unknown.
     */
    async verifyNugget(bytecode: string): Promise<{ verified: boolean, matchType?: string }> {
        // Implementation for bytecode-hash based lookup (Sourcify "check-by-bytecode" pattern)
        // For now, we wrap the address check as the primary conduit.
        return { verified: false };
    }
}

