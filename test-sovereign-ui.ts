import assert from 'node:assert';
import { embedWithTime } from './src/embedder/embedWithTime.js';
import { graph } from './src/canonical/QuadMap.js';
import { rewireRooms } from './src/architecture/rewireRooms.js';
import { injectBridgeCalls } from './src/sequencer/injectBridgeCalls.js';
import { validateEscrowPayload } from './src/escrow/validatePayload.js';
import crypto from 'crypto';

function calculateShatterVelocity(spatialDist: number, rawDelta: number, expectedDuration: number, phaseWeight: number): number {
    const normalizedDelta = Math.max(1.0, rawDelta / expectedDuration);
    return spatialDist * (Math.pow(normalizedDelta, 1.2)) * phaseWeight;
}

const trace = [
  { timestamp: 0.0,   phase: "scriptLoad" },
  { timestamp: 0.8,   phase: "characterAdded" },
];

describe('Sovereign 4D Spatio-Temporal Orchestrator', function() {
    this.timeout(10000); // 10 seconds for Ollama requests if needed

    let velocity: number;
    let shatteredCode = `
local Global = require(script.Parent.Broken_Global_Reference)
local Environment = nil
local Customers = Global.Customers
local Customers = Global.Customers
`;
    let repairedCode: string;

    it('Stage 1: Calculates Topological Fracture Parameters (Shatter Velocity)', () => {
        velocity = calculateShatterVelocity(0.85, 2.4, 1.2, 1.5);
        assert.ok(velocity > 1.0, "Velocity must exceed Catastrophic Threshold (1.0)");
    });

    it('Stage 2: Submits Code Context to 3072-D Ollama Node Engine', () => {
        const node = embedWithTime(shatteredCode, trace);
        graph.upsertNode(node);
        // It's a procedural map, ensure it created a node
        assert.strictEqual(node.room, "ROOM-02_WorldState", "Assigned incorrect room");
    });

    it('Stage 3: Executes Architectural Cross-Room Rewire (QuadMap Sever & Bridge)', async () => {
        const signal = {
            sourceRoom: "ROOM_02_WorldState",
            targetRoom: "Client_Visual",
            fracturePath: "scriptLoad → characterAdded",
            velocity: velocity,
            selectedContract: "OMC_Bridge_StateSync"
        };
        await rewireRooms(signal);
        // Rewire succeeds without throwing
        assert.ok(true);
    });

    it('Stage 4: Byproduct Injection - Mutates Zod-Guarded Bridge Payload', () => {
        repairedCode = injectBridgeCalls(
            shatteredCode,
            {
                id: "Bridge_ROOM_02_to_Client",
                name: "Bridge_ROOM_02_to_Client",
                sourceRoom: "ROOM_02_WorldState",
                targetRoom: "Client_Visual",
                fracturePath: "scriptLoad → characterAdded"
            },
            "scriptLoad → characterAdded",
            "OMC_Bridge_StateSync"
        );
        
        assert.ok(repairedCode.includes('SafeFireBridge_ROOM_02_to_Client'), "Did not inject wrapper properly");
        assert.ok(repairedCode.includes('Bridge_ROOM_02_to_Client:FireServer'), "Did not retain secure network transmission anchor");
    });

    it('Stage 5: Armed Escrow Validation Gate - Rejects Malformed Payloads', async () => {
        // We replace the SafeFire wrapper with a raw FireServer to trigger the structural Escrow failure
        const brokenPayload = repairedCode.replace('SafeFireBridge_ROOM_02_to_Client(payload)', 'BridgeReq:FireServer(payload)');
        const manifestHash = crypto.createHash("sha256").update(brokenPayload).digest("hex");
        
        const escrowResult = await validateEscrowPayload({
            repairedCode: brokenPayload,
            manifestHash,
            bridgeId: "Bridge_ROOM_02_to_Client",
            contractName: "OMC_Bridge_StateSync"
        });
        
        assert.strictEqual(escrowResult.success, false, "Escrow failed to catch broken payload");
        assert.ok(escrowResult.errors.length > 0, "Escrow did not log validation errors for the malformed payload");
    });

    it('Stage 6: Armed Escrow Validation Gate - Secures Pristine Session', async () => {
        const manifestHash = crypto.createHash("sha256").update(repairedCode).digest("hex");
        
        const escrowResult = await validateEscrowPayload({
            repairedCode,
            manifestHash,
            bridgeId: "Bridge_ROOM_02_to_Client",
            contractName: "OMC_Bridge_StateSync"
        });
        
        assert.strictEqual(escrowResult.success, true, "Escrow wrongly rejected pristine payload");
        assert.ok(escrowResult.sessionId, "Escrow failed to grant cryptographic Session ID");
    });
});
