local TrafficController = {}

-- Required Services
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")

-- Configuration
local COLOR_NEON_RED = Color3.fromRGB(255, 30, 30)
local TRAFFIC_COUNT = 30
local SPEED = 120

function TrafficController:SpawnTraffic()
    print("🚦 [TRAFFIC] Igniting Data Streams...")
    
    local old = Workspace:FindFirstChild("CityTraffic")
    if old then old:Destroy() end
    
    local root = Instance.new("Model")
    root.Name = "CityTraffic"
    root.Parent = Workspace

    -- Procedural Data Stream (Flying Pulse)
    local function createPulse()
        local pulse = Instance.new("Part")
        pulse.Size = Vector3.new(1, 1, 10)
        pulse.Color = COLOR_NEON_RED
        pulse.Material = Enum.Material.Neon
        pulse.Transparency = 0.5
        pulse.Anchored = true
        pulse.CanCollide = false
        pulse.Parent = root
        
        local light = Instance.new("PointLight")
        light.Color = COLOR_NEON_RED
        light.Range = 25
        light.Brightness = 8
        light.Parent = pulse
        
        return pulse
    end

    -- Run Loop for Traffic
    local pulses = {}
    for i = 1, TRAFFIC_COUNT do
        local p = createPulse()
        local isXAxis = math.random() > 0.5
        local lane = math.random(-6, 6) * 80
        
        local state = {
            part = p,
            isXAxis = isXAxis,
            lane = lane,
            pos = math.random(-500, 500)
        }
        table.insert(pulses, state)
    end

    -- Move pulses in Heartbeat
    RunService.Heartbeat:Connect(function(dt)
        for _, s in ipairs(pulses) do
            s.pos = s.pos + (SPEED * dt)
            if (s.pos > 500) then s.pos = -500 end
            
            if s.isXAxis then
                s.part.CFrame = CFrame.new(s.pos, 5, s.lane)
            else
                s.part.CFrame = CFrame.new(s.lane, 5, s.pos) * CFrame.Angles(0, math.rad(90), 0)
            end
        end
    end)
end

function TrafficController:Initialize()
    self:SpawnTraffic()
end

return TrafficController