local SoundService = game:GetService("SoundService")

local function createDroneSound(frequency, volume, playbackSpeed)
    local sound = Instance.new("Sound")
    sound.SoundId = ""
    sound.Volume = volume
    sound.PlaybackSpeed = playbackSpeed
    sound.Looped = true
    sound.Parent = SoundService
    return sound
end

local function initializeDroneSoundscape()
    local baseFrequency = 100
    local volume = 0.5
    local playbackSpeed = 1

    local drone1 = createDroneSound(baseFrequency, volume, playbackSpeed)
    local drone2 = createDroneSound(baseFrequency * 1.5, volume * 0.8, playbackSpeed * 0.95)
    local drone3 = createDroneSound(baseFrequency * 2, volume * 0.6, playbackSpeed * 1.05)

    drone1:Play()
    drone2:Play()
    drone3:Play()
end

initializeDroneSoundscape()