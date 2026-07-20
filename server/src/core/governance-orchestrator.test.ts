/**
 * CG-010 — Mediated spine conformance (positive + negative).
 * Bridge/LawCRON are intentionally not exercised; they remain non-authoritative for Cin-Gen.
 */

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getContract } from "../../../spec/contracts/index.js";
import { ExecutionAuthorizationSchema } from "../../../spec/contracts/v3/execution-authorization.js";
import { GovernanceOrchestrator } from "./orchestrator.js";
import { JsonlFileAuditSink } from "./audit-sink.js";

function futureExpiry(hours = 1): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

function pastExpiry(): string {
  return new Date(Date.now() - 3600_000).toISOString();
}

function armedAuth(overrides: Record<string, unknown> = {}) {
  return {
    name: "cin-gen-test-auth",
    gate: "ARMED" as const,
    reversible: false,
    scope: "render.pass",
    expiry: futureExpiry(),
    owner: "director@example.com",
    approval: {
      approvedBy: "director@example.com",
      approvedAt: new Date().toISOString(),
      approvalId: "apr-1",
    },
    input: {},
    ...overrides,
  };
}

test("Law registry exposes omc.v3.execution-authorization", () => {
  const entry = getContract("omc.v3.execution-authorization");
  assert.ok(entry);
  assert.equal(entry?.id, "omc.v3.execution-authorization");
  assert.equal(entry?.schema, ExecutionAuthorizationSchema);
});

test("Valid ARMED + matching action + future expiry + approval → allow + durable receipt", async () => {
  const auditPath = path.join(
    os.tmpdir(),
    `omc-spine-test-allow-${Date.now()}.jsonl`
  );
  const sink = new JsonlFileAuditSink(auditPath);
  const orch = new GovernanceOrchestrator({ auditSink: sink });

  const result = await orch.executeContract({
    authorization: armedAuth(),
    action: "render.pass",
    stateChanging: true,
  });

  assert.equal(result.success, true);
  assert.equal(result.receipt.decision, "ALLOW");
  assert.equal(result.receipt.mediated, true);
  assert.equal(result.receipt.worldMutated, false);
  assert.equal(result.output?.mediated, true);

  sink.close();
  const lines = fs.readFileSync(auditPath, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  const durable = JSON.parse(lines[0]!);
  assert.equal(durable.decision, "ALLOW");
  assert.equal(durable.worldMutated, false);
  fs.unlinkSync(auditPath);
  orch.dispose();
});

test("Expired ARMED → deny + receipt", async () => {
  const auditPath = path.join(
    os.tmpdir(),
    `omc-spine-test-exp-${Date.now()}.jsonl`
  );
  const sink = new JsonlFileAuditSink(auditPath);
  const orch = new GovernanceOrchestrator({ auditSink: sink });
  const result = await orch.executeContract({
    authorization: armedAuth({ expiry: pastExpiry() }),
    action: "render.pass",
    stateChanging: true,
  });
  assert.equal(result.success, false);
  assert.equal(result.receipt.decision, "DENY");
  assert.match(result.receipt.reason, /expired/i);
  sink.close();
  fs.unlinkSync(auditPath);
  orch.dispose();
});

test("Scope ≠ action → deny", async () => {
  const orch = new GovernanceOrchestrator();
  const result = await orch.executeContract({
    authorization: armedAuth({ scope: "render.pass" }),
    action: "render.other",
    stateChanging: true,
  });
  assert.equal(result.success, false);
  assert.equal(result.receipt.decision, "DENY");
  assert.match(result.receipt.reason, /outside ARMED scope/i);
  orch.dispose();
});

test("Missing owner / approval → deny", async () => {
  const orch = new GovernanceOrchestrator();
  const noOwner = await orch.executeContract({
    authorization: armedAuth({ owner: undefined }),
    action: "render.pass",
    stateChanging: true,
  });
  assert.equal(noOwner.success, false);
  assert.match(noOwner.receipt.reason, /owner/i);

  const noApproval = await orch.executeContract({
    authorization: armedAuth({ approval: undefined }),
    action: "render.pass",
    stateChanging: true,
  });
  assert.equal(noApproval.success, false);
  assert.match(noApproval.receipt.reason, /approval/i);
  orch.dispose();
});

test("SAFE + stateChanging → deny", async () => {
  const orch = new GovernanceOrchestrator();
  const result = await orch.executeContract({
    authorization: {
      name: "safe-obs",
      gate: "SAFE",
      reversible: true,
      input: {},
    },
    action: "observe",
    stateChanging: true,
  });
  assert.equal(result.success, false);
  assert.equal(result.receipt.decision, "DENY");
  assert.match(result.receipt.reason, /SAFE gate forbids/i);
  orch.dispose();
});

test("Missing scope/expiry fields → deny", async () => {
  const orch = new GovernanceOrchestrator();
  const noScope = await orch.executeContract({
    authorization: armedAuth({ scope: undefined }),
    action: "render.pass",
    stateChanging: true,
  });
  assert.equal(noScope.success, false);
  assert.match(noScope.receipt.reason, /scope/i);

  const noExpiry = await orch.executeContract({
    authorization: armedAuth({ expiry: undefined }),
    action: "render.pass",
    stateChanging: true,
  });
  assert.equal(noExpiry.success, false);
  assert.match(noExpiry.receipt.reason, /expiry/i);
  orch.dispose();
});

test("SAFE non-mutating observation → allow", async () => {
  const orch = new GovernanceOrchestrator();
  const result = await orch.executeContract({
    authorization: {
      name: "safe-obs",
      gate: "SAFE",
      reversible: true,
      input: {},
    },
    action: "observe",
    stateChanging: false,
  });
  assert.equal(result.success, true);
  assert.equal(result.receipt.decision, "ALLOW");
  assert.equal(result.receipt.worldMutated, false);
  orch.dispose();
});
