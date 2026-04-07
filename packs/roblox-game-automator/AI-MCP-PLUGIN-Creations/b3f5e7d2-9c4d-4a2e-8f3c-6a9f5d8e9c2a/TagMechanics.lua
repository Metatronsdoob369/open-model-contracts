local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TAG_DURATION = 10 -- seconds
local DASH_COOLDOWN = 5 -- seconds
local DASH_DISTANCE = 50

local playerStates = {}

local function onPlayerAdded(player)
    playerStates[player] = {
        isTagged = false,
        lastDashTime = 0
    }

    player.CharacterAdded:Connect(function(character)
        character.Humanoid.Died:Connect(function()
            playerStates[player].isTagged = false
        end)
    end)
end

local function tagPlayer(player)
    playerStates[player].isTagged = true
    task.delay(TAG_DURATION, function()
        if playerStates[player] then
            playerStates[player].isTagged = false
        end
    end)
end

local function canDash(player)
    local currentTime = os.clock()
    return (currentTime - playerStates[player].lastDashTime) >= DASH_COOLDOWN
end

local function dashPlayer(player)
    if not canDash(player) then return end

    local character = player.Character
    if not character then return end

    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end

    local lookVector = humanoidRootPart.CFrame.LookVector
    humanoidRootPart.CFrame = humanoidRootPart.CFrame + (lookVector * DASH_DISTANCE)

    playerStates[player].lastDashTime = os.clock()
end

local function onPlayerRemoving(player)
    playerStates[player] = nil
end

local function Initialize()
    Players.PlayerAdded:Connect(onPlayerAdded)
    Players.PlayerRemoving:Connect(onPlayerRemoving)

    -- Example of how to tag a player (this should be triggered by game logic)
    -- tagPlayer(somePlayer)

    -- Example of how to dash a player (this should be triggered by player input)
    -- dashPlayer(somePlayer)
end

return { Initialize = Initialize }