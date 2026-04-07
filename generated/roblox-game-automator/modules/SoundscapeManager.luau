--[=[
    🏮 SoundscapeManager.luau
    Author: sonic-01 (Sonic Engineer)
    Part of the Roblox Game Automator Pack
    Metropolis Acoustic Resonance v1.0
]=]

local SoundscapeManager = {}

-- Services
local SoundService = game:GetService("SoundService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Metropolis Aesthetic Config (Dark Obsidian Hum)
local AMBIENT_ID = "rbxassetid://1837879082" -- Metropolis Cyber-Gothic Ambient
local DASH_SFX_ID = "rbxassetid://1347631165" -- Kinetic Dash Burst
local TAG_SFX_ID = "rbxassetid://1837012347"  -- Reserved for Tag Pulse

-- Internal State
local metropolisDrone = nil

function SoundscapeManager.Initialize()
    -- Instantiate the Ambient Night Drone
    metropolisDrone = Instance.new("Sound")
    metropolisDrone.Name = "MetropolisDrone"
    metropolisDrone.SoundId = AMBIENT_ID
    metropolisDrone.Looped = true
    metropolisDrone.Volume = 0.5
    metropolisDrone.Parent = SoundService
    
    metropolisDrone:Play()
    SoundService.AmbientReverb = Enum.ReverbType.StoneCorridor
    print("[SONIC] Metropolis Resonance activated with StoneCorridor Reverberation.")
end

function SoundscapeManager.PlayDashSFX(position)
    local sfx = Instance.new("Sound")
    sfx.SoundId = DASH_SFX_ID
    sfx.Volume = 0.8
    sfx.PlayOnRemove = true
    sfx.Parent = SoundService
    
    sfx:Play()
end

function SoundscapeManager.PlayTagSFX()
    local sfx = Instance.new("Sound")
    sfx.SoundId = TAG_SFX_ID
    sfx.Volume = 1.0
    sfx.PlayOnRemove = true
    sfx.Parent = SoundService
    
    sfx:Play()
end

return SoundscapeManager
