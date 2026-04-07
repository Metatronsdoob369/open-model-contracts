local function createBuilding(position, size, height)
    local building = Instance.new("Part")
    building.Size = Vector3.new(size.X, height, size.Z)
    building.Position = Vector3.new(position.X, height / 2, position.Z)
    building.Anchored = true
    building.BrickColor = BrickColor.new("Really black")
    building.Material = Enum.Material.SmoothPlastic
    building.Parent = game:GetService("Workspace")

    local light = Instance.new("PointLight")
    light.Brightness = 5
    light.Range = 30
    light.Color = Color3.fromRGB(138, 43, 226) -- Neon purple
    light.Parent = building
end

local function createSpawnLocation()
    local spawnLocation = Instance.new("SpawnLocation")
    spawnLocation.Size = Vector3.new(6, 1, 6)
    spawnLocation.Position = Vector3.new(0, 1, 0)
    spawnLocation.Anchored = true
    spawnLocation.BrickColor = BrickColor.new("Really black")
    spawnLocation.Material = Enum.Material.SmoothPlastic
    spawnLocation.Parent = game:GetService("Workspace")
end

local function Initialize()
    local gridSize = 5
    local spacing = 80
    local minHeight = 60
    local maxHeight = 300

    for x = 0, gridSize - 1 do
        for z = 0, gridSize - 1 do
            local position = Vector3.new(x * spacing, 0, z * spacing)
            local size = Vector3.new(20, 1, 20)
            local height = math.random(minHeight, maxHeight)
            createBuilding(position, size, height)
        end
    end

    createSpawnLocation()

    local lighting = game:GetService("Lighting")
    lighting.Ambient = Color3.fromRGB(50, 40, 60)
end

return { Initialize = Initialize }