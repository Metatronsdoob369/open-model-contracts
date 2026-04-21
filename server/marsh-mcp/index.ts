#!/usr/bin/env node
/**
 * OMC Marsh MCP Server
 *
 * Drop this into Marsh's Claude Code config so his Claude can submit
 * game files without ever touching git, GitHub auth, or the terminal.
 *
 * Tools exposed:
 *   submit_work  — send files to Joe's bridge, auto-branch + PR
 *   check_status — see what branch Joe's repo is on + last commit
 *
 * Config (claude_desktop_config.json or .claude/mcp.json):
 * {
 *   "mcpServers": {
 *     "omc-marsh": {
 *       "command": "node",
 *       "args": ["/path/to/marsh-mcp/dist/index.js"],
 *       "env": {
 *         "OMC_BRIDGE_URL": "http://<JOE_LOCAL_IP>:8080"
 *       }
 *     }
 *   }
 * }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createHmac } from 'node:crypto';
import { z } from 'zod';

const BRIDGE_URL = process.env['OMC_BRIDGE_URL'] ?? 'http://localhost:8080';
const SUBMIT_KEY = process.env['OMC_SUBMIT_KEY'] ?? '';
const SUBMIT_HMAC = process.env['OMC_SUBMIT_HMAC'] ?? '';

function signPayload(body: unknown): string {
  return createHmac('sha256', SUBMIT_HMAC).update(JSON.stringify(body)).digest('hex');
}

function authHeaders(body: unknown): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-omc-key': SUBMIT_KEY,
    'x-omc-sig': signPayload(body),
  };
}

const server = new McpServer({
  name: 'omc-marsh',
  version: '1.0.0',
});

// ── Tool: submit_work ─────────────────────────────────────────────────────────
server.tool(
  'submit_work',
  'Submit game files to the OMC repo. Creates a branch, commits, and opens a PR automatically. No git required.',
  {
    intent: z.string().describe('What you built — e.g. "added jetpack mechanic"'),
    files: z
      .array(
        z.object({
          path: z
            .string()
            .describe(
              'Repo-relative path, must start with src/server/, src/client/, or generated/'
            ),
          content: z.string().describe('Full file content as a string'),
        })
      )
      .min(1)
      .describe('Files to submit'),
    author: z
      .string()
      .optional()
      .default('Marsh')
      .describe('Your name — used in branch name and commit'),
  },
  async ({ intent, files, author }) => {
    try {
      const payload = { author, intent, files };
      const resp = await fetch(`${BRIDGE_URL}/submit`, {
        method: 'POST',
        headers: authHeaders(payload),
        body: JSON.stringify(payload),
      });

      const data = (await resp.json()) as Record<string, unknown>;

      if (!resp.ok) {
        return {
          content: [
            {
              type: 'text',
              text: `Submit failed (${resp.status}): ${data['error'] ?? 'unknown error'}\n${data['detail'] ?? ''}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: [
              `✅ Submitted successfully!`,
              ``,
              `Branch: ${data['branch']}`,
              `Files written: ${data['files_written']}`,
              ``,
              `PR: ${data['pr_url']}`,
              ``,
              `CI is running. Joe will merge when it's green.`,
            ].join('\n'),
          },
        ],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed — is Joe's bridge running?\nError: ${msg}\nBridge URL: ${BRIDGE_URL}`,
          },
        ],
      };
    }
  }
);

// ── Tool: check_status ────────────────────────────────────────────────────────
server.tool(
  'check_status',
  'Check the current state of the OMC repo — what branch Joe is on and the last commit.',
  {},
  async () => {
    try {
      const resp = await fetch(`${BRIDGE_URL}/submit/status`);
      const data = (await resp.json()) as Record<string, unknown>;

      if (!data['ok']) {
        return {
          content: [{ type: 'text', text: 'Bridge is up but git status unavailable.' }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: [
              `Bridge: online`,
              `Branch: ${data['branch']}`,
              `Last commit: ${data['last_commit']}`,
            ].join('\n'),
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: `Bridge offline or unreachable at ${BRIDGE_URL}`,
          },
        ],
      };
    }
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
