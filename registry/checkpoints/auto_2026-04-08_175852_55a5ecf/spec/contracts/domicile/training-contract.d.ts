import { z } from "zod";
export declare const TrainingContractSchema: any;
export type TrainingContract = z.infer<typeof TrainingContractSchema>;
export declare const AMEMTrainingContract: TrainingContract;
export type ReasoningPhase = "big-picture-scan" | "targeted-deep-dive" | "cross-domain-synthesis" | "reflection-crystallization";
export interface ReasoningTrace {
    phase: ReasoningPhase;
    timestamp: number;
    input: unknown;
    output: Record<string, unknown>;
    reasoning: {
        observations: string[];
        assumptions: string[];
        connections: Array<{
            from: string;
            to: string;
            type: "analysis" | "synthesis" | "validation";
        }>;
        insights: string[];
    };
    confidence: number;
}
export interface TrainingExample {
    id: string;
    contractId: string;
    domain: string;
    input: unknown;
    reasoningTrace: ReasoningTrace[];
    output: unknown;
    quality: {
        qvscaScore: number;
        executionTime: number;
        success: boolean;
        error?: string;
    };
    metadata: {
        timestamp: number;
        agentVersion: string;
        environment: string;
        userId?: string;
    };
}
export interface SynthesisPattern {
    id: string;
    pattern: string;
    domains: string[];
    confidence: number;
    examples: TrainingExample[];
    extractionMethod: "automated" | "manual" | "hybrid";
    lastUpdated: number;
}
export interface QVSCAAuditResult {
    cvc_score: number;
    details?: Record<string, unknown>;
}
export interface TrainingContractExecutionResult {
    result: unknown;
    trainingData: TrainingExample[];
    qvscaAudit: QVSCAAuditResult;
    entropy: number;
    synthesisPattern: SynthesisPattern;
}
export interface TrainingContractExecutorDeps {
    auditContract?: (payload: Record<string, unknown>) => Promise<QVSCAAuditResult>;
    ingestPositive?: (examples: TrainingExample[]) => Promise<void>;
    ingestNegative?: (examples: TrainingExample[]) => Promise<void>;
    now?: () => number;
    random?: () => number;
}
export declare class TrainingContractExecutor {
    private readonly auditContract;
    private readonly ingestPositive;
    private readonly ingestNegative;
    private readonly now;
    private readonly random;
    constructor(deps?: TrainingContractExecutorDeps);
    execute(contract: TrainingContract, input: Record<string, unknown>): Promise<TrainingContractExecutionResult>;
    private buildReasoningTrace;
    private executePhaseLogic;
    private buildTrainingExamples;
    private buildSynthesisPattern;
    private calculateEntropy;
    private tokenizeExamples;
}
export declare const AMEM_TrainingContract: z.infer<any>;
