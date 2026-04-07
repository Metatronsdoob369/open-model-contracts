local function createDroneSound()
    local sound = Instance.new("Sound")
    sound.SoundId = ""
    sound.Volume = 0.5
    sound.PlaybackSpeed = 0.8
    sound.Looped = true
    return sound
end

local function createAmbientSoundscape()
    local soundService = game:GetService("SoundService")
    
    local drone1 = createDroneSound()
    drone1.Parent = soundService
    drone1:Play()

    local drone2 = createDroneSound()
    drone2.Volume = 0.4
    drone2.PlaybackSpeed = 0.9
    drone2.Parent = soundService
    drone2:Play()

    local drone3 = createDroneSound()
    drone3.Volume = 0.3
    drone3.PlaybackSpeed = 0.7
    drone3.Parent = soundService
    drone3:Play()
end

local function Initialize()
    createAmbientSoundscape()
end

return { Initialize = Initialize }