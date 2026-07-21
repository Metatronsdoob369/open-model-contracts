/**
 * CG-011 — Capability-derived effects + exact resource binding.
 * CG-010 regressions: expiry and approval-metadata denials remain covered.
 *
 * Bridge/LawCRON are intentionally not exercised.
 */

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getContract } from "../../../spec/contracts/index.js";
import {
  ActionCatalogEntrySchema,
  deriveEffectFacts,
  ResourceRefSchema,
} from "../../../spec/contracts/v3/admitted-action.js";
import { ExecutionAuthorizationSchema } from "../../../spec/contracts/v3/execution-authorization.js";
import { MapActionCatalog } from "./action-catalog.js";
import { GovernanceOrchestrator } from "./orchestrator.js";
import { JsonlFileAuditSink } from "./audit-sink.js";

function futureExpiry(hours = 1): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

function pastExpiry(): string {
  return new Date(Date.now() - 3600_000).toISOString();
}

const SCENE_REF = { resourceType: "scene", resourceId: "shot-001" };

function testCatalog() {
  return new MapActionCatalog([
    {
      actionId: "observe.scene",
      adapterId: "cin-gen.test-jurisdiction",
      version: "1.0.0",
      effectClass: "READ_ONLY",
      declaredResourceTypes: ["scene"],
      admitted: true,
    },
    {
      actionId: "render.pass",
      adapterId: "cin-gen.test-jurisdiction",
      version: "1.0.0",
      effectClass: "STATE_CHANGE",
      declaredResourceTypes: ["scene"],
      admitted: true,
    },
    {
      actionId: "delete.scene",
      adapterId: "cin-gen.test-jurisdiction",
      version: "1.0.0",
      effectClass: "IRREVERSIBLE",
      declaredResourceTypes: ["scene"],
      admitted: true,
    },
    {
      actionId: "disabled.action",
      adapterId: "cin-gen.test-jurisdiction",
      version: "1.0.0",
      effectClass: "STATE_CHANGE",
      declaredResourceTypes: ["scene"],
      admitted: false,
    },
  ]);
}

function orch(auditPath?: string) {
  const sink = auditPath ? new JsonlFileAuditSink(auditPath) : undefined;
  return {
    orch: new GovernanceOrchestrator({
      actionCatalog: testCatalog(),
      auditSink: sink,
    }),
    sink,
  };
}

function safeAuth(overrides: Record<string, unknown> = {}) {
  return {
    name: "safe-obs",
    gate: "SAFE" as const,
    actionId: "observe.scene",
    resourceRef: { ...SCENE_REF },
    input: {},
    ...overrides,
  };
}

