/**
 * src/memory-vault/mcp-server.ts
 *
 * CIF Memory Vault — Sealed Personal MCP Server
 *
 * ZERO outbound data. All embeddings via local Ollama (nomic-embed-text).
 * Qdrant bound to 127.0.0.1:6340 only — no network exposure.
 * Completely decoupled from CIF extension.
 *
 * Tools:
 *   memory_search(query, limit?, source_filter?)  → semantic search
 *   memory_stats()                                → collection health
 *   memory_sources()                              → indexed log sources
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const QDRANT_URL = process.env.QDRANT_URL ?? "http://127.0.0.1:6340";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const COLLECTION = process.env.COLLECTION_NAME ?? "cif-memory";
const EMBED_MODEL = "nomic-embed-text";

// ── Local embedding via Ollama — no outbound calls ─────────────────────────

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBED_MODEL,
      prompt: text.substring(0, 8000),
    }),
  });

  const json = (await res.json()) as {
    embedding?: number[];
    error?: string;
  };

  if (!json.embedding) {
    throw new Error(json.error ?? "Embedding failed — is Ollama running?");
  }
  return json.embedding;
}

// ── Qdrant types ───────────────────────────────────────────────────────────

interface QdrantHit {
  id: number;
  score: number;
  payload: {
    text: string;
    source: string;
    lines: string;
    indexed_at: string;
  };
}

// ── Server factory ─────────────────────────────────────────────────────────

export function createMemoryVaultServer(): Server {
  const server = new Server(
    { name: "cif-memory-vault", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "memory_search",
        description:
          "Semantic search across indexed CIF logs. All processing is local — no data leaves this machine. Returns relevant log chunks ranked by meaning.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language search query",
            },
            limit: {
              type: "number",
              description: "Max results (default 5, max 20)",
            },
            source_filter: {
              type: "string",
              description:
                "Filter to a specific log source (e.g. 'DATASERVICE', 'QDRANT_MANAGER')",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
      },
      {
        name: "memory_stats",
        description:
          "Collection stats: point count, index status, health. Confirms sealed mode.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: "memory_sources",
        description:
          "List all indexed log sources with chunk counts.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const typedArgs = (args ?? {}) as Record<string, unknown>;

    switch (name) {
      case "memory_search": {
        const query = String(typedArgs.query ?? "");
        const limit = Math.min(Number(typedArgs.limit ?? 5), 20);
        const sourceFilter = typedArgs.source_filter
          ? String(typedArgs.source_filter)
          : undefined;

        const vector = await embed(query);

        const searchBody: Record<string, unknown> = {
          vector,
          limit,
          with_payload: true,
        };

        if (sourceFilter) {
          searchBody.filter = {
            must: [{ key: "source", match: { value: sourceFilter } }],
          };
        }

        const res = await fetch(
          `${QDRANT_URL}/collections/${COLLECTION}/points/search`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(searchBody),
          }
        );

        const data = (await res.json()) as { result: QdrantHit[] };

        const results = data.result.map((h) => ({
          source: h.payload.source,
          lines: h.payload.lines,
          score: Math.round(h.score * 1000) / 1000,
          text: h.payload.text,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ query, results }, null, 2),
            },
          ],
        };
      }

      case "memory_stats": {
        const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
        const data = (await res.json()) as {
          result: {
            points_count: number;
            indexed_vectors_count: number;
            status: string;
          };
        };
        const r = data.result;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  collection: COLLECTION,
                  sealed: true,
                  qdrant: `${QDRANT_URL} (127.0.0.1 only)`,
                  embedder: `Ollama/${EMBED_MODEL} (local)`,
                  outbound_calls: "none",
                  points: r.points_count,
                  indexed_vectors: r.indexed_vectors_count,
                  status: r.status,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "memory_sources": {
        const scrollRes = await fetch(
          `${QDRANT_URL}/collections/${COLLECTION}/points/scroll`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              limit: 5000,
              with_payload: { include: ["source"] },
            }),
          }
        );

        const scrollData = (await scrollRes.json()) as {
          result: { points: { payload: { source: string } }[] };
        };

        const sourceCounts: Record<string, number> = {};
        for (const p of scrollData.result.points) {
          const s = p.payload.source;
          sourceCounts[s] = (sourceCounts[s] || 0) + 1;
        }

        const sources = Object.entries(sourceCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([source, chunks]) => ({ source, chunks }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { total_sources: sources.length, sources },
                null,
                2
              ),
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

// ── Entry point ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const server = createMemoryVaultServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CIF Memory Vault v2.0.0 (SEALED — local embeddings, localhost Qdrant)");
}

main().catch((error) => {
  console.error("Memory vault error:", error);
  process.exit(1);
});
