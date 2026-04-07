local function createBuilding(position, size)
    local building = Instance.new("Part")
    building.Size = size
    building.Position = position
    building.Anchored = true
    building.Material = Enum.Material.SmoothPlastic
    building.Color = Color3.fromRGB(46, 43, 95)
    building.Parent = workspace
    return building
end

local function createSpawnLocation()
    local spawnLocation = Instance.new("SpawnLocation")
    spawnLocation.Size = Vector3.new(6, 1, 6)
    spawnLocation.Position = Vector3.new(0, 1, 0)
    spawnLocation.Anchored = true
    spawnLocation.Parent = workspace
end

local function addLighting(part)
    local pointLight = Instance.new("PointLight")
    pointLight.Brightness = 5
    pointLight.Range = 30
    pointLight.Color = Color3.fromRGB(255, 87, 51)
    pointLight.Parent = part
end

local function Initialize()
    createSpawnLocation()
    
    local gridPositions = {
        Vector3.new(-50, 25, -50), Vector3.new(0, 50, -50), Vector3.new(50, 75, -50),
        Vector3.new(-50, 25, 0), Vector3.new(0, 50, 0), Vector3.new(50, 75, 0),
        Vector3.new(-50, 25, 50), Vector3.new(0, 50, 50), Vector3.new(50, 75, 50),
        Vector3.new(100, 100, 0)
    }

    local buildingSizes = {
        Vector3.new(20, 50, 20), Vector3.new(20, 100, 20), Vector3.new(20, 150, 20),
        Vector3.new(20, 50, 20), Vector3.new(20, 100, 20), Vector3.new(20, 150, 20),
        Vector3.new(20, 50, 20), Vector3.new(20, 100, 20), Vector3.new(20, 150, 20),
        Vector3.new(20, 200, 20)
    }

    for i, position in ipairs(gridPositions) do
        local building = createBuilding(position, buildingSizes[i])
        addLighting(building)
    end

    local lighting = game:GetService("Lighting")
    lighting.Ambient = Color3.fromRGB(50, 40, 60)
end

return { Initialize = Initialize }