function armedAuth(overrides: Record<string, unknown> = {}) {
  return {
    name: "cin-gen-test-auth",
    gate: "ARMED" as const,
    actionId: "render.pass",
    resourceRef: { ...SCENE_REF },
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

// ─── Registry / Law shape ────────────────────────────────────────────────────

test("Law registry exposes execution-authorization 3.1.0 and action-catalog-entry", () => {
  const ea = getContract("omc.v3.execution-authorization");
  assert.ok(ea);
  assert.equal(ea?.version, "3.1.0");
  assert.equal(ea?.schema, ExecutionAuthorizationSchema);

  const ace = getContract("omc.v3.action-catalog-entry");
  assert.ok(ace);
  assert.equal(ace?.id, "omc.v3.action-catalog-entry");
  assert.equal(ace?.schema, ActionCatalogEntrySchema);
});

test("deriveEffectFacts: READ_ONLY / STATE_CHANGE / IRREVERSIBLE", () => {
  assert.deepEqual(deriveEffectFacts("READ_ONLY"), {
    stateChanging: false,
    reversible: null,
  });
  assert.deepEqual(deriveEffectFacts("STATE_CHANGE"), {
    stateChanging: true,
    reversible: true,
  });
  assert.deepEqual(deriveEffectFacts("IRREVERSIBLE"), {
    stateChanging: true,
    reversible: false,
  });
});

test("IRREVERSIBLE always derives stateChanging: true", () => {
  assert.equal(deriveEffectFacts("IRREVERSIBLE").stateChanging, true);
});

test("Unknown effect fields rejected (.strict)", () => {
  const entry = ActionCatalogEntrySchema.safeParse({
    actionId: "x",
    adapterId: "j",
    version: "1",
    effectClass: "READ_ONLY",
    declaredResourceTypes: ["scene"],
    admitted: true,
    stateChanging: false,
  });
  assert.equal(entry.success, false);

  const auth = ExecutionAuthorizationSchema.safeParse({
    ...safeAuth(),
    reversible: true,
  });
  assert.equal(auth.success, false);

  const wild = ResourceRefSchema.safeParse({
    resourceType: "scene",
    resourceId: "shot-*",
    wildcard: true,
  });
  assert.equal(wild.success, false);
});

test("Incomplete ARMED payload fails canonical Zod/OMC_REGISTRY validation", () => {
  const noOwner = ExecutionAuthorizationSchema.safeParse(
    armedAuth({ owner: undefined })
  );
  assert.equal(noOwner.success, false);

  const noApproval = ExecutionAuthorizationSchema.safeParse(
    armedAuth({ approval: undefined })
  );
  assert.equal(noApproval.success, false);

  const noExpiry = ExecutionAuthorizationSchema.safeParse(
    armedAuth({ expiry: undefined })
  );
  assert.equal(noExpiry.success, false);

  const noResource = ExecutionAuthorizationSchema.safeParse(
    armedAuth({ resourceRef: undefined })
  );
  assert.equal(noResource.success, false);

  // Registry schema is the same object
  const entry = getContract("omc.v3.execution-authorization");
  assert.equal(entry?.schema.safeParse(armedAuth({ owner: undefined })).success, false);
});

// ─── Runtime gate (catalog + resource binding) ───────────────────────────────

test("Unknown action denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth({ actionId: "unknown.action" }),
    actionId: "unknown.action",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Unknown action/i);
  o.dispose();
});

test("Disabled action denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({ actionId: "disabled.action" }),
    actionId: "disabled.action",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /disabled|not admitted/i);
  o.dispose();
});

test("READ_ONLY action with SAFE allows", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth(),
    actionId: "observe.scene",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, true);
  assert.equal(result.receipt.decision, "ALLOW");
  assert.equal(result.receipt.effectClass, "READ_ONLY");
  assert.equal(result.receipt.stateChanging, false);
  assert.equal(result.receipt.reversible, null);
  assert.equal(result.receipt.worldMutated, false);
  o.dispose();
});

test("READ_ONLY never enters a mutating execution path", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth(),
    actionId: "observe.scene",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, true);
  assert.equal(result.receipt.stateChanging, false);
  assert.notEqual(result.receipt.route, "DENY");
  // No adapter dispatch exists; receipt remains honest.
  assert.equal(result.receipt.mediated, true);
  assert.equal(result.receipt.worldMutated, false);
  o.dispose();
});

test("STATE_CHANGE action with SAFE denies without trusting a caller boolean", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth({ actionId: "render.pass" }),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /SAFE gate forbids state-changing/i);
  assert.equal(result.receipt.effectClass, "STATE_CHANGE");
  o.dispose();
});

test("IRREVERSIBLE action with SAFE denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth({ actionId: "delete.scene" }),
    actionId: "delete.scene",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /SAFE gate forbids state-changing/i);
  assert.equal(result.receipt.effectClass, "IRREVERSIBLE");
  assert.equal(result.receipt.stateChanging, true);
  assert.equal(result.receipt.reversible, false);
  o.dispose();
});

