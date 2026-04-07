local DashSystem = {}

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

local DASH_SPEED = 100
local DASH_DURATION = 0.2
local DASH_COOLDOWN = 2

local dashingPlayers = {}

local function onPlayerAdded(player)
    player.CharacterAdded:Connect(function(character)
        character:SetAttribute("CanDash", true)
    end)
end

local function dashPlayer(player)
    if not player.Character or not player.Character:GetAttribute("CanDash") then return end

    local humanoidRootPart = player.Character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end

    local dashDirection = humanoidRootPart.CFrame.LookVector
    local dashVelocity = dashDirection * DASH_SPEED

    player.Character:SetAttribute("CanDash", false)
    dashingPlayers[player] = tick() + DASH_DURATION

    local bodyVelocity = Instance.new("BodyVelocity")
    bodyVelocity.Velocity = dashVelocity
    bodyVelocity.MaxForce = Vector3.new(1e5, 1e5, 1e5)
    bodyVelocity.Parent = humanoidRootPart

    task.delay(DASH_DURATION, function()
        bodyVelocity:Destroy()
    end)

    task.delay(DASH_COOLDOWN, function()
        if player.Character then
            player.Character:SetAttribute("CanDash", true)
        end
    end)
end

local function updateDashes()
    local currentTime = tick()
    for player, endTime in pairs(dashingPlayers) do
        if currentTime > endTime then
            dashingPlayers[player] = nil
        end
    end
end

function DashSystem.Initialize()
    Players.PlayerAdded:Connect(onPlayerAdded)
    game:GetService("RunService").Heartbeat:Connect(updateDashes)
end

function DashSystem.AttemptDash(player)
    if not player.Character or not player.Character:GetAttribute("CanDash") then return false end

    dashPlayer(player)
    return true
end

return DashSystem