import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import fs from 'fs';
import path from 'path';

// ── Part 0: Recursive Structural Tree ───────────────────────────────────────
// This allows the Roblox Bridge to recursively rehydrate the entire Workspace.
export const InstanceNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    properties: z.record(z.any()).default({}),
    children: z.array(InstanceNodeSchema).default([])
  })
);

// ── Part A: Metadata & Engine Governance ────────────────────────────────────
export const MetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  targetEngine: z.literal("Roblox"),
  targetPlatforms: z.array(z.enum(["Desktop", "Mobile", "Console"])).default(["Desktop"]),
  createdBy: z.string().optional(),
  hash: z.string().optional() // THE INTEGRITY SEAL
});

// ── Part B: Visual Contract ─────────────────────────────────────────────────
export const VisualContractSchema = z.object({
  intent: z.string(),
  aesthetic: z.string(),
  cameraView: z.string(),
  targetResolution: z.string().optional()
});

// ── Part C: Property Audit (The Deterministic Ledger) ────────────────────────
export const PropertyAuditItemSchema = z.object({
  id: z.string(),
  componentId: z.string(),
  propertyPath: z.string(),
  expectedValue: z.any(),
  reason: z.string(),
  visualFeature: z.string() // THE HEART: Link to visual intent
});

export const PropertyAuditSchema = z.object({
  items: z.array(PropertyAuditItemSchema)
});

// ── Part D: Capability Mapping ──────────────────────────────────────────────
export const CapabilityMappingSchema = z.object({
  mappings: z.array(z.object({
    feature: z.string(),
    enabledByComponentId: z.string(),
    requiredService: z.string().optional(),
    constraints: z.array(z.string()).default([])
  }))
});

// ── THE REFINED CONSTITUTION: VCS Contract V2 ───────────────────────────────
export const VCSContract = z.object({
  metadata: MetadataSchema,
  visualContract: VisualContractSchema,
  structuralSpec: z.object({
    root: InstanceNodeSchema
  }),
  propertyAudit: PropertyAuditSchema,
  capabilityMapping: CapabilityMappingSchema,
  validationStatus: z.object({
    status: z.enum(["Buildable", "Partial", "Blocked"]),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
  })
});

export type VCS = z.infer<typeof VCSContract>;

// ── AUTO-GRADUATION ────────────────────────────────────────────────────────
export function graduateContract() {
  const jsonSchema = zodToJsonSchema(VCSContract, "VisualContractSpecV2");
  const targetPath = path.join(process.cwd(), 'spec/json-schema/vcs.schema.json');
  
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }
  
  fs.writeFileSync(targetPath, JSON.stringify(jsonSchema, null, 2));
  console.log(`💎 [GRADUATION] VCS Contract V2 exported to: ${targetPath}`);
}
