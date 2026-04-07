local SwimMechanics = {}

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- Configuration
local SWIM_SPEED = 16
local SWIM_ACCELERATION = 8
local WATER_DENSITY = 1.0
local GRAVITY = Vector3.new(0, -9.81, 0)

-- Helper function to check if a player is underwater
local function isUnderwater(player)
    local character = player.Character
    if character then
        local head = character:FindFirstChild("Head")
        if head then
            local waterLevel = workspace.Terrain.WaterLevel
            return head.Position.Y < waterLevel
        end
    end
    return false
end

-- Function to handle swimming physics
local function applySwimPhysics(player, deltaTime)
    local character = player.Character
    if character then
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        local rootPart = character:FindFirstChild("HumanoidRootPart")
        if humanoid and rootPart then
            local moveDirection = humanoid.MoveDirection
            local swimForce = moveDirection * SWIM_ACCELERATION * WATER_DENSITY
            local buoyancyForce = Vector3.new(0, WATER_DENSITY * -GRAVITY.Y, 0)
            local totalForce = swimForce + buoyancyForce
            rootPart.Velocity = rootPart.Velocity + totalForce * deltaTime
            rootPart.Velocity = rootPart.Velocity.Unit * math.min(rootPart.Velocity.Magnitude, SWIM_SPEED)
        end
    end
end

-- Main update loop
local function onUpdate(deltaTime)
    for _, player in ipairs(Players:GetPlayers()) do
        if isUnderwater(player) then
            applySwimPhysics(player, deltaTime)
        end
    end
end

-- Connect the update loop to RunService
RunService.Heartbeat:Connect(onUpdate)

return SwimMechanics