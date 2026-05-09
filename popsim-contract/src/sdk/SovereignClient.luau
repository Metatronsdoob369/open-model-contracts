--[[
    💎 SovereignClient.luau
    Version: 1.0.0 "Sept-Division Ready"
    
    This is the Rojo-synced module for Roblox Studio.
    It serves as the front-end sensor for the Neural Arbitrage Factory.
--]]

local HttpService = game:GetService("HttpService")

local SovereignClient = {}
SovereignClient.__index = SovereignClient

-- Configuration (Point to your local bridge-server)
local BRIDGE_URL = "http://127.0.0.1:3000/sdk/analyze"

function SovereignClient.new()
    local self = setmetatable({}, SovereignClient)
    return self
end

-- Detonate a Spectral Analysis
function SovereignClient:Analyze(id: string, code: string)
    local payload = {
        id = id,
        code = code,
        timestamp = os.time()
    }
    
    local success, response = pcall(function()
        return HttpService:PostAsync(
            BRIDGE_URL,
            HttpService:JSONEncode(payload),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        print("📊 [SOVEREIGN-REPORT] " .. id .. " | Gate: " .. data.gate)
        if #data.hotspots > 0 then
            for _, hotspot in ipairs(data.hotspots) do
                warn("🔥 [HOTSPOT] " .. hotspot)
            end
        end
        return data
    else
        warn("❌ [BRIDGE-FAILURE] Could not reach the Neural Arbitrage Factory.")
        return nil
    end
end

return SovereignClient
