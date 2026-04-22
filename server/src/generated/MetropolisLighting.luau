-- [[ METROPOLIS LIGHTING CONTROL ]]
local Lighting = game:GetService("Lighting")

local MetropolisLighting = {}

function MetropolisLighting.apply()
    Lighting.Ambient = Color3.fromRGB(26, 26, 46) -- Deep Obsidian
    Lighting.OutdoorAmbient = Color3.fromRGB(15, 52, 96) -- Teal Tint
    Lighting.ClockTime = 0 -- Midnight
    Lighting.Brightness = 2
    
    local bloom = Lighting:FindFirstChildOfClass("BloomEffect") or Instance.new("BloomEffect", Lighting)
    bloom.Intensity = 1.5
    bloom.Size = 24
    bloom.Threshold = 0.8
    
    local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere", Lighting)
    atmosphere.Density = 0.3
    atmosphere.Color = Color3.fromRGB(83, 52, 131) -- Violet Haze
    atmosphere.Decay = Color3.fromRGB(15, 52, 96) -- Teal Decay
    atmosphere.Glare = 0.5
    
    -- Skybox Tuning
    local sky = Lighting:FindFirstChildOfClass("Sky") or Instance.new("Sky", Lighting)
    sky.SkyboxBk = "rbxassetid://6008327797"
    sky.SkyboxDn = "rbxassetid://6008327797"
    sky.SkyboxFt = "rbxassetid://6008327797"
    sky.SkyboxLf = "rbxassetid://6008327797"
    sky.SkyboxRt = "rbxassetid://6008327797"
    sky.SkyboxUp = "rbxassetid://6008327797"
    sky.SunTextureId = ""
    sky.MoonTextureId = ""
    sky.StarCount = 3000

    print("[OMC] Metropolis Lighting Applied.")
end

return MetropolisLighting
