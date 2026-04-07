local TagMechanics = {}

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

local TAG_DURATION = 10 -- seconds
local TAG_COOLDOWN = 5 -- seconds

local taggedPlayers = {}

local function onPlayerAdded(player)
    player.CharacterAdded:Connect(function(character)
        character:SetAttribute("IsTagged", false)
    end)
end

local function tagPlayer(player)
    if not player.Character then return end
    if player.Character:GetAttribute("IsTagged") then return end

    player.Character:SetAttribute("IsTagged", true)
    taggedPlayers[player] = tick() + TAG_DURATION

    -- Visual indication of being tagged
    local tagEffect = Instance.new("ParticleEmitter")
    tagEffect.Color = ColorSequence.new(Color3.fromRGB(255, 69, 0))
    tagEffect.Parent = player.Character:FindFirstChild("HumanoidRootPart")

    task.delay(TAG_DURATION, function()
        if player.Character then
            player.Character:SetAttribute("IsTagged", false)
            tagEffect:Destroy()
        end
    end)
end

local function updateTags()
    local currentTime = tick()
    for player, endTime in pairs(taggedPlayers) do
        if currentTime > endTime then
            taggedPlayers[player] = nil
        end
    end
end

function TagMechanics.Initialize()
    Players.PlayerAdded:Connect(onPlayerAdded)
    game:GetService("RunService").Heartbeat:Connect(updateTags)
end

function TagMechanics.AttemptTag(player, targetPlayer)
    if not targetPlayer.Character or targetPlayer.Character:GetAttribute("IsTagged") then return false end
    if taggedPlayers[player] and tick() < taggedPlayers[player] + TAG_COOLDOWN then return false end

    tagPlayer(targetPlayer)
    return true
end

return TagMechanics