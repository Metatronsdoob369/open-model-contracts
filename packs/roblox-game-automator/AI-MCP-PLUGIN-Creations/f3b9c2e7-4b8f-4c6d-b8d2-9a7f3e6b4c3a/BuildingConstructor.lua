local BuildingConstructor = {}

function BuildingConstructor.ConstructBuilding(parent, position)
    local building = Instance.new("Model")
    building.Name = "UrbanStructure"
    building.Parent = parent

    local base = Instance.new("Part")
    base.Size = Vector3.new(10, 1, 10)
    base.Position = position + Vector3.new(0, 0.5, 0)
    base.Anchored = true
    base.BrickColor = BrickColor.new("Really black")
    base.Material = Enum.Material.SmoothPlastic
    base.Parent = building

    local height = math.random(3, 8)
    for i = 1, height do
        local floor = Instance.new("Part")
        floor.Size = Vector3.new(10, 2, 10)
        floor.Position = position + Vector3.new(0, 1 + i * 2, 0)
        floor.Anchored = true
        floor.BrickColor = BrickColor.new("Dark indigo")
        floor.Material = Enum.Material.SmoothPlastic
        floor.Parent = building
    end

    local accent = Instance.new("Part")
    accent.Size = Vector3.new(2, height * 2, 2)
    accent.Position = position + Vector3.new(0, height + 1, 0)
    accent.Anchored = true
    accent.BrickColor = BrickColor.new("Bright orange")
    accent.Material = Enum.Material.Neon
    accent.Parent = building

    BuildingConstructor.AddLighting(building)
end

function BuildingConstructor.AddLighting(building)
    for _, part in ipairs(building:GetChildren()) do
        if part:IsA("Part") then
            local light = Instance.new("PointLight")
            light.Color = Color3.fromRGB(255, 69, 0)
            light.Brightness = 2
            light.Range = 15
            light.Parent = part
        end
    end
end

return BuildingConstructor