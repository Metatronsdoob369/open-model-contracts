import { z } from "zod";
import * as luaparse from "luaparse";
import { AssetSchema } from "./asset.js";

export const ScriptContext = z.enum(["Server", "Client", "Shared"]);

// Extend Asset Schema to inherit standard properties, or can be standalone envelope
export const ScriptManifestationSchema = z.object({
  id: z.string().uuid().describe("Unique drop identifier"),
  type: z.literal("script"),
  code: z.string().describe("The raw Luau code from Superbullet"),
  context: ScriptContext.describe("Execution boundaries"),
  requirements: z.array(z.string()).describe("List of Diamond Slots it expects to access")
}).superRefine((data, ctx) => {
  try {
    // 1. AST Structural Parse (Catches missing `end` tags, unclosed brackets, pure slop)
    // We use Luaparse for 5.1/Luau structure validation.
    luaparse.parse(data.code, { 
      locations: true, 
      luaVersion: '5.1' 
    });

    // 2. The Blacklist Logic Checks (Regex/String scans for fail-fast)
    // Scan for _G or shared
    const gMatch = data.code.match(/\b(_G|shared)\b/);
    if (gMatch) {
      const line = data.code.substring(0, gMatch.index).split("\n").length;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Memory Governance Violation: Cannot use ${gMatch[1]}. Route state through Diamond Slots instead.`,
        path: ["code"],
        // Adding line context for The Refiner
        params: { line, index: gMatch.index }
      });
    }

    // Scan for legacy wait()
    const waitMatch = data.code.match(/\bwait\s*\(/);
    if (waitMatch) {
      const line = data.code.substring(0, waitMatch.index).split("\n").length;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Scheduler Violation: Usage of legacy wait(). Must use task.wait() for 2026 compliance.`,
        path: ["code"],
        params: { line, index: waitMatch.index }
      });
    }

    // 3. Diamond Slot Verification (Stubbed Logic)
    // If we have a list of valid slots, we'd cross-reference here.
    // For now, if code references something not in data.requirements, we can throw (this requires AST traversal).

  } catch (err: any) {
    // Catch Luaparse Syntax errors directly
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Syntax Error: Code is not structurally valid Lua -> ${err.message}`,
      path: ["code"],
      params: { 
        line: err.line || 0, 
        column: err.column || 0,
        index: err.index || 0
      }
    });
  }
});

export type ScriptManifestation = z.infer<typeof ScriptManifestationSchema>;
