--[=[
    DanceFloorService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: World_Visuals
    Law Compliance: Token Integrity §4, Phase Resonance §2
    
    TOKENIZED PRIMER (Grid Generation & Pattern Manifestation):
    - Generates dynamic part grids based on positional tokens.
    - Synchronized pattern engine with Heartpulse telemetry.
    - No hard-coded map dependencies.
]=]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

-- Sovereign Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

-- Native Bridge Factory (SafeFire)
local function CreateBridge(name)
	local remote = ReplicatedStorage:FindFirstChild(name) or Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = ReplicatedStorage
	return {
		FireAll = function(...) remote:FireAllClients(...) end,
		_remote = remote
	}
end

local DanceFloorService = {
	Name = "DanceFloorService",
	Config = {
		ROWS = 30, COLS = 30, -- Continental Scale
		DATA_CENTER = Vector3.new(0, 0, 0), -- Base Anchor
		TILE_SIZE = Vector3.new(12, 1, 12),
		SPACING = 2,
		INTERVAL = 0.8,
		PALETTE = {
			Color3.fromRGB(0, 255, 200),   -- Vibrant Matte Cyan
			Color3.fromRGB(255, 90, 150),  -- Soft Coral Pink
			Color3.fromRGB(180, 120, 255), -- Pastel Lavender
			Color3.fromRGB(255, 200, 50)   -- Bright Amber
		},
	},
	Bridges = {
		Resonance = CreateBridge("OMC_ResonanceUpdate"),
	},
	State = { tiles = {}, manifest = nil, active = true },
}

-- [[ RESONANCE LOGIC ]]

function DanceFloorService:_manifestGrid()
	if self.State.manifest then self.State.manifest:Destroy() end
	local f = Instance.new("Folder")
	f.Name = "Sovereign_Floor_Manifest"
	f.Parent = Workspace
	self.State.manifest = f
	
	local c = self.Config
	
	-- Solid ground beneath the tile grid so players cannot fall through gaps
	local totalWidth = c.COLS * (c.TILE_SIZE.X + c.SPACING) + 20
	local totalDepth = c.ROWS * (c.TILE_SIZE.Z + c.SPACING) + 20
	local ground = Instance.new("Part")
	ground.Name = "SolidGround"
	ground.Size = Vector3.new(totalWidth, 2, totalDepth)
	ground.CFrame = CFrame.new(c.DATA_CENTER.X, c.DATA_CENTER.Y - 1, c.DATA_CENTER.Z)
	ground.Anchored = true
	ground.CanCollide = true
	ground.Material = Enum.Material.SmoothPlastic
	ground.Color = Color3.fromRGB(15, 15, 25)
	ground.Parent = f
	
	local startX = c.DATA_CENTER.X - ((c.COLS * (c.TILE_SIZE.X + c.SPACING)) / 2)
	local startZ = c.DATA_CENTER.Z - ((c.ROWS * (c.TILE_SIZE.Z + c.SPACING)) / 2)
	
	for r = 1, c.ROWS do
		self.State.tiles[r] = {}
		for col = 1, c.COLS do
			local p = Instance.new("Part")
			p.Size = c.TILE_SIZE
			p.Anchored = true
			p.Material = Enum.Material.SmoothPlastic -- Swapped from Neon to stop bloom washout
			p.Reflectance = 0.3 -- Bounces the Rave lasers luxuriously
			p.CFrame = CFrame.new(startX + (col * (c.TILE_SIZE.X + c.SPACING)), c.DATA_CENTER.Y, startZ + (r * (c.TILE_SIZE.Z + c.SPACING)))
			
			-- [[ BMW XENON HIGHLIGHTING ]]
			local edge = Instance.new("SelectionBox")
			edge.Name = "Xenon_Edge"
			edge.Adornee = p
			edge.Color3 = Color3.fromRGB(255, 255, 255)
			edge.LineThickness = 0.02
			edge.Transparency = 0.5
			edge.Parent = p
			
			p.Parent = f
			self.State.tiles[r][col] = p
		end
	end
end

function DanceFloorService:_pulse(mode)
	local c = self.Config
	for r=1, c.ROWS do
		for col=1, c.COLS do
			local tile = self.State.tiles[r][col]
			if mode == 1 then -- Spark
				tile.Color = c.PALETTE[math.random(1, #c.PALETTE)]
			else -- Checker
				tile.Color = ((r+col)%2==0) and c.PALETTE[1] or c.PALETTE[2]
			end
			-- We keep SmoothPlastic during the pulse instead of reverting to Neon
		end
	end
	
	-- Temporal Push to Client Bridge
	self.Bridges.Resonance:FireAll(mode)
	Telemetry.dispatchPulse({ event = "Resonance_Pulse", mode = mode })
end

function DanceFloorService:Start()
	self:_manifestGrid()
	task.spawn(function()
		local iteration = 0
		while self.State.active do
			iteration += 1
			self:_pulse(iteration % 2 == 0 and 1 or 2)
			task.wait(self.Config.INTERVAL)
		end
	end)
end

function DanceFloorService:Init()
	print("🏮 [DANCE] 4D Resonator Anchored.")
end

return DanceFloorService
