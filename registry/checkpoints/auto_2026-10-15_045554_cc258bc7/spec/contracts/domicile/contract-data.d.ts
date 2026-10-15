type JsonSchemaDocument = Record<string, unknown>;
declare const CONTRACT_SCHEMA_CATALOG: {
    readonly complianceRule: JsonSchemaDocument;
    readonly influencerNode: JsonSchemaDocument;
    readonly metricDefinition: JsonSchemaDocument;
    readonly rateLimit: JsonSchemaDocument;
    readonly trendSignal: JsonSchemaDocument;
};
export type ContractSchemaId = keyof typeof CONTRACT_SCHEMA_CATALOG;
export declare const AVAILABLE_CONTRACT_SCHEMAS: ReadonlyArray<{
    id: ContractSchemaId;
    title: string;
}>;
export declare function getContractSchema(id: ContractSchemaId): JsonSchemaDocument;
export declare function listContractSchemas(): ContractSchemaId[];
export {};
