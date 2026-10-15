--[[
    Sovereign Scientist — PopSim Demo
    This script demonstrates how to plug the "Popsim" domain into the bridge.
--]]

local ContractBridge = require(script.Parent.Parent.robux_bridge)

-- Set the domain context to "popsim"
ContractBridge.CONFIG.DOMAIN = "popsim"

print("🧪 Starting Sovereign Scientist Smoke Test...")

-- Sample Population Simulation request
local simRequest = {
    swarmName = "AlphaScientistSwarm",
    runId = "550e8400-e29b-41d4-a716-446655440000",
    roundNumber = 12,
    gate = "ARMED", -- State-changing request
    owner = "Arch_Joe",
    expiry = "2026-12-31T23:59:59Z",
    scope = "recursive-self-improvement-sim",
    reversible = false,
    simulationSettings = {
        initialAgentCount = 250,
        maxRoundsPerRun = 50,
        simulatedTimeAcceleration = "100x",
        computeAssumption = "finite",
        shockInjectionProbability = 0.02,
        humanReviewQueue = true
    }
}

local success, decision = ContractBridge:Validate(simRequest)

if success then
    print("🚀 Simulation Lawfully Authorized: " .. decision.decision)
else
    warn("☢️ Simulation Halted: Violation of Contract!")
end
