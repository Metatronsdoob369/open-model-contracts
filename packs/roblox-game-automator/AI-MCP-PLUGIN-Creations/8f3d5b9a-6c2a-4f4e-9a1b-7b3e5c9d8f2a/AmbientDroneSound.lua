local AmbientDroneSound = {}

local SoundService = game:GetService("SoundService")
local Workspace = game:GetService("Workspace")

function AmbientDroneSound:Initialize()
    -- Create a Part to attach the sound
    local soundPart = Instance.new("Part")
    soundPart.Anchored = true
    soundPart.Size = Vector3.new(1, 1, 1)
    soundPart.Position = Vector3.new(0, 100, 0) -- Position it high above the city
    soundPart.Transparency = 1
    soundPart.CanCollide = false
    soundPart.Parent = Workspace

    -- Create the ambient drone sound
    local droneSound = Instance.new("Sound")
    droneSound.SoundId = "rbxassetid://123456789" -- Placeholder asset ID
    droneSound.Looped = true
    droneSound.Volume = 0.5
    droneSound.PlaybackSpeed = 0.8
    droneSound.Parent = soundPart

    -- Create additional layers for complexity
    local lowDrone = Instance.new("Sound")
    lowDrone.SoundId = "rbxassetid://987654321" -- Placeholder asset ID
    lowDrone.Looped = true
    lowDrone.Volume = 0.3
    lowDrone.PlaybackSpeed = 0.6
    lowDrone.Parent = soundPart

    local highDrone = Instance.new("Sound")
    highDrone.SoundId = "rbxassetid://192837465" -- Placeholder asset ID
    highDrone.Looped = true
    highDrone.Volume = 0.2
    highDrone.PlaybackSpeed = 1.2
    highDrone.Parent = soundPart

    -- Start playing the sounds
    droneSound:Play()
    lowDrone:Play()
    highDrone:Play()
end

return AmbientDroneSound