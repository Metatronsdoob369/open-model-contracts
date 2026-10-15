import { z } from "zod";

/**
 * OMC v3 — Specialist Agent Schema
 *
 * Defines the strict I/O and Feedback loop constraints for a Specialist Agent.
 * A Specialist is defined by its ability to recursively learn via the Circadian Feedback Loop.
 * Without the Feedback schema, it is just a static RAG endpoint, not an OMC Specialist.
 */

export const SpecialistQuerySchema = z.object({
  question: z.string().describe("The natural language query from the client."),
  context: z.string().optional().describe("Task or conversational context surrounding the query."),
  topK: z.number().int().min(1).max(20).default(5).describe("Maximum number of corpus chunks to retrieve."),
  caller: z.string().describe("The identity of the calling agent, pipeline, or system."),
  gate: z.enum(["SAFE", "ARMED"]).describe("Gate state: SAFE (read-only) or ARMED (drives execution)."),
  expiry: z.string().datetime().describe("ISO datetime when the current gate authorization expires."),
  owner: z.string().optional().describe("Must be provided if gate is ARMED, signifying accountability."),
}).superRefine((data, ctx) => {
  if (data.gate === "ARMED" && !data.owner) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Owner MUST be provided when operating in ARMED mode.",
      path: ["owner"]
    });
  }
});

export const SpecialistResponseSchema = z.object({
  queryId: z.string().uuid().describe("Unique tracking ID required for the Circadian Feedback loop."),
  domain: z.string().describe("The specific knowledge domain of the Specialist (e.g., 'ue5-specialist')."),
  answer: z.string().describe("Synthesized domain expert response."),
  confidence: z.number().min(0).max(100).describe("Weighted average confidence of retrieved chunks. 0 if synthesis fails."),
  chunks: z.array(z.object({
    source: z.string().describe("URI or identifier of the source material."),
    excerpt: z.string().describe("The raw text chunk matched."),
    weight: z.number().describe("The current Circadian EMA weight of the chunk at the time of query.")
  })).min(1).describe("Every answer MUST cite at least one source chunk. Hallucination control is mandatory."),
  gate_used: z.enum(["SAFE", "ARMED"]),
  reasoning: z.string().min(50).describe("Transparent reasoning explaining why chunks were chosen and how they formed the answer."),
  execution_metadata: z.object({
    started_at: z.string().datetime(),
    completed_at: z.string().datetime(),
    duration_ms: z.number().int(),
    chunks_retrieved: z.number().int(),
    corpus_size_at_query: z.number().int(),
    circadian_weights_applied: z.boolean().describe("Proves the agent is actively self-learning and scaling weights.")
  })
});

export const SpecialistFeedbackSchema = z.object({
  queryId: z.string().uuid().describe("The targeted query to apply circadian weight adjustments to."),
  outcome: z.enum(["success", "failure", "partial"]).describe("Drives EMA delta. Success amplifies chunks, failure suppresses, partial decays to neutral."),
  caller: z.string().describe("The system reporting the outcome."),
  observedAt: z.string().datetime().describe("When the outcome was realized in production.")
});

export const SpecialistSchema = z.object({
  description: z.string().default("Complete protocol defining the query and mandatory feedback loop representing a Specialist Agent."),
  query: SpecialistQuerySchema,
  response: SpecialistResponseSchema,
  feedback: SpecialistFeedbackSchema
});
