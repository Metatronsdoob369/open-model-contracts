local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TAG_DURATION = 10 -- Duration for which a player remains "it"
local DASH_COOLDOWN = 5 -- Cooldown time for dashing
local DASH_DISTANCE = 50 -- Distance covered by a dash

local playerData = {}

local function onPlayerAdded(player)
    playerData[player] = {
        isIt = false,
        lastDashTime = 0
    }
end

local function onPlayerRemoving(player)
    playerData[player] = nil
end

local function tagPlayer(player)
    playerData[player].isIt = true
    task.delay(TAG_DURATION, function()
        if playerData[player] then
            playerData[player].isIt = false
        end
    end)
end

local function canDash(player)
    local currentTime = tick()
    return currentTime - playerData[player].lastDashTime >= DASH_COOLDOWN
end

local function dash(player)
    if not canDash(player) then return end

    local character = player.Character
    if not character then return end

    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end

    local lookVector = humanoidRootPart.CFrame.LookVector
    humanoidRootPart.CFrame = humanoidRootPart.CFrame + lookVector * DASH_DISTANCE
    playerData[player].lastDashTime = tick()
end

local function onPlayerTouched(otherPlayer)
    if playerData[otherPlayer] and playerData[otherPlayer].isIt then
        tagPlayer(otherPlayer)
    end
end

local function Initialize()
    Players.PlayerAdded:Connect(onPlayerAdded)
    Players.PlayerRemoving:Connect(onPlayerRemoving)

    for _, player in ipairs(Players:GetPlayers()) do
        onPlayerAdded(player)
    end

    RunService.Heartbeat:Connect(function()
        for _, player in ipairs(Players:GetPlayers()) do
            local character = player.Character
            if character then
                local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
                if humanoidRootPart then
                    for _, otherPlayer in ipairs(Players:GetPlayers()) do
                        if otherPlayer ~= player then
                            local otherCharacter = otherPlayer.Character
                            if otherCharacter then
                                local otherHumanoidRootPart = otherCharacter:FindFirstChild("HumanoidRootPart")
                                if otherHumanoidRootPart then
                                    if (humanoidRootPart.Position - otherHumanoidRootPart.Position).Magnitude < 5 then
                                        onPlayerTouched(otherPlayer)
                                    end
                                end
                            end
                        end
                    end
                end
            end
        end
    end)
end

return { Initialize = Initialize }