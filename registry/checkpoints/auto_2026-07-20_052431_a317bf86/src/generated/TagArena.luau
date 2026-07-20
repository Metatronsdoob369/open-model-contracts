-- Specialist: architect-01 | Role: Volumetric Construction
-- Mission: Sector Alpha — Tag Game (UPGRADED)
-- Pack: roblox-game-automator v1.1.0

local TagArena = {}

local Workspace = game:GetService("Workspace")

local CONFIG = {
	-- Dance floor tiles surface at Y=0.5 (DATA_CENTER=0, TILE_SIZE.Y=1)
	FLOOR_Y         = 0.5,
	-- Half-extent of the dance floor grid (30 cols * (12+2) / 2 = 210)
	GRID_HALF       = 200,
	-- Radius around center to keep clear of neon pillars (cathedral footprint)
	CATHEDRAL_EXCL  = 65,
	-- Number of neon pillars to scatter on the dance floor
	PILLAR_COUNT    = 30,

	PILLAR_COLOR    = Color3.fromRGB(15, 52, 96),    -- dark teal body
	ACCENT_COLOR    = Color3.fromRGB(140, 0, 220),   -- purple neon trim (matches screenshot)

}

-- Returns true if (x,z) is within the cathedral exclusion zone
local function inCathedralZone(x, z)
	return (x * x + z * z) < (CONFIG.CATHEDRAL_EXCL * CONFIG.CATHEDRAL_EXCL)
end

function TagArena.generate()
	local folder = Instance.new("Folder")
	folder.Name = "SectorAlpha_Arena"
	folder.Parent = Workspace

	local rng = Random.new()

	-- ── Neon Pillars (outside cathedral, on dance floor) ─────────────────────
	local placed = 0
	local attempts = 0
	while placed < CONFIG.PILLAR_COUNT and attempts < CONFIG.PILLAR_COUNT * 10 do
		attempts += 1

		local x = rng:NextNumber(-CONFIG.GRID_HALF + 15, CONFIG.GRID_HALF - 15)
		local z = rng:NextNumber(-CONFIG.GRID_HALF + 15, CONFIG.GRID_HALF - 15)

		if inCathedralZone(x, z) then continue end

		local sizeY = rng:NextNumber(10, 28)
		local sizeXZ = rng:NextNumber(5, 10)

		-- Pillar body
		local pillar = Instance.new("Part")
		pillar.Name = "NeonPillar_" .. placed
		pillar.Size = Vector3.new(sizeXZ, sizeY, sizeXZ)
		pillar.Position = Vector3.new(x, CONFIG.FLOOR_Y + sizeY / 2, z)
		pillar.Color = CONFIG.PILLAR_COLOR
		pillar.Anchored = true
		pillar.Material = Enum.Material.SmoothPlastic
		pillar.Parent = folder

		-- Purple neon trim ring at top
		local trim = Instance.new("Part")
		trim.Name = "Trim"
		trim.Size = Vector3.new(sizeXZ + 1.2, 0.6, sizeXZ + 1.2)
		trim.Position = pillar.Position + Vector3.new(0, sizeY / 2 - 0.3, 0)
		trim.Color = CONFIG.ACCENT_COLOR
		trim.Material = Enum.Material.Neon
		trim.Anchored = true
		trim.CanCollide = false
		trim.Parent = pillar

		-- Soft point light from the trim
		local light = Instance.new("PointLight")
		light.Color = CONFIG.ACCENT_COLOR
		light.Brightness = 2.5
		light.Range = 20
		light.Parent = trim

		placed += 1
	end

	print("[OMC] TagArena Manifested — " .. placed .. " neon pillars on dance floor.")
	return folder
end

return TagArena
