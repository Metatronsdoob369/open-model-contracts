/**
 * @popsim/contract — Local Validation Utility
 * Validates a JSON payload against the PopSimContractInputSchema.
 * Usage: npx ts-node src/validate-contract.ts <path-to-json>
 */

import { readFileSync } from 'fs';
import { PopSimContractInputSchema } from './domains/popsim/popsim-domain';
import { GenericGameInputSchema } from './domains/generic/generic-domain';
import { z } from 'zod';

const DomainRegistry: Record<string, z.ZodSchema> = {
    'popsim': PopSimContractInputSchema,
    'generic': GenericGameInputSchema,
};

async function validate() {
    const args = process.argv.slice(2);
    let domain = 'generic';
    let filePath = '';

    if (args[0] === '--domain') {
        domain = args[1];
        filePath = args[2];
    } else {
        filePath = args[0];
    }

    if (!filePath) {
        console.error('❌ Error: Please provide a path to a JSON payload.');
        console.log('Usage: npm run validate [--domain <name>] <payload.json>');
        process.exit(1);
    }

    const schema = DomainRegistry[domain.toLowerCase()];
    if (!schema) {
        console.error(`❌ Error: Unknown Domain: ${domain}`);
        process.exit(1);
    }

    try {
        const rawData = readFileSync(filePath, 'utf-8');
        const payload = JSON.parse(rawData);

        console.log(`⚖️  Validating [${domain}] payload from: ${filePath}...`);
        const result = schema.safeParse(payload);

        if (result.success) {
            console.log('✅ Law Compliant: Payload matches the contract schema.');
            process.exit(0);
        } else {
            console.error('❌ Law Violated: Invalid Contract Input');
            console.error(JSON.stringify(result.error.format(), null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('🔥 Execution Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

validate();
