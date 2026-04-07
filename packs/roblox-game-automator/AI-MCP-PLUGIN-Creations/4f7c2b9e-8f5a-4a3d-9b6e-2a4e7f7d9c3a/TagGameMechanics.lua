local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local TAG_COOLDOWN = 5
local DASH_SPEED = 100
local DASH_DURATION = 0.2
local DASH_COOLDOWN = 1

local tagData = {}

local function Initialize()
    for _, player in ipairs(Players:GetPlayers()) do
        tagData[player] = {
            isTagged = false,
            lastTagTime = 0,
            lastDashTime = 0
        }
    end

    Players.PlayerAdded:Connect(function(player)
        tagData[player] = {
            isTagged = false,
            lastTagTime = 0,
            lastDashTime = 0
        }
    end)

    Players.PlayerRemoving:Connect(function(player)
        tagData[player] = nil
    end)

    RunService.Heartbeat:Connect(Update)
end

local function TagPlayer(taggedPlayer, taggingPlayer)
    local currentTime = os.clock()
    if currentTime - tagData[taggingPlayer].lastTagTime >= TAG_COOLDOWN then
        tagData[taggedPlayer].isTagged = true
        tagData[taggingPlayer].lastTagTime = currentTime
        -- Additional logic for when a player is tagged can be added here
    end
end

local function Dash(player)
    local currentTime = os.clock()
    if currentTime - tagData[player].lastDashTime >= DASH_COOLDOWN then
        local character = player.Character
        if character and character:FindFirstChild("HumanoidRootPart") then
            local hrp = character.HumanoidRootPart
            local dashDirection = hrp.CFrame.LookVector
            hrp.Velocity = dashDirection * DASH_SPEED
            tagData[player].lastDashTime = currentTime
            task.delay(DASH_DURATION, function()
                hrp.Velocity = Vector3.new(0, 0, 0)
            end)
        end
    end
end

local function OnInputBegan(input, gameProcessed)
    if gameProcessed then return end
    local player = Players.LocalPlayer
    if input.KeyCode == Enum.KeyCode.LeftShift then
        Dash(player)
    end
end

local function Update()
    -- Update logic for the tag game can be added here
end

UserInputService.InputBegan:Connect(OnInputBegan)

Initialize()
