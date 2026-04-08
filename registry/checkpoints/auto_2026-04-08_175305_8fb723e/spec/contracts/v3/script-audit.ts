import { z } from "zod";
import * as luaparse from "luaparse";
import { ResearchInference } from "./amem-payload.js";

export const TargetEnvironment = z.enum(["Server", "Client", "Shared"]);

export const ScriptAuditSchema = z.object({
  id: z.string().uuid().describe("Unique drop identifier"),
  type: z.literal("script"),
  code: z.string().describe("The raw Luau source from Superbullet"),
  targetEnvironment: TargetEnvironment.describe("Execution boundaries"),
  expectedSlots: z.array(z.string()).describe("The Diamond Memory slots the script claims to use")
}).superRefine((data, ctx) => {
  try {
    // 1. AST Structural Parse
    luaparse.parse(data.code, { locations: true, luaVersion: '5.1' });

    // 2. Static Analysis Checks for Contraband
    
    // Contraband: _G or shared
    const gMatch = data.code.match(/\b(_G|shared)\b/);
    if (gMatch) {
      const line = data.code.substring(0, gMatch.index).split("\n").length;
      const snippet = data.code.split("\n")[line - 1].trim();
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Illegal use of global scope '${gMatch[1]}'. Must route state through Diamond Slots.`,
        path: ["code"],
        params: { line, violationType: "IllegalGlobal", snippet }
      });
    }

    // Contraband: Legacy wait()
    const waitMatch = data.code.match(/\bwait\s*\(/);
    if (waitMatch) {
      const line = data.code.substring(0, waitMatch.index).split("\n").length;
      const snippet = data.code.split("\n")[line - 1].trim();
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Deprecated legacy function wait(). Use task.wait() instead.`,
        path: ["code"],
        params: { line, violationType: "MemoryViolation", snippet }
      });
    }

    // Contraband: Generic require() bypassing Asset Registry
    // Simple check: require(Number) or require(game...)
    // We expect require(OMC.Modules.SlotName) or similar in Diamond setup
    const rMatch = data.code.match(/require\s*\(\s*(\d+|game[^)]*)\)/);
    if (rMatch) {
      const line = data.code.substring(0, rMatch.index).split("\n").length;
      const snippet = data.code.split("\n")[line - 1].trim();
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Contraband require(): Cannot require raw IDs or Roblox globals bypassing OMC Registry.`,
        path: ["code"],
        params: { line, violationType: "MemoryViolation", snippet }
      });
    }

    // 3. Registry Alignment Check (MemPalace Integration)
    // We scan for variables accessing Diamond State and strictly enforce they exist in MemPalace Rooms
    const allValidSlots = ResearchInference.researchData.spatialMemory.rooms.flatMap(room => room.slots);
    
    const slotMatches = [...data.code.matchAll(/OMC\.State\.(\w+)/g)];
    for (const match of slotMatches) {
        const slotName = match[1];
        if (!allValidSlots.includes(slotName)) {
            const line = data.code.substring(0, match.index).split("\n").length;
            const snippet = data.code.split("\n")[line - 1].trim();
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `MemPalace Registry Mismatch: Script accesses slot '${slotName}' which is NOT defined in any Spatial Memory Room.`,
                path: ["code"],
                params: { line, violationType: "RegistryMismatch", snippet }
            });
        }
    }

  } catch (err: any) {
    // Luaparse Syntax error
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Lua Syntax Error: ${err.message}`,
      path: ["code"],
      params: { 
        line: err.line || 0, 
        violationType: "IllegalGlobal", // Default fallthrough for syntax slop
        snippet: `Code structure failed AST parsing at char ${err.index}`
      }
    });
  }
});

export type ScriptAudit = z.infer<typeof ScriptAuditSchema>;
