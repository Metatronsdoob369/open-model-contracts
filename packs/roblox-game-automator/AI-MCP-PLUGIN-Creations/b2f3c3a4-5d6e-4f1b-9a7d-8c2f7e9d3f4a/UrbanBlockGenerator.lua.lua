local UrbanBlockGenerator = {}

local function createObsidianTower(position, height)
    local tower = Instance.new("Model")
    tower.Name = "ObsidianTower"
    
    for i = 1, height do
        local floor = Instance.new("Part")
        floor.Size = Vector3.new(20, 4, 20)
        floor.Position = position + Vector3.new(0, (i - 1) * 4, 0)
        floor.Anchored = true
        floor.BrickColor = BrickColor.new("Really black")
        floor.Material = Enum.Material.SmoothPlastic
        floor.Parent = tower
    end

    local neonSign = Instance.new("Part")
    neonSign.Size = Vector3.new(18, 2, 0.5)
    neonSign.Position = position + Vector3.new(0, height * 4, 10)
    neonSign.Anchored = true
    neonSign.BrickColor = BrickColor.new("Hot pink")
    neonSign.Material = Enum.Material.Neon
    neonSign.Parent = tower

    return tower
end

local function createPedestrianUnderpass(position)
    local underpass = Instance.new("Model")
    underpass.Name = "PedestrianUnderpass"

    local base = Instance.new("Part")
    base.Size = Vector3.new(40, 1, 20)
    base.Position = position
    base.Anchored = true
    base.BrickColor = BrickColor.new("Really black")
    base.Material = Enum.Material.SmoothPlastic
    base.Parent = underpass

    local ceiling = Instance.new("Part")
    ceiling.Size = Vector3.new(40, 1, 20)
    ceiling.Position = position + Vector3.new(0, 5, 0)
    ceiling.Anchored = true
    ceiling.BrickColor = BrickColor.new("Really black")
    ceiling.Material = Enum.Material.SmoothPlastic
    ceiling.Parent = underpass

    local wall1 = Instance.new("Part")
    wall1.Size = Vector3.new(1, 5, 20)
    wall1.Position = position + Vector3.new(-20, 2.5, 0)
    wall1.Anchored = true
    wall1.BrickColor = BrickColor.new("Really black")
    wall1.Material = Enum.Material.SmoothPlastic
    wall1.Parent = underpass

    local wall2 = Instance.new("Part")
    wall2.Size = Vector3.new(1, 5, 20)
    wall2.Position = position + Vector3.new(20, 2.5, 0)
    wall2.Anchored = true
    wall2.BrickColor = BrickColor.new("Really black")
    wall2.Material = Enum.Material.SmoothPlastic
    wall2.Parent = underpass

    return underpass
end

function UrbanBlockGenerator:GenerateBlock(basePosition)
    local block = Instance.new("Model")
    block.Name = "UrbanBlock"

    local tower1 = createObsidianTower(basePosition + Vector3.new(-30, 0, 0), 6)
    tower1.Parent = block

    local tower2 = createObsidianTower(basePosition + Vector3.new(30, 0, 0), 6)
    tower2.Parent = block

    local underpass = createPedestrianUnderpass(basePosition + Vector3.new(0, 0, 0))
    underpass.Parent = block

    return block
end

function UrbanBlockGenerator:Initialize()
    print("🏙️ [DIRECTOR] Manifesting Urban Block DNA...")
    return self:GenerateBlock(Vector3.new(0, 0, 0))
end

return UrbanBlockGenerator