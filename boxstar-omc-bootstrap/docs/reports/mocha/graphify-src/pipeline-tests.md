# OMC Pipeline Test Report — 22/22 Passing

## Stats
- suites: 4, tests: 22, passes: 22, failures: 0
- duration: 21ms, passPercent: 100

## Suite 1: Sovereign 4D Spatio-Temporal Orchestrator

### Stage 1: Calculates Topological Fracture Parameters (Shatter Velocity)
- Input: shatter params (0.85, 2.4, 1.2, 1.5)
- Output: velocity > 1.0 (Catastrophic Threshold)
- Assertion: velocity must exceed Catastrophic Threshold (1.0)

### Stage 2: Submits Code Context to 3072-D Ollama Node Engine
- embedWithTime(shatteredCode, trace) → CanonicalNode4D
- graph.upsertNode(node)
- Assertion: node.room === "ROOM-02_WorldState"

### Stage 3: Executes Architectural Cross-Room Rewire (QuadMap Sever & Bridge)
- signal: {sourceRoom: "ROOM_02_WorldState", targetRoom: "Client_Visual", fracturePath: "scriptLoad → characterAdded", contract: "OMC_Bridge_StateSync"}
- rewireRooms(signal) → severs illegal edge, creates governed bridge

### Stage 4: Byproduct Injection - Mutates Zod-Guarded Bridge Payload
- Zod schema guards bridge payload mutation
- Contract enforcement prevents illegal state transitions

### Stage 5: Armed Escrow Validation Gate - Rejects Malformed Payloads
- Escrow gate blocks malformed payloads before session creation
- Returns rejection with reason

### Stage 6: Armed Escrow Validation Gate - Secures Pristine Session
- Pristine payload passes escrow gate
- SHA-256 session manifest created

## Suite 2: Architect Probe: 4D Spatio-Temporal Capability Check

### Shatter-to-Escrow transition in under 20ms (Zero-IO latency)
- Full pipeline: embed → shatter → gate → escrow < 20ms
- No IO in hot path

### Zod-Guarded Bridge is strictly mutation-resistant
- Bridge payload cannot be mutated after Zod validation
- Schema enforces immutability

### Zero static string leaks during shatteredCode phase
- No hardcoded strings escape the shatter phase
- All output is dynamically derived

## Suite 3: GovernanceGate: Tiered Resonance Circuit Breaker

### Stage 1: TRUSTED — sovereign code scores below 0.65v threshold
- Score < 0.65 → TRUSTED gate → proceed to escrow

### Stage 2: STAGED — review-required code scores between 0.65v and 0.95v
- 0.65 ≤ score < 0.95 → STAGED gate → requires human review

### Stage 3: BREACH — hostile/slop code scores above 0.95v → authorization denied
- Score ≥ 0.95 → BREACH gate → escrow blocked, session denied

### Stage 4: Loyalty credit — OMC markers reduce score by 0.30v
- OMC-marked code gets -0.30v loyalty credit on shatter score
- Rewards canonical alignment

### Stage 5: Loyalty cannot push score below 0 (floor enforced)
- Loyalty credit floored at 0.0 — cannot go negative

### Stage 6: Vacuity penalty — low-heat code (< 0.15) receives +0.30v penalty
- Heat < 0.15 → +0.30v vacuity penalty applied to shatter score
- Penalizes empty/stub code

### Stage 7: Escrow gate — BREACH module is blocked before session creation
- BREACH classification → escrow.create() throws/rejects
- No session ID generated

### Stage 8: Escrow gate — TRUSTED module proceeds to SHA-256 session creation
- TRUSTED classification → SHA-256 session manifest generated
- Session ID returned

### Stage 9: Recursive Resonance Chunking — large files split without data loss
- Files > 1000 chars chunked into blocks
- Each block embedded separately, centroid synthesized
- No token data lost across chunk boundaries

### Stage 10: Spectra Ollama probe — 127.0.0.1 binding produces valid URL
- Ollama binds to 127.0.0.1:11434
- URL construction verified: http://127.0.0.1:11434/api/embeddings

## Suite 4: Integration Summary

### Stage 1-2: Catastrophic Shatter and 3072-D Embedding
- velocity > 1.0 AND embedding in ROOM-02_WorldState

### Stage 3-4: Cross-Room Rewire (Bridge Mutation)
- Governed bridge created between WorldState and Client_Visual

### Stage 5-6: Armed Escrow via SHA-256 Manifest
- Full pipeline: shatter → gate → escrow → session

## Architecture Layers

### Layer 1: Embedding Engine
- Ollama mxbai-embed-large local at 127.0.0.1:11434
- 3072-D vector output
- Recursive Resonance Chunking for large files

### Layer 2: Spectra Math
- calculateShatter(): Euclidean distance from STABLE_CENTROID
- calculateHeat(): Manhattan resonance (sum of abs values)
- STABLE_CENTROID: Float32Array calibrated from canonical corpus

### Layer 3: GovernanceGate
- TRUSTED: shatter < 0.65v
- STAGED: 0.65v ≤ shatter < 0.95v
- BREACH: shatter ≥ 0.95v
- Loyalty credit: -0.30v for OMC markers
- Vacuity penalty: +0.30v for heat < 0.15

### Layer 4: Escrow
- SHA-256 session manifest on TRUSTED
- Rejection on BREACH
- Zod schema enforcement throughout

### Layer 5: QuadMap Rooms
- ROOM-02_WorldState
- Client_Visual
- Threading
- Cross-room rewire via governed bridges
