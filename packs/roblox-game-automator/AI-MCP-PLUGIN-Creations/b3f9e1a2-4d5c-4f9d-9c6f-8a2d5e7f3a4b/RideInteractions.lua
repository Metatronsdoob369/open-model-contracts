local RideInteractions = {}

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local RIDE_SHAKE_INTENSITY = 0.5
local RIDE_SHAKE_DURATION = 2

function RideInteractions:ShakeRide(ride)
    local originalCFrame = ride.CFrame
    local shakeTweenInfo = TweenInfo.new(RIDE_SHAKE_DURATION, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1, true)
    local shakeTween = TweenService:Create(ride, shakeTweenInfo, {CFrame = originalCFrame * CFrame.Angles(0, 0, RIDE_SHAKE_INTENSITY)})
    shakeTween:Play()
end

function RideInteractions:InteractWithRide(player, ride)
    if player and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
        local humanoidRootPart = player.Character.HumanoidRootPart
        if (humanoidRootPart.Position - ride.Position).Magnitude < 5 then
            self:ShakeRide(ride)
        end
    end
end

function RideInteractions:MonitorRides(rides)
    for _, ride in ipairs(rides) do
        ride.Touched:Connect(function(hit)
            local player = Players:GetPlayerFromCharacter(hit.Parent)
            if player then
                self:InteractWithRide(player, ride)
            end
        end)
    end
end

return RideInteractions