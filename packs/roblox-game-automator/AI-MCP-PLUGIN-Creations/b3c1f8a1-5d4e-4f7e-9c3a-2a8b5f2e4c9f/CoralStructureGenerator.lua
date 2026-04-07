local CoralStructureGenerator = {}

local function createCoralPart(position, size, color)
    local part = Instance.new("Part")
    part.Position = position
    part.Size = size
    part.Anchored = true
    part.Material = Enum.Material.SmoothPlastic
    part.Color = color
    part.Shape = Enum.PartType.Block
    return part
end

local function addBioluminescence(part, intensity)
    local light = Instance.new("PointLight")
    light.Parent = part
    light.Color = Color3.fromRGB(0, 255, 204) -- secondary color
    light.Brightness = intensity
    light.Range = 10
end

function CoralStructureGenerator.generateCoralStructure(parent, position)
    local baseSize = Vector3.new(4, 1, 4)
    local baseColor = Color3.fromRGB(0, 51, 102) -- primary color
    local basePart = createCoralPart(position, baseSize, baseColor)
    basePart.Parent = parent

    local branches = 5
    for i = 1, branches do
        local branchPosition = position + Vector3.new(math.random(-2, 2), math.random(2, 5), math.random(-2, 2))
        local branchSize = Vector3.new(math.random(1, 2), math.random(3, 5), math.random(1, 2))
        local branchColor = Color3.fromRGB(255, 102, 204) -- accent color
        local branchPart = createCoralPart(branchPosition, branchSize, branchColor)
        branchPart.Parent = parent
        addBioluminescence(branchPart, math.random(2, 5))
    end
end

return CoralStructureGenerator