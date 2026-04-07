local ChaseMechanics = {}

local Players = game:GetService('Players')
local RunService = game:GetService('RunService')

-- Configuration
local GRAVITY = Vector3.new(0, -196.2, 0) -- Standard gravity
local JUMP_FORCE = 50
local CLIMB_SPEED = 20
local CHASE_SPEED = 30

-- Helper function to apply physics
local function applyPhysics(character, deltaTime)
    local humanoid = character:FindFirstChildOfClass('Humanoid')
    if humanoid then
        local rootPart = character:FindFirstChild('HumanoidRootPart')
        if rootPart then
            -- Apply gravity
            rootPart.Velocity = rootPart.Velocity + GRAVITY * deltaTime
        end
    end
end

-- Function to handle jumping
function ChaseMechanics:Jump(character)
    local humanoid = character:FindFirstChildOfClass('Humanoid')
    if humanoid and humanoid:GetState() == Enum.HumanoidStateType.Freefall then
        humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
        local rootPart = character:FindFirstChild('HumanoidRootPart')
        if rootPart then
            rootPart.Velocity = Vector3.new(rootPart.Velocity.X, JUMP_FORCE, rootPart.Velocity.Z)
        end
    end
end

-- Function to handle climbing
function ChaseMechanics:Climb(character, direction)
    local humanoid = character:FindFirstChildOfClass('Humanoid')
    if humanoid then
        local rootPart = character:FindFirstChild('HumanoidRootPart')
        if rootPart then
            rootPart.Velocity = Vector3.new(rootPart.Velocity.X, CLIMB_SPEED * direction, rootPart.Velocity.Z)
        end
    end
end

-- Function to handle chasing
function ChaseMechanics:Chase(character, targetPosition)
    local humanoid = character:FindFirstChildOfClass('Humanoid')
    if humanoid then
        local rootPart = character:FindFirstChild('HumanoidRootPart')
        if rootPart then
            local direction = (targetPosition - rootPart.Position).Unit
            rootPart.Velocity = Vector3.new(direction.X * CHASE_SPEED, rootPart.Velocity.Y, direction.Z * CHASE_SPEED)
        end
    end
end

-- Update loop for applying physics
RunService.Heartbeat:Connect(function(deltaTime)
    for _, player in ipairs(Players:GetPlayers()) do
        local character = player.Character
        if character then
            applyPhysics(character, deltaTime)
        end
    end
end)

return ChaseMechanics