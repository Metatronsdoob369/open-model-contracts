local PlayerMechanics = {}

local DASH_SPEED = 50
local DASH_DURATION = 0.2
local DASH_COOLDOWN = 1.0
local GLOW_COLOR = Color3.fromRGB(255, 0, 255)
local GLOW_DURATION = 0.5

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local function createGlowEffect(player)
    local character = player.Character
    if not character then return end
    
    for _, part in ipairs(character:GetChildren()) do
        if part:IsA("BasePart") then
            local glow = Instance.new("PointLight")
            glow.Color = GLOW_COLOR
            glow.Brightness = 2
            glow.Range = 10
            glow.Parent = part
            
            delay(GLOW_DURATION, function()
                glow:Destroy()
            end)
        end
    end
end

local function dash(player)
    local character = player.Character
    if not character then return end
    
    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end
    
    local direction = humanoidRootPart.CFrame.LookVector
    local dashVelocity = direction * DASH_SPEED
    
    local originalVelocity = humanoidRootPart.Velocity
    humanoidRootPart.Velocity = dashVelocity
    
    createGlowEffect(player)
    
    wait(DASH_DURATION)
    humanoidRootPart.Velocity = originalVelocity
end

local function onPlayerAdded(player)
    local canDash = true
    
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        
        humanoid.Running:Connect(function(speed)
            if speed > 0 and canDash then
                canDash = false
                dash(player)
                
                delay(DASH_COOLDOWN, function()
                    canDash = true
                end)
            end
        end)
    end)
end

function PlayerMechanics:Initialize()
    print("⚡ [DIRECTOR] Activating Gothic-Cyber Player Mechanics...")
    Players.PlayerAdded:Connect(onPlayerAdded)
    for _, player in ipairs(Players:GetPlayers()) do
        onPlayerAdded(player)
    end
end

return PlayerMechanics