-- Specialist: architect-01 | Role: Volumetric Construction
-- Mission: Sector Alpha — Tag Game (UPGRADED)
-- Pack: roblox-game-automator v1.1.0

local TagArena = {}

-- Services
local Workspace = game:GetService("Workspace")

-- Configuration
local CONFIG = {
	ARENA_SIZE = 200,
	OBSTACLE_COUNT = 30,
	SPIRE_COUNT = 5,
	COLORS = {
		FLOOR    = Color3.fromRGB(10, 10, 20),   -- Void Obsidian
		OBSTACLE = Color3.fromRGB(15, 52, 96),   -- Teal
		ACCENT   = Color3.fromRGB(83, 52, 131),  -- Violet
		NEON     = Color3.fromRGB(0, 212, 255),  -- Cyber Blue
	}
}

function TagArena.generate()
	local folder = Instance.new("Folder")
	folder.Name = "SectorAlpha_Arena"
	folder.Parent = Workspace
	
	-- 1. Create Floor (Reflective Metal)
	local floor = Instance.new("Part")
	floor.Name = "Floor"
	floor.Size = Vector3.new(CONFIG.ARENA_SIZE, 1, CONFIG.ARENA_SIZE)
	floor.Position = Vector3.new(0, -0.5, 0)
	floor.Color = CONFIG.COLORS.FLOOR
	floor.Anchored = true
	floor.Material = Enum.Material.Metal
	floor.Reflectance = 0.4
	floor.Parent = folder
	
	local rng = Random.new()
	
	-- 2. Create Spires (Tall Landmark Buildings)
	for i = 1, CONFIG.SPIRE_COUNT do
		local spire = Instance.new("Part")
		local sizeY = rng:NextNumber(40, 80)
		spire.Size = Vector3.new(15, sizeY, 15)
		spire.Position = Vector3.new(
			rng:NextNumber(-CONFIG.ARENA_SIZE/2 + 20, CONFIG.ARENA_SIZE/2 - 20),
			sizeY / 2,
			rng:NextNumber(-CONFIG.ARENA_SIZE/2 + 20, CONFIG.ARENA_SIZE/2 - 20)
		)
		spire.Color = CONFIG.COLORS.OBSTACLE
		spire.Anchored = true
		spire.Material = Enum.Material.Glass
		spire.Transparency = 0.2
		spire.Parent = folder
		
		-- Top Beacon
		local beacon = Instance.new("Part")
		beacon.Shape = Enum.PartType.Ball
		beacon.Size = Vector3.new(10, 10, 10)
		beacon.Position = spire.Position + Vector3.new(0, sizeY/2, 0)
		beacon.Color = CONFIG.COLORS.NEON
		beacon.Material = Enum.Material.Neon
		beacon.Anchored = true
		beacon.Parent = spire
	end

	-- 3. Create Obstacles (Procedural Pillars/Walls)
	for i = 1, CONFIG.OBSTACLE_COUNT do
		local obstacle = Instance.new("Part")
		local sizeY = rng:NextNumber(8, 25)
		obstacle.Size = Vector3.new(rng:NextNumber(6, 12), sizeY, rng:NextNumber(6, 12))
		obstacle.Position = Vector3.new(
			rng:NextNumber(-CONFIG.ARENA_SIZE/2 + 10, CONFIG.ARENA_SIZE/2 - 10),
			sizeY / 2,
			rng:NextNumber(-CONFIG.ARENA_SIZE/2 + 10, CONFIG.ARENA_SIZE/2 - 10)
		)
		obstacle.Color = CONFIG.COLORS.OBSTACLE
		obstacle.Anchored = true
		obstacle.Material = Enum.Material.SmoothPlastic
		obstacle.Parent = folder
		
		-- Neon Accent Strip
		local accent = Instance.new("Part")
		accent.Size = Vector3.new(obstacle.Size.X + 0.1, 0.5, obstacle.Size.Z + 0.1)
		accent.Position = obstacle.Position + Vector3.new(0, sizeY/2 - 1, 0)
		accent.Color = CONFIG.COLORS.ACCENT
		accent.Material = Enum.Material.Neon
		accent.Anchored = true
		accent.Parent = obstacle
	end
	
	print("[OMC] Expanded TagArena Manifested.")
	return folder
end

return TagArena
