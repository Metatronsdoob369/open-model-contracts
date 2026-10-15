--[=[
    CathedralRaveService.luau
    Status: PROTOCOL | Diamond-Stable | Sovereign-Native
    OMC Room: WorldState -> Client_Visual
    Law Compliance: Phase Resonance §2, Dependency Autonomy §8
    
    REPAIRED VERSION (Superbullet-Free):
    - Decoupled from legacy Superbullet.ai Framework.
    - Native Sovereign lifecycle management (Init/Start).
    - Hardened Geometry Bounds & Phasic Search.
]=]

local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Infrastructure Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

local CathedralRaveService = {
	Config = {
		CATHEDRAL_NAME = "cathedral",
		LIGHT_COUNT = 8,
		LASER_COUNT = 6,
		COLOR_CYCLE_SPEED = 0.7,
		LASER_SWEEP_SPEED = 1.4,
		LIGHT_BRIGHTNESS = 8.5,   -- Lowered to prevent character washout
		LIGHT_RANGE = 75,         -- Maintains the map-wide spread
		RAVE_COLORS = {
			Color3.fromRGB(255,   0,  80),  
			Color3.fromRGB(  0, 200, 255),  
			Color3.fromRGB(180,   0, 255),  
			Color3.fromRGB(  0, 255,  80),  
			Color3.fromRGB(255, 140,   0),  
			Color3.fromRGB(255, 255,   0),  
			Color3.fromRGB(255,   0,   0),  
			Color3.fromRGB(  0,  80, 255),  
		},
		TILT_ANGLES = { 20, 30, 40, 25, 35, 45 },
		Enabled = true,
	},
	
	State = {
		cathedral = nil,
		effectFolder = nil,
		lights = {},
		lasers = {},
		elapsed = 0,
		animationConnection = nil,
		lastPulse = 0,
	},
}

-- [[ PHASIC SEARCH ]]
local function findCathedralGoverned(cathedralName)
	local cathedral = nil
	for _, child in ipairs(Workspace:GetChildren()) do
		if child:IsA("Model") and child.Name:lower():find(cathedralName:lower(), 1, true) then
			cathedral = child
			break
		end
	end
	
	if not cathedral then
		local signal = Instance.new("BindableEvent")
		local conn
		conn = Workspace.ChildAdded:Connect(function(child)
			if child:IsA("Model") and child.Name:lower():find(cathedralName:lower(), 1, true) then
				cathedral = child
				conn:Disconnect()
				signal:Fire()
			end
		end)
		task.delay(10, function() if not cathedral then conn:Disconnect() signal:Fire() end end)
		if not cathedral then signal.Event:Wait() end
		signal:Destroy()
	end
	return cathedral
end

local function getCathedralBounds(cathedral)
	if cathedral:IsA("Model") then
		local cf, size = cathedral:GetBoundingBox()
		return cf.Position, size
	elseif cathedral:IsA("BasePart") then
		return cathedral.Position, cathedral.Size
	end
	return Vector3.new(0, 10, 0), Vector3.new(30, 20, 30)
end

