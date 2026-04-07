local OrganMusic = {}

function OrganMusic:playEerieOrgan()
    local organSound = Instance.new("Sound")
    organSound.SoundId = "rbxassetid://1234567890" -- Placeholder ID for eerie organ music
    organSound.Volume = 0.7
    organSound.Looped = true
    organSound:Play()
    return organSound
end

function OrganMusic:stopEerieOrgan(organSound)
    if organSound then
        organSound:Stop()
        organSound:Destroy()
    end
end

return OrganMusic