/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  A-MEM: SPECTRAL ENVIRONMENT ACCESS PROTOCOL                           ║
 * ║  Target: Autonomous Swarm Agents (Director, Landscaper, Surveyor)      ║
 * ║  Purpose: Defines the physical topology of the 4D Codebase Landscape   ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

export type InfraStatus = 'ACTIVE' | 'OFFLINE' | 'DEGRADED';

export interface SpectralAccessPayload {
  protocol_version: "Eve_v2";

  // ─────────────────────────────────────────────────────────────────
  // LAYER 1: INFRASTRUCTURE ROUTING (Where the Environment lives)
  // ─────────────────────────────────────────────────────────────────
  infrastructure: {
    qdrant: {
      url: "http://127.0.0.1:6340";
      status: InfraStatus;
      directive: "Use standard REST API for vector search. Do NOT hallucinate a custom SDK.";
    };
    ollama: {
      url: "http://127.0.0.1:11434";
      model: "mxbai-embed-large";
      base_dimensions: 1024;
      status: InfraStatus;
      directive: "Generate embeddings locally. NEVER send code to OpenAI.";
    };
  };

  // ─────────────────────────────────────────────────────────────────
  // LAYER 2: THE 4D LANDSCAPE (The Collections)
  // ─────────────────────────────────────────────────────────────────
  collections: {
    stable_terrain: {
      name: "spectral-heatmap";
      dimensions: 3072;
      math_requirement: "Ollama output (1024-D) MUST be concatenated 3 times to achieve 3072-D [v, v, v]";
      description: "The Canonical Truth. Contains proven scripts, OMC Laws, and graph-level adjacency matrices.";
      query_behavior: "Before writing new code, query this collection with the intended logic to find the 'Nearest Canonical' script. Anchor new logic to the retrieved centroid.";
      payload_schema: {
        file: "string",
        kind: "'canonical' | 'shattered'",
        heat: "number (Manhattan resonance from centroid)",
        shatter: "number (Euclidean distance from centroid)",
        sectorScores: "Record<string, number>",
        deltaVector3d: "number[] | null (The exact vector path to repair if shattered)"
      }
    };

    danger_zones: {
      name: "slop-canon";
      dimensions: 1024;
      math_requirement: "Standard Ollama output (1024-D). No concatenation needed.";
      description: "The historical ledger of all anatomical failures and technical debt.";
      query_behavior: "When a script throws an error, embed the stack trace and query this collection. Retrieve the matched fix to apply autonomous repair.";
      payload_schema: {
        sc_id: "string",
        title: "string",
        status: "string",
        text: "string (The full failure context and correction lesson)"
      }
    };
  };

  // ─────────────────────────────────────────────────────────────────
  // LAYER 3: AGENTIC DIRECTIVES (How to 'Experience' the Code)
  // ─────────────────────────────────────────────────────────────────
  operational_directives: [
    {
      action: "PRE_FLIGHT_CHECK",
      trigger: "Before emitting any new Luau code.",
      execution: "Query the 'spectral-heatmap' collection to verify your intended architecture does not violate OMC Laws or duplicate existing Canonical terrain."
    },
    {
      action: "SHATTER_RESOLUTION",
      trigger: "When a module's 'shatter' score exceeds 0.05.",
      execution: "Extract the 'deltaVector3d' from the payload. This vector provides the exact topological translation required to move the shattered code back into alignment with its 'deltaTarget'."
    },
    {
      action: "SLOP_AVOIDANCE",
      trigger: "When using unfamiliar APIs or complex Roblox services (e.g., WeldConstraints, RunService).",
      execution: "Query the 'slop-canon' collection to ensure you are not repeating a historically Canonized mistake."
    }
  ];
}

/**
 * ─────────────────────────────────────────────────────────────────
 * EXAMPLE: HOW TO QUERY THE ENVIRONMENT VIA REST
 * ─────────────────────────────────────────────────────────────────
 * 
 * const response = await fetch(`${payload.infrastructure.qdrant.url}/collections/${payload.collections.stable_terrain.name}/points/search`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     vector: myConcatenated3072DVector,
 *     limit: 3,
 *     with_payload: true
 *   })
 * });
 */