local function startAnimation(config, state)
	if state.animationConnection then state.animationConnection:Disconnect() end
	local colorPeriod = config.COLOR_CYCLE_SPEED * #config.RAVE_COLORS
	local function cycleColor(timeOffset)
		local t = (state.elapsed + timeOffset * config.COLOR_CYCLE_SPEED) % colorPeriod
		local idx = math.floor(t / config.COLOR_CYCLE_SPEED) % #config.RAVE_COLORS + 1
		local nextIdx = idx % #config.RAVE_COLORS + 1
		local frac = (t % config.COLOR_CYCLE_SPEED) / config.COLOR_CYCLE_SPEED
		return config.RAVE_COLORS[idx]:Lerp(config.RAVE_COLORS[nextIdx], frac)
	end
	
	state.animationConnection = RunService.Heartbeat:Connect(function(dt)
		state.elapsed = state.elapsed + dt
		for _, d in ipairs(state.lights) do
			d.light.Color = cycleColor(d.offset)
			d.light.Brightness = config.LIGHT_BRIGHTNESS + math.sin(state.elapsed * 3.5 + d.offset) * 2
		end
		for _, d in ipairs(state.lasers) do
			local sweepAngle = d.startAngle + state.elapsed * config.LASER_SWEEP_SPEED
			local baseCF = CFrame.new(d.pivot.Position) * CFrame.Angles(0, sweepAngle, 0) * CFrame.Angles(d.tilt, 0, 0)
			d.pivot.CFrame = baseCF
			d.beam.CFrame = baseCF * CFrame.new(0, 0, -d.beamLength / 2)
			local color = cycleColor(d.colorOffset)
			d.beam.Color = color
			d.spot.Color = color
		end

		if (state.elapsed - state.lastPulse) > 10 then
			state.lastPulse = state.elapsed
			Telemetry.dispatchPulse({ event = "Rave_Active", elapsed = state.elapsed, lasers = #state.lasers, stability = 1.0 })
		end
	end)
end

function CathedralRaveService:Start()
	local config, state = self.Config, self.State
	if not config.Enabled then return end
    
    if state.animationConnection then state.animationConnection:Disconnect() end
	if state.effectFolder then state.effectFolder:Destroy() end
	
	state.cathedral = findCathedralGoverned(config.CATHEDRAL_NAME)
	if not state.cathedral then
		Governance.RegisterIssue("GEOMETRY_MISSING", "Cathedral '" .. config.CATHEDRAL_NAME .. "' missing", "MEDIUM")
		return
	end
	
	local center, size = getCathedralBounds(state.cathedral)
	state.effectFolder = Instance.new("Folder")
	state.effectFolder.Name = "CathedralRaveEffects"
	state.effectFolder.Parent = Workspace
	
	-- Populate Lights
	for i = 1, config.LIGHT_COUNT do
		local angle = (i / config.LIGHT_COUNT) * math.pi * 2
		local radius = math.min(size.X/2, size.Z/2) * 0.65
		local anchor = Instance.new("Part")
		anchor.Name = "RaveLight_" .. i
		anchor.Size = Vector3.new(0.4, 0.4, 0.4)
		anchor.Anchored, anchor.CanCollide, anchor.Transparency = true, false, 1
		anchor.Position = center + Vector3.new(math.cos(angle) * radius, (size.Y/2) * 0.55, math.sin(angle) * radius)
		anchor.Parent = state.effectFolder
		local pl = Instance.new("PointLight")
		pl.Brightness, pl.Range = config.LIGHT_BRIGHTNESS, config.LIGHT_RANGE
		pl.Shadows = true -- High-end luxury depth, stops flat washout
		pl.Color, pl.Parent = config.RAVE_COLORS[((i - 1) % #config.RAVE_COLORS) + 1], anchor
		table.insert(state.lights, { light = pl, offset = i })
	end

	-- Populate Lasers
	for i = 1, config.LASER_COUNT do
		local startAngle = (i / config.LASER_COUNT) * math.pi * 2
		local radius = math.min(size.X/2, size.Z/2) * 0.3
		local pivot = Instance.new("Part")
		pivot.Size, pivot.Anchored, pivot.CanCollide, pivot.Transparency = Vector3.new(0.3, 0.3, 0.3), true, false, 1
		pivot.Position = center + Vector3.new(math.cos(startAngle) * radius, (size.Y/2) * 0.75, math.sin(startAngle) * radius)
		pivot.Parent = state.effectFolder
		local beamLength = (size.Y/2) * 2 * 1.3
		local beam = Instance.new("Part")
		beam.Size, beam.Anchored, beam.CanCollide = Vector3.new(0.02, 0.02, beamLength), true, false -- Razor thin
		beam.Material, beam.Transparency = Enum.Material.Neon, 0.15
		beam.Color, beam.Parent = config.RAVE_COLORS[((i - 1) % #config.RAVE_COLORS) + 1], state.effectFolder
		local spot = Instance.new("SpotLight")
		spot.Brightness, spot.Range, spot.Angle, spot.Face = 16, beamLength, 2.5, Enum.NormalId.Front -- Ultra-bright but paper-thin spread
		spot.Color, spot.Parent = beam.Color, pivot
		table.insert(state.lasers, { pivot = pivot, beam = beam, spot = spot, startAngle = startAngle, tilt = math.rad(config.TILT_ANGLES[((i - 1) % #config.TILT_ANGLES) + 1]), colorOffset = i + config.LIGHT_COUNT, beamLength = beamLength })
	end
	
	startAnimation(config, state)
	Telemetry.dispatchPulse({ event = "Rave_Ignition", cathedral = state.cathedral.Name })
end

function CathedralRaveService:Init()
	print("🏮 [CATHEDRAL-RAVE] Sovereign Inversion Complete. Superbullet dependency purged.")
	task.defer(function() self:Start() end)
end

return CathedralRaveService
