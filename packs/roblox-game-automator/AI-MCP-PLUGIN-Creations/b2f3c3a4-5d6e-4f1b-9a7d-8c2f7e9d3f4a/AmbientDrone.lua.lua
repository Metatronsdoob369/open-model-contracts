local AmbientDrone = {}

local SoundService = game:GetService('SoundService')

function AmbientDrone:CreateDrone()
    local droneSound = Instance.new('Sound')
    droneSound.Name = 'GothicCyberDrone'
    droneSound.SoundId = 'rbxassetid://1234567890' -- Placeholder asset ID
    droneSound.Looped = true
    droneSound.Volume = 0.5
    droneSound.PlaybackSpeed = 0.8
    droneSound.Parent = SoundService
    
    return droneSound
end

function AmbientDrone:PlayDrone(droneSound)
    if droneSound and not droneSound.IsPlaying then
        droneSound:Play()
    end
end

function AmbientDrone:StopDrone(droneSound)
    if droneSound and droneSound.IsPlaying then
        droneSound:Stop()
    end
end

function AmbientDrone:AdjustForDash(droneSound, isDashing)
    if isDashing then
        droneSound.Volume = 0.7
        droneSound.PlaybackSpeed = 1.0
    else
        droneSound.Volume = 0.5
        droneSound.PlaybackSpeed = 0.8
    end
end

function AmbientDrone:Initialize()
    print("🔊 [DIRECTOR] Starting Ambient Gothic-Cyber Drone...")
    local drone = self:CreateDrone()
    self:PlayDrone(drone)
    return drone
end

return AmbientDrone