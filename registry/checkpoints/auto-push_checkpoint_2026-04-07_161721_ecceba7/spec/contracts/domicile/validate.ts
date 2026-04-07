#!/usr/bin/env tsx
/**
 * Contract Validator CLI
 *
 * Validates JSON payloads against Zod schemas.
 * Used by FastAPI backend for contract enforcement.
 *
 * Usage:
 *   tsx validate.ts <schema_name> <json_payload>
 *
 * Example:
 *   tsx validate.ts AIOperationsTask '{"task_type":"strategic_reporting",...}'
 */

import { z } from 'zod';
import {
  AIOperationsTaskSchema,
  AIOperationsResultSchema
} from './ai-ops-manager.contract';

// Schema registry
const SCHEMAS: Record<string, z.ZodSchema> = {
  AIOperationsTask: AIOperationsTaskSchema,
  AIOperationsResult: AIOperationsResultSchema
};

// ============================================================================
// CLI INTERFACE
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: tsx validate.ts <schema_name> <json_payload>');
    process.exit(1);
  }

  const [schemaName, jsonPayload] = args;

  // Get schema
  const schema = SCHEMAS[schemaName];
  if (!schema) {
    console.error(`❌ Unknown schema: ${schemaName}`);
    console.error(`Available schemas: ${Object.keys(SCHEMAS).join(', ')}`);
    process.exit(1);
  }

  // Parse JSON
  let payload: unknown;
  try {
    payload = JSON.parse(jsonPayload);
  } catch (err) {
    console.error('❌ Invalid JSON payload');
    console.error(err);
    process.exit(1);
  }

  // Validate
  const result = schema.safeParse(payload);

  if (result.success) {
    // Success
    console.log(JSON.stringify({
      success: true,
      data: result.data
    }));
    process.exit(0);
  } else {
    // Validation errors
    const errors = result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    console.log(JSON.stringify({
      success: false,
      errors
    }));
    process.exit(1);
  }
}

// Execute
main();
