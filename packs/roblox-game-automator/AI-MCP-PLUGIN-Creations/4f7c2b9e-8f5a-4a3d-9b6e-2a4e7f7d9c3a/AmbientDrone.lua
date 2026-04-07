local function CreateAmbientSoundscape()
    local SoundService = game:GetService("SoundService")
    
    local function createSound(id, volume, pitch, looped)
        local sound = Instance.new("Sound")
        sound.SoundId = id
        sound.Volume = volume
        sound.PlaybackSpeed = pitch
        sound.Looped = looped
        return sound
    end

    local droneSound = createSound("rbxassetid://123456789", 0.5, 0.8, true)
    local lowHum = createSound("rbxassetid://987654321", 0.3, 0.5, true)
    local distantChime = createSound("rbxassetid://192837465", 0.2, 1.2, true)

    droneSound.Parent = SoundService
    lowHum.Parent = SoundService
    distantChime.Parent = SoundService

    droneSound:Play()
    lowHum:Play()
    distantChime:Play()
end

local function Initialize()
    CreateAmbientSoundscape()
end

return {
    Initialize = Initialize
}