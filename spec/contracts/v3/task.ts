/**
 * OMC v3 — Task Contract ("Law")
 *
 * Canonical schema for a unit of work assigned within OMC.
 * Must NOT import from src/**; this is pure "Law", no runtime.
 */
import { z } from "zod";

export const TaskPrioritySchema = z.enum(["low", "normal", "high", "critical"]);

export const TaskSchema = z.object({
  id: z.string().uuid().describe("Stable unique identifier for this task"),
  title: z.string().min(1).max(200).describe("Short task title"),
  description: z.string().optional().describe("Detailed task description"),
  assignedTo: z.string().optional().describe("Agent ID this task is assigned to"),
  priority: TaskPrioritySchema.default("normal").describe("Execution priority"),
  gate: z
    .enum(["SAFE", "ARMED"])
    .default("SAFE")
    .describe("Gate required to execute this task"),
  completed: z.boolean().default(false).describe("Completion status"),
  lessonMemo: z
    .string()
    .optional()
    .describe("Mandatory 'Lesson Learned' memo (required before shipping)"),
  createdAt: z.string().datetime().describe("ISO-8601 creation timestamp"),
  completedAt: z
    .string()
    .datetime()
    .optional()
    .describe("ISO-8601 completion timestamp"),
});

export type Task = z.infer<typeof TaskSchema>;
