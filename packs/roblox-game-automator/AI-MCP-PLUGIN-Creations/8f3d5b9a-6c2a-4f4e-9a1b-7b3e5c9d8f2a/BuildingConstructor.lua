local BuildingConstructor = {}

function BuildingConstructor:CreateBuilding(position)
    local workspace = game:GetService("Workspace")
    
    -- Create a base part for the building
    local base = Instance.new("Part")
    base.Size = Vector3.new(40, 1, 40)
    base.Position = position
    base.Anchored = true
    base.BrickColor = BrickColor.new("Really black")
    base.Parent = workspace
    
    -- Create the main structure
    local height = math.random(50, 100)
    local structure = Instance.new("Part")
    structure.Size = Vector3.new(40, height, 40)
    structure.Position = position + Vector3.new(0, height / 2, 0)
    structure.Anchored = true
    structure.BrickColor = BrickColor.new("Dark stone grey")
    structure.Parent = workspace
    
    -- Add cyber accents
    local accent = Instance.new("Part")
    accent.Size = Vector3.new(2, height, 2)
    accent.Position = position + Vector3.new(19, height / 2, 19)
    accent.Anchored = true
    accent.BrickColor = BrickColor.new("Neon orange")
    accent.Material = Enum.Material.Neon
    accent.Parent = workspace
    
    -- Add ambient sound
    local sound = Instance.new("Sound")
    sound.SoundId = "rbxassetid://12345678" -- Placeholder ID
    sound.Looped = true
    sound.Volume = 0.5
    sound.Parent = base
    sound:Play()
end

return BuildingConstructor