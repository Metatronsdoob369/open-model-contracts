local function createBuilding(x, z)
    local height = math.random(60, 300)
    local building = Instance.new("Part")
    building.Size = Vector3.new(20, height, 20)
    building.Position = Vector3.new(x, height / 2, z)
    building.Anchored = true
    building.BrickColor = BrickColor.new("Really black")
    building.Material = Enum.Material.SmoothPlastic
    building.Parent = game:GetService("Workspace")

    local pointLight = Instance.new("PointLight")
    pointLight.Brightness = 5
    pointLight.Range = 30
    pointLight.Color = Color3.fromRGB(128, 0, 128) -- Neon purple
    pointLight.Parent = building
end

local function createSpawnLocation()
    local spawnLocation = Instance.new("SpawnLocation")
    spawnLocation.Size = Vector3.new(6, 1, 6)
    spawnLocation.Position = Vector3.new(0, 1, 0)
    spawnLocation.Anchored = true
    spawnLocation.Parent = game:GetService("Workspace")
end

local function Initialize()
    createSpawnLocation()

    local gridSize = 5
    local spacing = 80
    for i = 0, gridSize - 1 do
        for j = 0, gridSize - 1 do
            local x = i * spacing
            local z = j * spacing
            createBuilding(x, z)
        end
    end

    local lighting = game:GetService("Lighting")
    lighting.Ambient = Color3.fromRGB(50, 40, 60)
end

return { Initialize = Initialize }