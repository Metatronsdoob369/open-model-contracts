import fetch from 'node-fetch'; // or use native fetch if node 18+

const ESCROW_URL = "http://localhost:8080/v1/escrow";

const testRepairedCode = `
-- TEST REPAIRED CODE
local Bridge_Test = ReplicatedStorage:WaitForChild("Bridge_Test")

local function SafeFireBridge_Test(payload)
    Bridge_Test:FireServer(payload)
end

Bridge_Test.OnServerEvent:Connect(function(player, payload)
    print("Bridge received payload:", payload)
end)
`;

const payload = {
    repairedCode: testRepairedCode,
    manifestHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    bridgeId: "Bridge_Test",
    contractName: "OMC_Bridge_StateSync",
    samplePayload: { type: "test", value: 42 }
};

async function run() {
    try {
        console.log("Sending payload to Escrow...");
        const response = await fetch(ESCROW_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            console.log("✅ Escrow PASSED - Session ID:", data.sessionId);
        } else {
            console.log("❌ Escrow REJECTED:\n", JSON.stringify(data.errors, null, 2));
        }
    } catch (e: any) {
        console.error("HTTP Error contacting Escrow", e.message);
    }
}

run();
