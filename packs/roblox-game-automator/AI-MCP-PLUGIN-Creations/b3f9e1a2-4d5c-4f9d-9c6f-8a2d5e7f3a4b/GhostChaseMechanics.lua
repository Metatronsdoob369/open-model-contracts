local GhostChaseMechanics = {}

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local GHOST_SPEED = 10
local DETECTION_RADIUS = 50

function GhostChaseMechanics:StartChase(ghost, targetPlayer)
    local function onHeartbeat()
        if targetPlayer and targetPlayer.Character and targetPlayer.Character:FindFirstChild("HumanoidRootPart") then
            local targetPosition = targetPlayer.Character.HumanoidRootPart.Position
            local ghostPosition = ghost.Position
            local direction = (targetPosition - ghostPosition).Unit
            ghost.Velocity = direction * GHOST_SPEED
        end
    end

    self.heartbeatConnection = RunService.Heartbeat:Connect(onHeartbeat)
end

function GhostChaseMechanics:StopChase()
    if self.heartbeatConnection then
        self.heartbeatConnection:Disconnect()
        self.heartbeatConnection = nil
    end
end

function GhostChaseMechanics:DetectPlayers(ghost)
    for _, player in ipairs(Players:GetPlayers()) do
        if player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local playerPosition = player.Character.HumanoidRootPart.Position
            if (playerPosition - ghost.Position).Magnitude <= DETECTION_RADIUS then
                return player
            end
        end
    end
    return nil
end

function GhostChaseMechanics:UpdateGhost(ghost)
    local targetPlayer = self:DetectPlayers(ghost)
    if targetPlayer then
        self:StartChase(ghost, targetPlayer)
    else
        self:StopChase()
    end
end

return GhostChaseMechanics