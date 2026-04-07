local AmbientDrone = {}

local SoundService = game:GetService('SoundService')

function AmbientDrone:createDroneSoundscape()
    local droneSound = Instance.new('Sound')
    droneSound.Name = 'GothicCyberDrone'
    droneSound.SoundId = 'rbxassetid://1234567890' -- Placeholder asset ID
    droneSound.Looped = true
    droneSound.Volume = 0.5
    droneSound.PlaybackSpeed = 0.8
    droneSound.Parent = SoundService
    
    local reverbEffect = Instance.new('ReverbSoundEffect')
    reverbEffect.DecayTime = 2.5
    reverbEffect.Density = 0.8
    reverbEffect.Diffusion = 0.7
    reverbEffect.DryLevel = -5
    reverbEffect.WetLevel = 0
    reverbEffect.Parent = droneSound
    
    local equalizerEffect = Instance.new('EqualizerSoundEffect')
    equalizerEffect.LowGain = 3
    equalizerEffect.MidGain = -2
    equalizerEffect.HighGain = -1
    equalizerEffect.Parent = droneSound
    
    droneSound:Play()
end

function AmbientDrone:adjustForMood(moodIntensity)
    local droneSound = SoundService:FindFirstChild('GothicCyberDrone')
    if droneSound then
        droneSound.Volume = 0.5 + (moodIntensity * 0.1)
        droneSound.PlaybackSpeed = 0.8 + (moodIntensity * 0.05)
    end
end

return AmbientDrone