local CityscapeGenerator = {}

local function createTower(position, height, width)
    local tower = Instance.new("Part")
    tower.Size = Vector3.new(width, height, width)
    tower.Position = position
    tower.Color = Color3.fromHex("#1a1a1a")
    tower.Material = Enum.Material.SmoothPlastic
    tower.Anchored = true
    return tower
end

local function createIntricateLayout(basePosition, complexity)
    local layout = Instance.new("Model")
    for i = 1, complexity do
        local offset = Vector3.new(math.random(-50, 50), 0, math.random(-50, 50))
        local part = Instance.new("Part")
        part.Size = Vector3.new(10, 1, 10)
        part.Position = basePosition + offset
        part.Color = Color3.fromHex("#4b0082")
        part.Material = Enum.Material.SmoothPlastic
        part.Anchored = true
        part.Parent = layout
    end
    return layout
end

local function applyAmbientLighting()
    local lighting = game:GetService("Lighting")
    lighting.Ambient = Color3.fromHex("#1a1a1a")
    lighting.OutdoorAmbient = Color3.fromHex("#4b0082")
    lighting.Brightness = 2
    lighting.FogColor = Color3.fromHex("#1a1a1a")
    lighting.FogEnd = 200
end

function CityscapeGenerator.generateMetropolis()
    local metropolis = Instance.new("Model")
    metropolis.Name = "GothicCyberMetropolis"

    for i = 1, 10 do
        local position = Vector3.new(math.random(-500, 500), 0, math.random(-500, 500))
        local height = math.random(100, 300)
        local width = math.random(20, 50)
        local tower = createTower(position, height, width)
        tower.Parent = metropolis
    end

    local layout = createIntricateLayout(Vector3.new(0, 0, 0), 50)
    layout.Parent = metropolis

    applyAmbientLighting()

    return metropolis
end

return CityscapeGenerator