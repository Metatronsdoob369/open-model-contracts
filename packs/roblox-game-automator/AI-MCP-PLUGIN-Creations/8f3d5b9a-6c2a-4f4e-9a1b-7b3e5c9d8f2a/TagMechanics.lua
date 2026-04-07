local TagMechanics = {}

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

local TAG_DURATION = 10 -- seconds
local TAG_COOLDOWN = 5 -- seconds

local taggedPlayer = nil
local tagEndTime = 0

function TagMechanics.Initialize()
    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Connect(function(character)
            character.Touched:Connect(function(hit)
                if taggedPlayer and taggedPlayer == player then
                    return
                end

                local otherPlayer = Players:GetPlayerFromCharacter(hit.Parent)
                if otherPlayer and otherPlayer ~= player then
                    TagMechanics.TagPlayer(otherPlayer)
                end
            end)
        end)
    end)
end

function TagMechanics.TagPlayer(player)
    if taggedPlayer or os.time() < tagEndTime + TAG_COOLDOWN then
        return
    end

    taggedPlayer = player
    tagEndTime = os.time() + TAG_DURATION

    -- Notify players
    for _, p in ipairs(Players:GetPlayers()) do
        p:SendNotification({
            Title = "Tag!",
            Text = player.Name .. " is it!",
            Duration = 3
        })
    end

    task.delay(TAG_DURATION, function()
        if taggedPlayer == player then
            taggedPlayer = nil
            -- Notify players
            for _, p in ipairs(Players:GetPlayers()) do
                p:SendNotification({
                    Title = "Tag Ended",
                    Text = player.Name .. " is no longer it.",
                    Duration = 3
                })
            end
        end
    end)
end

return TagMechanics