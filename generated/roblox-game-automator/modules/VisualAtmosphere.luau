--[=[
    🏮 VisualAtmosphere.luau
    Author: architect-01 (Architect)
    Part of the Roblox Game Automator Pack
    Metropolis Visual DNA v1.0
]=]

local VisualAtmosphere = {}

-- Services
local Lighting = game:GetService("Lighting")

-- Metropolis Aesthetic Config (Obsidian Teal Night)
local AMBIENT_COLOR = Color3.fromHex("#1A1A2E") -- Obsidian Night
local FOG_COLOR = Color3.fromHex("#0F3460") -- Teal Fog
local OUTDOOR_AMBIENT = Color3.fromHex("#1A1A2E")
local CLOCK_TIME = 3 -- 3 AM
local FOG_END = 800

function VisualAtmosphere.Apply()
    Lighting.ClockTime = CLOCK_TIME
    Lighting.Ambient = AMBIENT_COLOR
    Lighting.OutdoorAmbient = OUTDOOR_AMBIENT
    Lighting.FogColor = FOG_COLOR
    Lighting.FogEnd = FOG_END
    
    -- High-Fidelity Glow: Exposure and Bloom
    Lighting.ExposureCompensation = 0.5
    
    local bloom = Lighting:FindFirstChildOfClass("BloomEffect") or Instance.new("BloomEffect")
    bloom.Intensity = 1.0
    bloom.Size = 24
    bloom.Threshold = 0.8
    bloom.Parent = Lighting

    print("[ARCHITECT] Metropolis Atmosphere manifested.")
end

return VisualAtmosphere
