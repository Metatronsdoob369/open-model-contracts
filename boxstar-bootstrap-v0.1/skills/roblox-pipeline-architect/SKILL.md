---
name: roblox-pipeline-architect
description: Architecture and technical specification generator for the Roblox AI game generation pipeline (Superbullet, Rojo, 3072-D Embedder, Qdrant, 3D Shatter Map, Swarm, Eve). Use when designing new pipeline components, writing constraint systems, creating repair engine specs, generating DevOps execution plans, or conducting parallel deep research on Roblox game components.
license: OMC Diamond-Stable
---

# Roblox Pipeline Architect

This skill provides the procedural knowledge and architectural context for designing, expanding, and documenting the AI-driven Roblox game generation pipeline. 

## Pipeline Architecture Context

Before making any architectural recommendations or writing execution plans, you must understand the current stack. 
**DO NOT** assume standard Roblox development workflows (e.g., manual Studio building, Git-as-contract). 

The pipeline operates as an AI game generation and repair engine:
1. **Superbullet AI**: Generates a primer game (playable but glitchy binary `.rbxl`).
2. **Rojo**: Deserializes the binary into readable Lua/JSON (used strictly as a format converter, not a live sync tool).
3. **3072-D Embedder**: Processes the spatial geometry and script logic into high-dimensional vectors (Spectral-GAT level).
4. **Qdrant**: Vector store that indexes the embeddings across hundreds of games.
5. **3D Shatter Map**: Interactive visualization layer reading from Qdrant to highlight spatial/logic fractures.
6. **The Swarm**: Constraint-based repair agents that use Qdrant nearest-neighbor queries for example-based generative repair.
7. **Eve**: The orchestrator managing the entire flow.

Refer to `ARCHITECTURE.md` for full details on each component and their interactions.

## Core Workflows

### 1. Parallel Deep Research (PDR) & DevOps Planning
When asked to evaluate game components or build an execution plan:
1. Use parallel agents across distinct sectors (e.g., Monetization, AI NPCs, Core Loop).
2. Synthesize findings into a consolidated report.
3. Restructure the findings into a **Senior DevOps Execution Plan** using `templates/execution-plan-template.md`.
4. Generate dependency diagrams (Mermaid) and timelines.

### 2. Constraint System Design
When asked to fix spatial or relational errors (e.g., floating trees, sub-floor spawns, clipping windows):
1. Recognize these as **constraint satisfaction failures**, not logic bugs.
2. Refer to the `structural_coherence.json` library for CFrame/Part rules.
3. Design a deterministic repair pipeline using the Swarm agents (Surveyor, Architect, Landscaper, Inspector).
4. Define the Qdrant feedback loop where successful repairs become future templates.

### 3. Technical Specification Generation
When writing detailed specs for a pipeline component:
1. Use the standard tech spec template.
2. Include explicit data schemas (e.g., JSON constraint definitions).
3. Generate supporting visualizations (architecture diagrams, flowcharts, heat maps).
4. Define clear priority ordering based on implementation complexity.

## Output Quality Standards

- **Visualizations are mandatory**: Always support your plans and specs with high-quality architecture diagrams (Mermaid) or data visualizations.
- **Senior-level tone**: Write as a Staff/Principal Engineer or Senior DevOps Architect. Focus on deterministic behavior, latency budgets, state mutation rates, and scalability.
- **No hand-waving**: Provide concrete implementation paths, not just conceptual metaphors.
