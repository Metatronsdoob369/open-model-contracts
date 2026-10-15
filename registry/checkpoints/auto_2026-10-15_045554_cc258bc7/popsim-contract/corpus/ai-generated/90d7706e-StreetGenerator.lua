-- StreetGenerator.lua
-- Handles procedural generation of gothic city streets, intersections, and layout
-- for a tag game with dashing abilities and chaos rounds

local StreetGenerator = {}
StreetGenerator.__index = StreetGenerator

-- Services
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

-- Constants
local STREET_TILE_SIZE = 20
local BLOCK_SIZE = 120
local CITY_GRID_WIDTH = 8
local CITY_GRID_HEIGHT = 8
local ALLEY_WIDTH = 8
local SIDEWALK_WIDTH = 6
local STREET_WIDTH = 18
local LAMP_POST_SPACING = 40
local CHAOS_FLICKER_INTERVAL = 0.3

-- Street types for gothic city variety
local STREET_TYPES = {
	MAIN_BOULEVARD = "MainBoulevard",
	ALLEY = "Alley",
	INTERSECTION = "Intersection",
	CROSSROAD = "Crossroad",
	DEAD_END = "DeadEnd",
	PLAZA = "Plaza",
}

-- Material and color themes for gothic aesthetic
local GOTHIC_MATERIALS = {
	cobblestone = Enum.Material.Cobblestone,
	slate = Enum.Material.Slate,
	concrete = Enum.Material.Concrete,
	brick = Enum.Material.Brick,
	metal = Enum.Material.Metal,
	wood = Enum.Material.Wood,
}

local GOTHIC_COLORS = {
	darkStone = Color3.fromRGB(45, 40, 50),
	cobble = Color3.fromRGB(80, 75, 85),
	lampLight = Color3.fromRGB(255, 200, 100),
	lampPost = Color3.fromRGB(30, 30, 35),
	sidewalk = Color3.fromRGB(90, 85, 95),
	roadLine = Color3.fromRGB(150, 140, 160),
	chaosGlow = Color3.fromRGB(180, 0, 255),
	fogColor = Color3.fromRGB(60, 50, 80),
}

-- Chaos round visual multipliers
local CHAOS_SETTINGS = {
	flickerEnabled = false,
	glowIntensity = 1.0,
	fogDensity = 0.3,
	chaosColor = GOTHIC_COLORS.chaosGlow,
}

-- StreetGenerator Constructor
function StreetGenerator.new(config)
	local self = setmetatable({}, StreetGenerator)

	-- Configuration
	self.config = config or {}
	self.seed = self.config.seed or math.random(1, 999999)
	self.gridWidth = self.config.gridWidth or CITY_GRID_WIDTH
	self.gridHeight = self.config.gridHeight or CITY_GRID_HEIGHT
	self.originPosition = self.config.origin or Vector3.new(0, 0, 0)
	self.parentFolder = self.config.parent or workspace

	-- State management
	self.state = {
		isGenerated = false,
		isChaosRound = false,
		streetGrid = {},
		generatedParts = {},
		lampPosts = {},
		intersectionMarkers = {},
		activeConnections = {},
		chaosEffects = {},
	}

	-- Random number generator seeded for reproducibility
	self.rng = Random.new(self.seed)

	-- Folder references for organization
	self.folders = {}

	return self
end

-- Initialize folder structure in workspace
function StreetGenerator:_initFolders()
	local rootFolder = Instance.new("Folder")
	rootFolder.Name = "StreetGenerator_Root"
	rootFolder.Parent = self.parentFolder

	local subFolders = {
		"Streets",
		"Intersections",
		"Sidewalks",
		"LampPosts",
		"Decals",
		"ChaosEffects",
		"Alleys",
		"Plazas",
	}

	for _, name in ipairs(subFolders) do
		local folder = Instance.new("Folder")
		folder.Name = name
		folder.Parent = rootFolder
		self.folders[name] = folder
	end

	self.folders.Root = rootFolder
end

-- Seeded random float in range
function StreetGenerator:_rand(min, max)
	return min + self.rng:NextNumber() * (max - min)
end

-- Seeded random integer in range
function StreetGenerator:_randInt(min, max)
	return math.floor(self:_rand(min, max + 1))
end

-- Build the street grid layout using a simple cellular grid
function StreetGenerator:_buildStreetGrid()
	local grid = {}

	-- Initialize grid cells
	for x = 1, self.gridWidth do
		grid[x] = {}
		for z = 1, self.gridHeight do
			grid[x][z] = {
				type = nil,
				hasNorth = false,
				hasSouth = false,
				hasEast = false,
				hasWest = false,
				isIntersection = false,
				isAlley = false,
				streetWidth = STREET_WIDTH,
			}
		end
	end

	-- Every even column is a vertical street, every even row is a horizontal street
	for x = 1, self.gridWidth do
		for z = 1, self.gridHeight do
			local cell = grid[x][z]
			local isVerticalStreet = (x % 2 == 0)
			local isHorizontalStreet = (z % 2 == 0)

			if isVerticalStreet and isHorizontalStreet then
				-- Intersection
				cell.type = STREET_TYPES.INTERSECTION
				cell.hasNorth = true
				cell.hasSouth = true
				cell.hasEast = true
				cell.hasWest = true
				cell.isIntersection = true
			elseif isVerticalStreet then
				-- Vertical road segment
				cell.type = STREET_TYPES.MAIN_BOULEVARD
				cell.hasNorth = true
				cell.hasSouth = true
				cell.streetWidth = STREET_WIDTH
			elseif isHorizontalStreet then
				-- Horizontal road segment
				cell.type = STREET_TYPES.MAIN_BOULEVARD
				cell.hasEast = true
				cell.hasWest = true
				cell.streetWidth = STREET_WIDTH
			else
				-- City block (building plots)
				cell.type = nil

				-- Chance of adding an alley
				if self.rng:NextNumber() < 0.25 then
					cell.isAlley = true
					cell.type = STREET_TYPES.ALLEY
					cell.streetWidth = ALLEY_WIDTH
				end
			end
		end
	end

	-- Randomly designate one open cell as a Plaza
	local plazaX = self:_randInt(1, self.gridWidth)
	local plazaZ = self:_randInt(1, self.gridHeight)
	if grid[plazaX][plazaZ].type == nil or grid[plazaX][plazaZ].isAlley then
		grid[plazaX][plazaZ].type = STREET_TYPES.PLAZA
		grid[plazaX][plazaZ].isAlley = false
	end

	self.state.streetGrid = grid
	return grid
end

-- Calculate world position for a grid cell
function StreetGenerator:_gridToWorld(gx, gz)
	local worldX = self.originPosition.X + (gx - 1) * (BLOCK_SIZE + STREET_WIDTH)
	local worldZ = self.originPosition.Z + (gz - 1) * (BLOCK_SIZE + STREET_WIDTH)
	return Vector3.new(worldX, self.originPosition.Y, worldZ)
end

-- Create a Part with gothic styling
function StreetGenerator:_createPart(name, size, position, color, material, parent, anchored)
	local part = Instance.new("Part")
	part.Name =