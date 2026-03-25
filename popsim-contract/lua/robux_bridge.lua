--[[
    @popsim/contract — Luau Bridge
    This script runs on the Roblox Server. It uses HttpService to validate 
    game state changes against the "Law" defined in the TypeScript domain contract.
--]]

local HttpService = game:GetService("HttpService")

local ContractService = {}
ContractService.__index = ContractService

-- Configuration: Point this to your hosted MCP/Bridge Server
local BRIDGE_URL = "https://popsim-contract-bridge-pt662zocvq-uc.a.run.app/v1/contract"

-- SAFE GATE: Fetch static parameters (Platform fees, DevEx rates)
function ContractService:GetEconomicPolicy()
    local success, result = pcall(function()
        return HttpService:GetAsync(BRIDGE_URL .. "/economics")
    end)
    
    if success then
        return HttpService:JSONDecode(result)
    else
        warn("Failed to fetch economic policy from Contract: " .. tostring(result))
        return nil
    end
end

-- ARMED GATE: Validate a state-changing transaction (e.g. Developer Payout)
function ContractService:ValidateTransaction(transactionData)
    -- Transaction data should match the 'PopSimContractInputSchema' we defined in TS
    local payload = HttpService:JSONEncode(transactionData)
    
    local success, result = pcall(function()
        return HttpService:PostAsync(
            BRIDGE_URL .. "/validate",
            payload,
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        local decision = HttpService:JSONDecode(result)
        if decision.gate == "ARMED" and decision.success == true then
            print("✅ Contract Validated: Executing game state change.")
            return true, decision
        else
            warn("❌ Contract Rejected: " .. (decision.error or "Unknown Violation"))
            return false, decision
        end
    else
        error("🔥 Contract Enforcement Failure (Network Error): " .. tostring(result))
    end
end

-- EXAMPLE USAGE:
--[[
local policy = ContractService:GetEconomicPolicy()
if policy then
    print("Current Payout Rate: " .. policy.payoutConversionRate)
    print("Platform Fee: " .. (policy.platformFeePercentage * 100) .. "%")
end

local txResult, details = ContractService:ValidateTransaction({
    swarmName = "MainHubSim",
    runId = "uuid-123",
    roundNumber = 5,
    gate = "ARMED", -- State-changing request
    owner = "Dev_Joe",
    expiry = "2026-12-31T23:59:59Z",
    scope = "payout-calculation",
    reversible = false,
    simulationSettings = {
        initialAgentCount = 100,
        maxRoundsPerRun = 10,
        simulatedTimeAcceleration = "10x",
        computeAssumption = "finite",
        shockInjectionProbability = 0.05,
        humanReviewQueue = true
    }
})
--]]

return ContractService
