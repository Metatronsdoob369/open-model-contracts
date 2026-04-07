local DashSystem = {}

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local DASH_FORCE = 1000
local DASH_COOLDOWN = 2 -- seconds

local playerDashCooldowns = {}

function DashSystem.Initialize()
    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Connect(function(character)
            local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
            local humanoid = character:WaitForChild("Humanoid")

            UserInputService.InputBegan:Connect(function(input, gameProcessed)
                if gameProcessed then return end
                if input.KeyCode == Enum.KeyCode.LeftShift then
                    DashSystem.Dash(player, humanoidRootPart, humanoid)
                end
            end)
        end)
    end)
end

function DashSystem.Dash(player, humanoidRootPart, humanoid)
    local currentTime = os.time()
    if playerDashCooldowns[player] and currentTime < playerDashCooldowns[player] then
        return
    end

    local lookVector = humanoidRootPart.CFrame.LookVector
    humanoidRootPart:ApplyImpulse(lookVector * DASH_FORCE)

    playerDashCooldowns[player] = currentTime + DASH_COOLDOWN
end

return DashSystem