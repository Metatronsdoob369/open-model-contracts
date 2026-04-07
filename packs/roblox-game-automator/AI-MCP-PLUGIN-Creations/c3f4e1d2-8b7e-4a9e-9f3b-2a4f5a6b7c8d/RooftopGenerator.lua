local RooftopGenerator = {}

local function createNeonMaterial(primaryColor, secondaryColor)
    return {
        BaseMaterial = Enum.Material.SmoothPlastic,
        Color = primaryColor,
        Reflectance = 0.1,
        Neon = true,
        SecondaryColor = secondaryColor
    }
end

local function createRainSlickSurface(size, position)
    local surface = Instance.new("Part")
    surface.Size = size
    surface.Position = position
    surface.Anchored = true
    surface.Material = Enum.Material.SmoothPlastic
    surface.Color = Color3.fromRGB(50, 50, 50)
    surface.Reflectance = 0.5
    surface.TopSurface = Enum.SurfaceType.Smooth
    return surface
end

local function addNeonAccents(part, accentColor)
    local neonPart = Instance.new("Part")
    neonPart.Size = Vector3.new(part.Size.X, 0.2, part.Size.Z)
    neonPart.Position = part.Position + Vector3.new(0, part.Size.Y / 2 + 0.1, 0)
    neonPart.Anchored = true
    neonPart.Material = Enum.Material.Neon
    neonPart.Color = accentColor
    neonPart.Parent = part
end

function RooftopGenerator:GenerateRooftop(size, position)
    local rooftop = createRainSlickSurface(size, position)
    local neonMaterial = createNeonMaterial(Color3.fromRGB(255, 0, 127), Color3.fromRGB(0, 255, 204))
    rooftop.Material = neonMaterial.BaseMaterial
    rooftop.Color = neonMaterial.Color
    rooftop.Reflectance = neonMaterial.Reflectance
    addNeonAccents(rooftop, Color3.fromRGB(255, 204, 0))
    return rooftop
end

return RooftopGenerator