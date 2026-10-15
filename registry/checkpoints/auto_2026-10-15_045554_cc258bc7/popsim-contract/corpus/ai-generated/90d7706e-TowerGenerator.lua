-- TowerGenerator.lua
-- Handles procedural generation of gothic towers for the Metropolis Generation game
-- Supports gothic architectural styles, varying heights, and decorative elements

local TowerGenerator = {}
TowerGenerator.__index = TowerGenerator

-- Services
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

-- Constants
local TOWER_CONFIG = {
	-- Base dimensions
	MIN_HEIGHT = 30,
	MAX_HEIGHT = 120,
	MIN_WIDTH = 8,
	MAX_WIDTH = 20,
	BASE_THICKNESS = 2,

	-- Gothic style parameters
	SPIRE_HEIGHT_RATIO = 0.25,
	BUTTRESS_COUNT_MIN = 2,
	BUTTRESS_COUNT_MAX = 6,
	WINDOW_ROWS_MIN = 3,
	WINDOW_ROWS_MAX = 8,
	WINDOW_COLS_MIN = 1,
	WINDOW_COLS_MAX = 4,

	-- Material palette
	MATERIALS = {
		Enum.Material.SmoothPlastic,
		Enum.Material.Concrete,
		Enum.Material.Cobblestone,
		Enum.Material.Slate,
		Enum.Material.Granite,
	},

	-- Color palette for gothic aesthetic
	COLORS = {
		STONE_DARK    = Color3.fromRGB(45,  45,  55),
		STONE_MID     = Color3.fromRGB(65,  60,  70),
		STONE_LIGHT   = Color3.fromRGB(90,  85,  95),
		ACCENT_PURPLE = Color3.fromRGB(80,  40, 100),
		ACCENT_TEAL   = Color3.fromRGB(30,  80,  90),
		WINDOW_GLOW   = Color3.fromRGB(180, 100, 255),
		SPIRE_TIP     = Color3.fromRGB(120, 80,  140),
	},

	-- Chaos round modifiers
	CHAOS_SCALE_MIN = 1.2,
	CHAOS_SCALE_MAX = 2.5,
	CHAOS_TILT_MAX  = 15, -- degrees
}

-- Tower type definitions
local TOWER_TYPES = {
	WATCH      = "Watch",
	CATHEDRAL  = "Cathedral",
	FORTRESS   = "Fortress",
	SPIRE      = "Spire",
	MINARET    = "Minaret",
}

-- Internal state
local generatedTowers = {}
local towerCount      = 0
local isChaosModeActive = false
local chaosSeed       = 0

-- ─────────────────────────────────────────────────────────────────────────────
-- Utility helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Seeded random wrapper so the same seed reproduces the same city layout
local function createRng(seed)
	return Random.new(seed)
end

-- Lerp between two numbers
local function lerp(a, b, t)
	return a + (b - a) * t
end

-- Map a value from one range to another
local function remap(value, inMin, inMax, outMin, outMax)
	return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))
end

-- Choose a random element from a table
local function randomChoice(rng, tbl)
	return tbl[rng:NextInteger(1, #tbl)]
end

-- Safe parent helper – returns Workspace folder, creating it if needed
local function getOrCreateFolder(name, parent)
	local folder = parent:FindFirstChild(name)
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = name
		folder.Parent = parent
	end
	return folder
end

-- ─────────────────────────────────────────────────────────────────────────────
-- Part factory helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Creates a single Part with common gothic properties
local function makePart(name, size, cframe, color, material, parent, anchored)
	local part = Instance.new("Part")
	part.Name          = name
	part.Size          = size
	part.CFrame        = cframe
	part.Color         = color
	part.Material      = material
	part.Anchored      = anchored ~= false  -- default true
	part.CastShadow    = true
	part.TopSurface    = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent        = parent
	return part
end

-- Creates a SpecialMesh (wedge / pyramid) on a Part
local function applyMesh(part, meshType, scale)
	local mesh = Instance.new("SpecialMesh")
	mesh.MeshType = meshType
	if scale then mesh.Scale = scale end
	mesh.Parent = part
	return mesh
end

-- Creates a PointLight for gothic window glow
local function addWindowLight(part, color, brightness, range)
	local light = Instance.new("PointLight")
	light.Color      = color
	light.Brightness = brightness or 2
	light.Range      = range or 12
	light.Shadows    = true
	light.Parent     = part
	return light
end

-- Creates a SurfaceGui with a gothic arch TextLabel on a window part
local function applyArchDecal(part, face)
	local gui = Instance.new("SurfaceGui")
	gui.Face    = face or Enum.NormalId.Front
	gui.Parent  = part

	local label = Instance.new("TextLabel")
	label.Size            = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text            = "⌖"   -- decorative gothic rune symbol
	label.TextColor3      = TOWER_CONFIG.COLORS.WINDOW_GLOW
	label.TextScaled      = true
	label.Font            = Enum.Font.Antique
	label.Parent          = gui
end

-- ─────────────────────────────────────────────────────────────────────────────
-- Sub-component generators
-- ─────────────────────────────────────────────────────────────────────────────

-- Generates the main tower body (rectangular column)
local function buildBody(rng, config, parent, basePos)
	local color    = randomChoice(rng, {
		TOWER_CONFIG.COLORS.STONE_DARK,
		TOWER_CONFIG.COLORS.STONE_MID,
	})
	local material = randomChoice(rng, TOWER_CONFIG.MATERIALS)

	local body = makePart(
		"Body",
		Vector3.new(config.width, config.height, config.depth),
		CFrame.new(basePos + Vector3.new(0, config.height / 2, 0)),
		color,
		material,
		parent
	)

	-- Slight texture variation via secondary surface color
	body.Color = color
	return body
end

-- Generates gothic arched windows in rows and columns on a face
local function buildWindows(rng, config, parent, bodyPart)
	local rows    = rng:NextInteger(TOWER_CONFIG.WINDOW_ROWS_MIN, TOWER_CONFIG.WINDOW_ROWS_MAX)
	local cols    = rng:NextInteger(TOWER_CONFIG.WINDOW_COLS_MIN, TOWER_CONFIG.WINDOW_COLS_MAX)

	local winW    = config.width  / (cols + 1)
	local winH    = math.min(config.height / (rows + 1), winW * 2)
	local winD    = TOWER_CONFIG.BASE_THICKNESS * 0.4

	-- Iterate all four cardinal faces
	local faces = {
		{ offset = Vector3.new(0, 0,  config.depth / 2 + winD / 2), face = Enum.NormalId.Front  },
		