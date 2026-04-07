local SynthwaveAmbience = {}

local SoundService = game:GetService('SoundService')

local function createSound(id, volume, looped, parent)
    local sound = Instance.new('Sound')
    sound.SoundId = id
    sound.Volume = volume
    sound.Looped = looped
    sound.Parent = parent
    return sound
end

function SynthwaveAmbience:Initialize()
    local ambienceFolder = Instance.new('Folder')
    ambienceFolder.Name = 'SynthwaveAmbience'
    ambienceFolder.Parent = SoundService

    local baseDrone = createSound('rbxassetid://12345678', 0.5, true, ambienceFolder)
    local melody = createSound('rbxassetid://87654321', 0.3, true, ambienceFolder)
    local rhythm = createSound('rbxassetid://23456789', 0.4, true, ambienceFolder)

    baseDrone:Play()
    melody:Play()
    rhythm:Play()
end

function SynthwaveAmbience:AdjustVolume(volume)
    for _, sound in ipairs(SoundService.SynthwaveAmbience:GetChildren()) do
        sound.Volume = volume
    end
end

function SynthwaveAmbience:Stop()
    for _, sound in ipairs(SoundService.SynthwaveAmbience:GetChildren()) do
        sound:Stop()
    end
end

return SynthwaveAmbience