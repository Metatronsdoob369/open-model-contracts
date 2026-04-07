local function createTower(position, height, color)
    local tower = Instance.new("Part")
    tower.Size = Vector3.new(10, height, 10)
    tower.Position = position
    tower.Anchored = true
    tower.BrickColor = BrickColor.new(color)
    tower.Material = Enum.Material.SmoothPlastic
    tower.Parent = game:GetService("Workspace")
    return tower
end

local function createBridge(startPos, endPos, color)
    local bridge = Instance.new("Part")
    local length = (endPos - startPos).Magnitude
    bridge.Size = Vector3.new(4, 1, length)
    bridge.CFrame = CFrame.new((startPos + endPos) / 2, endPos)
    bridge.Anchored = true
    bridge.BrickColor = BrickColor.new(color)
    bridge.Material = Enum.Material.Metal
    bridge.Parent = game:GetService("Workspace")
    return bridge
end

local function createAmbientLighting()
    local lighting = Instance.new("PointLight")
    lighting.Color = Color3.fromRGB(75, 0, 130)
    lighting.Brightness = 2
    lighting.Range = 20
    lighting.Parent = game:GetService("Workspace")
    return lighting
end

local function Initialize()
    local basePosition = Vector3.new(0, 0, 0)
    local tower1 = createTower(basePosition + Vector3.new(-50, 0, 0), 100, "Really black")
    local tower2 = createTower(basePosition + Vector3.new(50, 0, 0), 120, "Really black")
    local tower3 = createTower(basePosition + Vector3.new(0, 0, 50), 110, "Really black")
    
    createBridge(tower1.Position + Vector3.new(0, 50, 0), tower2.Position + Vector3.new(0, 60, 0), "Bright red")
    createBridge(tower2.Position + Vector3.new(0, 60, 0), tower3.Position + Vector3.new(0, 55, 0), "Bright red")
    createBridge(tower3.Position + Vector3.new(0, 55, 0), tower1.Position + Vector3.new(0, 50, 0), "Bright red")

    createAmbientLighting()
end

return {
    Initialize = Initialize
}