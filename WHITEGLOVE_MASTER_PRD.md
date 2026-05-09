# PRD: WHITEGLOVE SOVEREIGN INTELLIGENCE (V1.0)
## Project: The "Frankenstein" Synthesis (OpenClaw + Hermes + Claude Code)

> [!IMPORTANT]
> **LLM DIRECTIVE**: This document is the primary instruction for completing the WhiteGlove Agent. Do not deviate from this architecture. All data and logic must converge into the `Sovereign_WhiteGlove_Framework/` package.

### 1. MISSION OBJECTIVE
To manifest a standalone, air-gapped Medical Reasoning Agent that obsoletes fine-tuning through **Dynamic Landmark Navigation.** The product must be portable, sovereign, and zero-hallucination.

### 2. ARCHITECTURAL PILLARS
1. **THE SUBSTRATE (OpenClaw DNA)**: 15,580 MedlinePlus canonical JSON shards. 
   - *Logic*: SimHash-128 indexing with O(1) Hot-Key Ring Buffer.
   - *Constraint*: Strict ℓ2-Normalization on all 3072-D vectors (Neutralize Qubit Poison).
2. **THE NEURAL CORE (Hermes DNA)**: Local Ollama (Hermes-3-7B / Qwen2.5-Coder).
   - *Logic*: **Option C (Faith-Less Retrieval).** The agent is mathematically barred from generating text without a verified shard citation.
3. **THE BRAIN STEM (Claude Code DNA)**: Autonomous Tool-Use & Self-Correction.
   - *Logic*: Recursive Probe Loop. The agent asks clarifying questions if Hamming Ratio > 0.3 before answering.

### 3. CONVERGENCE MAP (DATA + CODE)
The following pieces must be moved from the Broseidon Node (Pi) back to the main framework folder on the Mac to create the "Unified Package":

| Component | Source Path (Broseidon) | Target Path (Framework) |
|-----------|------------------------|-------------------------|
| **The Shards** | `~/.../shards/medical_clean/` | `/data/vector_blocks/medical/` |
| **The Index** | `husk.index` | `/data/indices/medical.index` |
| **The Engine** | `landmark-orchestrator.ts` | `/core/husk_engine.ts` |
| **The Gateway** | `telegram-agent.ts` | `/interfaces/telegram_gateway.ts` |
| **The Pulse** | `circadian/pulse.ts` | `/interfaces/circadian_pulse.ts` |

### 4. IMPLEMENTATION ROADMAP
1. **STEP 1 (CONSOLIDATE)**: Pull the 1.9GB shard library from the Pi into the `/data/` directory of the new framework.
2. **STEP 2 (RE-RESONANCE)**: Execute the `broseidon-indexer.ts` logic to lock the 15,580 landmarks in the new environment.
3. **STEP 3 (AUTONOMY)**: Implement the **Claude-Style Recursive Loop**. If query results are ambiguous, the agent must trigger a `clarification_request` back to the user.
4. **STEP 4 (DEPLOY)**: Activate the **Hermes Gateway** (Telegram/CLI) to allow the "WhiteGlove Agent" to be queryable as a single service.

### 5. SUCCESS METRICS
- **TTFT**: < 100ms for Hot-Path queries.
- **Fidelity**: > 0.95 (Zero Hallucination verified).
- **Sovereignty**: 100% air-gapped capability.

---
**END OF DIRECTIVE**
*Context Binding Hash: 0xDEADBEEF_SOVEREIGN_2026*
