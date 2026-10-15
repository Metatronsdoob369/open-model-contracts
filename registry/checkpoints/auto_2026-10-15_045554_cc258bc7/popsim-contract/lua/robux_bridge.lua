--[[
    @popsim/contract — Modular Luau Bridge SDK
    This script provides a plug-and-play interface for Roblox to TypeScript 
    contract validation. Switch domains via the CONFIG.DOMAIN field.
--]]

local HttpService = game:GetService("HttpService")

local ContractService = {}
ContractService.__index = ContractService

-- SDK Configuration: Toggle your game domain here.
local CONFIG = {
    BRIDGE_URL = "https://popsim-contract-bridge-pt662zocvq-uc.a.run.app/v1/contract",
    API_KEY = "development-only-key",
    DOMAIN = "generic", -- e.g. "popsim" for the simulation, "generic" for boilerplate
}

-- Internal: Handle HTTP with Auth & Domain context
local function request(method, url, payload)
    local headers = {
        ["X-API-Key"] = CONFIG.API_KEY,
        ["X-Domain"] = CONFIG.DOMAIN,
        ["Content-Type"] = "application/json"
    }
    
    local success, result = pcall(function()
        if method == "GET" then
            return HttpService:GetAsync(url, true, headers)
        elseif method == "POST" then
            return HttpService:PostAsync(url, payload, Enum.HttpContentType.ApplicationJson, false, headers)
        end
    end)
    
    if success then
        return true, HttpService:JSONDecode(result)
    else
        warn("❌ Contract Bridge Error [" .. CONFIG.DOMAIN .. "]: " .. tostring(result))
        return false, result
    end
end

-- GET Infrastructure Policies
function ContractService:GetPolicy()
    local success, data = request("GET", CONFIG.BRIDGE_URL .. "/economics")
    return success and data or nil
end

-- POST Validation Request (Plug-and-Play)
-- data: Table matching the Zod schema of your active DOMAIN
function ContractService:Validate(data)
    local payload = HttpService:JSONEncode(data)
    local success, decision = request("POST", CONFIG.BRIDGE_URL .. "/validate", payload)
    
    if success then
        if decision.success then
            print("✅ Contract [" .. CONFIG.DOMAIN .. "] Approved: " .. decision.decision)
            return true, decision
        else
            warn("❌ Contract [" .. CONFIG.DOMAIN .. "] Rejected: " .. HttpService:JSONEncode(decision.error))
            return false, decision
        end
    else
        error("🔥 Bridge Infrastructure Failure: " .. tostring(decision))
    end
end

return ContractService