test("Valid ARMED state-changing action with exact resource allows", async () => {
  const auditPath = path.join(
    os.tmpdir(),
    `omc-cg011-allow-${Date.now()}.jsonl`
  );
  const { orch: o, sink } = orch(auditPath);

  const result = await o.executeContract({
    authorization: armedAuth(),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });

  assert.equal(result.success, true);
  assert.equal(result.receipt.decision, "ALLOW");
  assert.equal(result.receipt.effectClass, "STATE_CHANGE");
  assert.equal(result.receipt.stateChanging, true);
  assert.equal(result.receipt.reversible, true);
  assert.equal(result.receipt.actionVersion, "1.0.0");
  assert.equal(result.receipt.adapterId, "cin-gen.test-jurisdiction");
  assert.deepEqual(result.receipt.resourceRef, SCENE_REF);
  assert.equal(result.receipt.mediated, true);
  assert.equal(result.receipt.worldMutated, false);

  sink!.close();
  const durable = JSON.parse(fs.readFileSync(auditPath, "utf8").trim());
  assert.equal(durable.effectClass, "STATE_CHANGE");
  assert.equal(durable.worldMutated, false);
  fs.unlinkSync(auditPath);
  o.dispose();
});

test("Action mismatch denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({ actionId: "render.pass" }),
    actionId: "delete.scene",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Action mismatch/i);
  o.dispose();
});

test("Undeclared resource type denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({
      resourceRef: { resourceType: "camera", resourceId: "cam-1" },
    }),
    actionId: "render.pass",
    resourceRef: { resourceType: "camera", resourceId: "cam-1" },
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /not declared/i);
  o.dispose();
});

test("Resource-type mismatch denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({
      resourceRef: { resourceType: "scene", resourceId: "shot-001" },
    }),
    actionId: "render.pass",
    resourceRef: { resourceType: "camera", resourceId: "shot-001" },
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Resource mismatch/i);
  o.dispose();
});

test("Resource-ID mismatch denies", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({
      resourceRef: { resourceType: "scene", resourceId: "shot-001" },
    }),
    actionId: "render.pass",
    resourceRef: { resourceType: "scene", resourceId: "shot-999" },
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Resource mismatch/i);
  o.dispose();
});

test("Exact resource mismatch denies (auth vs request)", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({
      resourceRef: { resourceType: "scene", resourceId: "a" },
    }),
    actionId: "render.pass",
    resourceRef: { resourceType: "scene", resourceId: "b" },
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Resource mismatch/i);
  o.dispose();
});

test("Caller-supplied effect facts rejected on request", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: safeAuth(),
    actionId: "observe.scene",
    resourceRef: SCENE_REF,
    stateChanging: true,
  } as any);
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /Caller-supplied effect fact/i);
  o.dispose();
});

test("Caller cannot override catalog effectClass via authorization extras", () => {
  const parsed = ExecutionAuthorizationSchema.safeParse({
    ...armedAuth(),
    effectClass: "READ_ONLY",
  });
  assert.equal(parsed.success, false);
});

test("Receipt records catalog-derived effectClass", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth(),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.receipt.effectClass, "STATE_CHANGE");
  assert.equal(result.output?.effectClass, "STATE_CHANGE");
  o.dispose();
});

// ─── CG-010 regressions ──────────────────────────────────────────────────────

test("Expired ARMED → deny + receipt", async () => {
  const { orch: o } = orch();
  const result = await o.executeContract({
    authorization: armedAuth({ expiry: pastExpiry() }),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(result.success, false);
  assert.match(result.receipt.reason, /expired/i);
  o.dispose();
});

test("Missing owner / approval → Zod deny (structural ARMED)", async () => {
  const { orch: o } = orch();
  const noOwner = await o.executeContract({
    authorization: armedAuth({ owner: undefined }),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(noOwner.success, false);
  assert.match(noOwner.receipt.reason, /schema validation failed|owner/i);

  const noApproval = await o.executeContract({
    authorization: armedAuth({ approval: undefined }),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(noApproval.success, false);
  assert.match(noApproval.receipt.reason, /schema validation failed|approval/i);
  o.dispose();
});

test("Missing scope/expiry fields → deny (expiry via Zod; actionId required)", async () => {
  const { orch: o } = orch();
  const noExpiry = await o.executeContract({
    authorization: armedAuth({ expiry: undefined }),
    actionId: "render.pass",
    resourceRef: SCENE_REF,
  });
  assert.equal(noExpiry.success, false);
  assert.match(noExpiry.receipt.reason, /schema validation failed|expiry/i);
  o.dispose();
});
