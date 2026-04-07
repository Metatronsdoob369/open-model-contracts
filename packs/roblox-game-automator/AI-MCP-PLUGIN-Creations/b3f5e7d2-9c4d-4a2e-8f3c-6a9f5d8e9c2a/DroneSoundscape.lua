local SoundService = game:GetService("SoundService")

local function createAmbientSound(name, volume, playbackSpeed, looped)
    local sound = Instance.new("Sound")
    sound.Name = name
    sound.SoundId = ""
    sound.Volume = volume
    sound.PlaybackSpeed = playbackSpeed
    sound.Looped = looped
    sound.Parent = SoundService
    return sound
end

local function Initialize()
    local lowDrone = createAmbientSound("LowDrone", 0.5, 1.0, true)
    local midDrone = createAmbientSound("MidDrone", 0.3, 1.0, true)
    local highDrone = createAmbientSound("HighDrone", 0.2, 1.0, true)

    lowDrone:Play()
    midDrone:Play()
    highDrone:Play()
end

return { Initialize = Initialize }