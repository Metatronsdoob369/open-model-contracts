/**
 * src/informant/mcp-server.ts
 *
 * OMC v3 — Contract Informant MCP Server
 *
 * Exposes the OMC contract registry as callable MCP tools so that agents
 * can query, validate, and recall contracts without reasoning over prose.
 *
 * Tool surface:
 *   list_contracts()                        → contract metadata array
 *   get_contract(id)                        → single contract metadata + JSON Schema
 *   validate_payload(contract_id, payload)  → {ok, errors[], normalized?}
 *   recall_checkpoint(id|tag|"latest")      → registry checkpoint stub
 *
 * Design:
 *   - Reads OMC_REGISTRY from spec/contracts/index.ts (Law, no runtime deps).
 *   - Does NOT mutate registry state — SAFE gate only.
 *   - Exports `createInformantServer()` for testability.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { listContracts, getContract } from "../../spec/contracts/index.js";

// ─── Server factory (exported for testability) ────────────────────────────────

export function createInformantServer(): Server {
  const server = new Server(
    {
      name: "omc-contract-informant",
      version: "3.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ── Tool definitions ────────────────────────────────────────────────────────

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_contracts",
        description:
          "List all registered OMC contracts with their id, version, description, and capabilities.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: "get_contract",
        description:
          "Retrieve full metadata and the JSON Schema for a specific OMC contract by its stable id.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The stable contract id (e.g. 'omc.v3.asset')",
            },
          },
          required: ["id"],
          additionalProperties: false,
        },
      },
      {
        name: "validate_payload",
        description:
          "Validate an arbitrary JSON payload against a registered OMC contract schema. Returns {ok, errors[], normalized?}.",
        inputSchema: {
          type: "object",
          properties: {
            contract_id: {
              type: "string",
              description: "The stable contract id to validate against",
            },
            payload: {
              type: "object",
              description: "The JSON payload to validate",
            },
          },
          required: ["contract_id", "payload"],
          additionalProperties: false,
        },
      },
      {
        name: "recall_checkpoint",
        description:
          "Retrieve registry checkpoint metadata by id, tag, or 'latest'. Returns checkpoint stub information.",
        inputSchema: {
          type: "object",
          properties: {
            ref: {
              type: "string",
              description:
                "Checkpoint id, tag name, or the literal string 'latest'",
            },
          },
          required: ["ref"],
          additionalProperties: false,
        },
      },
    ],
  }));

  // ── Tool handlers ───────────────────────────────────────────────────────────

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const typedArgs = (args ?? {}) as Record<string, unknown>;

    switch (name) {
      // ── list_contracts ──────────────────────────────────────────────────────
      case "list_contracts": {
        const contracts = listContracts();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ contracts }, null, 2),
            },
          ],
        };
      }

      // ── get_contract ────────────────────────────────────────────────────────
      case "get_contract": {
        const id = String(typedArgs.id ?? "");
        const entry = getContract(id);

        if (!entry) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Contract '${id}' not found`,
                  available: listContracts().map((c) => c.id),
                }),
              },
            ],
            isError: true,
          };
        }

        const jsonSchema = zodToJsonSchema(entry.schema, {
          $refStrategy: "none",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  id: entry.id,
                  version: entry.version,
                  description: entry.description,
                  capabilities: entry.capabilities ?? [],
                  jsonSchema,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // ── validate_payload ────────────────────────────────────────────────────
      case "validate_payload": {
        const contractId = String(typedArgs.contract_id ?? "");
        const payload = typedArgs.payload;
        const entry = getContract(contractId);

        if (!entry) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: false,
                  errors: [`Contract '${contractId}' not found`],
                }),
              },
            ],
            isError: true,
          };
        }

        const result = entry.schema.safeParse(payload);

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: true,
                  errors: [],
                  normalized: result.data,
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                errors: result.error.errors.map(
                  (e) => `${e.path.join(".") || "(root)"}: ${e.message}`
                ),
              }),
            },
          ],
        };
      }

      // ── recall_checkpoint ───────────────────────────────────────────────────
      case "recall_checkpoint": {
        const ref = String(typedArgs.ref ?? "latest");

        // Stub: returns metadata placeholder.
        // A full implementation would read from registry/checkpoints/ and
        // resolve the ref to an actual checkpoint directory/tag.
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ref,
                status: "stub",
                message:
                  "recall_checkpoint is a stub in v3.0.0. " +
                  "Full implementation will resolve checkpoint id/tag/latest " +
                  "from registry/checkpoints/ and return contract deltas.",
                hint: "See registry/MANIFEST.md for the checkpoint log.",
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const server = createInformantServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OMC Contract Informant (v3.0.0) running on stdio");
}

main().catch((error) => {
  console.error("Informant server error:", error);
  process.exit(1);
});
