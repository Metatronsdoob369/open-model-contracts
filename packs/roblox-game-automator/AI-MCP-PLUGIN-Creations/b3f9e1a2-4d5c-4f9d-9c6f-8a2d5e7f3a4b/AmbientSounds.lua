local AmbientSounds = {}

function AmbientSounds:playHauntedWind()
    local windSound = Instance.new("Sound")
    windSound.SoundId = "rbxassetid://0987654321" -- Placeholder ID for haunted wind sound
    windSound.Volume = 0.5
    windSound.Looped = true
    windSound:Play()
    return windSound
end

function AmbientSounds:playGhostlyWhispers()
    local whisperSound = Instance.new("Sound")
    whisperSound.SoundId = "rbxassetid://1122334455" -- Placeholder ID for ghostly whispers
    whisperSound.Volume = 0.3
    whisperSound.Looped = true
    whisperSound:Play()
    return whisperSound
end

function AmbientSounds:stopAmbientSound(sound)
    if sound then
        sound:Stop()
        sound:Destroy()
    end
end

return AmbientSounds