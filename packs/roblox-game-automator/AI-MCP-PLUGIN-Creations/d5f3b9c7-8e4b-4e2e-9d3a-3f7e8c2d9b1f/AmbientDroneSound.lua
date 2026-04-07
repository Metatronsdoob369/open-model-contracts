local function Initialize()
    local SoundService = game:GetService("SoundService")

    local ambientDrone = Instance.new("Sound")
    ambientDrone.SoundId = ""
    ambientDrone.Volume = 0.5
    ambientDrone.PlaybackSpeed = 1
    ambientDrone.Looped = true
    ambientDrone.Parent = SoundService

    ambientDrone:Play()
end

return { Initialize = Initialize }