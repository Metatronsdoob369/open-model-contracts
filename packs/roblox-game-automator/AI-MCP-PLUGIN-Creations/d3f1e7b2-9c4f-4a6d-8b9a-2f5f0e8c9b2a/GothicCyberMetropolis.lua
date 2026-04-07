local function createBuilding(position, size, color)
    local building = Instance.new("Part")
    building.Size = size
    building.Position = position
    building.Anchored = true
    building.BrickColor = BrickColor.new(color)
    building.Material = Enum.Material.SmoothPlastic
    building.Parent = game:GetService("Workspace")
    return building
end

local function createAmbientSound()
    local sound = Instance.new("Sound")
    sound.SoundId = ""
    sound.Volume = 0.3
    sound.PlaybackSpeed = 0.5
    sound.Looped = true
    sound.Parent = game:GetService("SoundService")
    sound:Play()
end

local function createLighting()
    local lighting = game:GetService("Lighting")
    lighting.Ambient = Color3.fromRGB(15, 15, 15)
    lighting.OutdoorAmbient = Color3.fromRGB(26, 26, 26)
    lighting.Brightness = 2
    lighting.ClockTime = 20
end

local function Initialize()
    createLighting()
    createAmbientSound()

    local basePosition = Vector3.new(0, 0, 0)
    local gridSpacing = 100
    local buildingColors = {"Really black", "Black", "Dark stone grey"}
    local buildingSizes = {
        Vector3.new(30, 200, 30),
        Vector3.new(40, 250, 40),
        Vector3.new(50, 300, 50),
        Vector3.new(60, 350, 60),
        Vector3.new(70, 400, 70)
    }

    for x = -2, 2 do
        for z = -2, 2 do
            local position = basePosition + Vector3.new(x * gridSpacing, 0, z * gridSpacing)
            local size = buildingSizes[math.random(1, #buildingSizes)]
            local color = buildingColors[math.random(1, #buildingColors)]
            createBuilding(position, size, color)
        end
    end
end

return {
    Initialize = Initialize
}