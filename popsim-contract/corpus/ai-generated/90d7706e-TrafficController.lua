-- TrafficController.lua
-- Manages gothic city traffic systems, chaos rounds, and dynamic traffic state
-- for a gothic tag game with dashing abilities

local TrafficController = {}
TrafficController.__index = TrafficController

-- Services
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")

-- Constants
local TRAFFIC_LIGHT_CYCLE = {
	GREEN_DURATION = 8,
	YELLOW_DURATION = 2,
	RED_DURATION = 6,
}

local CHAOS_ROUND_CONFIG = {
	DURATION = 60,
	TRAFFIC_SPEED_MULTIPLIER = 3.0,
	SPAWN_RATE_MULTIPLIER = 2.5,
	LIGHT_FLICKER_INTERVAL = 0.3,
	VEHICLE_CHAOS_CHANCE = 0.75,
}

local NORMAL_ROUND_CONFIG = {
	VEHICLE_SPEED_MIN = 15,
	VEHICLE_SPEED_MAX = 30,
	SPAWN_INTERVAL = 5,
	MAX_VEHICLES = 20,
}

local TRAFFIC_STATES = {
	GREEN = "GREEN",
	YELLOW = "YELLOW",
	RED = "RED",
	CHAOS = "CHAOS",
	OFFLINE = "OFFLINE",
}

local LIGHT_COLORS = {
	GREEN  = Color3.fromRGB(0,   220,  80),
	YELLOW = Color3.fromRGB(255, 200,  0),
	RED    = Color3.fromRGB(220,  30,  30),
	CHAOS  = Color3.fromRGB(180,   0, 255),
	OFFLINE = Color3.fromRGB(30,   30,  30),
}

-- Gothic vehicle model names expected in ReplicatedStorage or Workspace
local VEHICLE_TEMPLATES = {
	"GothicCarriage",
	"SteamCoach",
	"BlackCab",
	"HearseVehicle",
}

-- ─────────────────────────────────────────────
-- Constructor
-- ─────────────────────────────────────────────

--- Creates a new TrafficController instance
-- @param config table  optional override config
-- @return TrafficController
function TrafficController.new(config)
	local self = setmetatable({}, TrafficController)

	-- Merge optional config with defaults
	self._config = {
		normalRound  = config and config.normalRound  or NORMAL_ROUND_CONFIG,
		chaosRound   = config and config.chaosRound   or CHAOS_ROUND_CONFIG,
		lightCycle   = config and config.lightCycle   or TRAFFIC_LIGHT_CYCLE,
	}

	-- State tracking
	self._isChaosRound        = false
	self._chaosTimer          = 0
	self._isRunning           = false
	self._activeVehicles      = {}   -- { [vehicleModel] = vehicleData }
	self._trafficLights       = {}   -- { [lightGroup] = lightData }
	self._spawnPoints         = {}   -- array of SpawnPoint BaseParts
	self._despawnPoints       = {}   -- array of DespawnPoint BaseParts
	self._connections         = {}   -- RBXScriptConnections to clean up
	self._vehicleCount        = 0
	self._totalSpawned        = 0

	-- Per-intersection state
	self._intersections       = {}   -- { [id] = IntersectionState }

	-- Chaos flickering
	self._flickerAccumulator  = 0

	-- Event bindings (BindableEvents for external consumers)
	self._onChaosStarted  = Instance.new("BindableEvent")
	self._onChaosEnded    = Instance.new("BindableEvent")
	self._onVehicleSpawned = Instance.new("BindableEvent")
	self._onVehicleDespawned = Instance.new("BindableEvent")
	self._onLightChanged  = Instance.new("BindableEvent")

	-- Public read-only event references
	self.ChaosStarted    = self._onChaosStarted.Event
	self.ChaosEnded      = self._onChaosEnded.Event
	self.VehicleSpawned  = self._onVehicleSpawned.Event
	self.VehicleDespawned = self._onVehicleDespawned.Event
	self.LightChanged    = self._onLightChanged.Event

	return self
end

-- ─────────────────────────────────────────────
-- Initialisation Helpers
-- ─────────────────────────────────────────────

--- Scans the workspace folder for tagged traffic lights and registers them
-- Expects a Folder named "TrafficLights" containing groups of BaseParts
-- tagged with "TrafficLight" CollectionService tag
function TrafficController:ScanTrafficLights()
	local CollectionService = game:GetService("CollectionService")
	local tagged = CollectionService:GetTagged("TrafficLight")

	for _, lightPart in ipairs(tagged) do
		local groupName = lightPart:GetAttribute("IntersectionGroup") or "DefaultGroup"
		if not self._trafficLights[groupName] then
			self._trafficLights[groupName] = {
				lights      = {},
				state       = TRAFFIC_STATES.RED,
				timer       = 0,
				phase       = 1,   -- 1=green, 2=yellow, 3=red
				isFlickering = false,
			}
		end
		table.insert(self._trafficLights[groupName].lights, lightPart)
		-- Initialise visual
		self:_applyLightColor(lightPart, LIGHT_COLORS.RED)
	end

	print(string.format("[TrafficController] Registered %d traffic light groups.", #(function()
		local t = {} for k in pairs(self._trafficLights) do t[#t+1] = k end return t
	end)()))
end

--- Scans for spawn and despawn waypoints tagged in CollectionService
function TrafficController:ScanSpawnPoints()
	local CollectionService = game:GetService("CollectionService")

	for _, part in ipairs(CollectionService:GetTagged("VehicleSpawn")) do
		table.insert(self._spawnPoints, part)
	end

	for _, part in ipairs(CollectionService:GetTagged("VehicleDespawn")) do
		table.insert(self._despawnPoints, part)
	end

	print(string.format("[TrafficController] Found %d spawn points, %d despawn points.",
		#self._spawnPoints, #self._despawnPoints))
end

--- Registers a named intersection for full red-green-yellow cycle management
-- @param id      string unique intersection identifier
-- @param config  table  { greenDuration, yellowDuration, redDuration, offset }
function TrafficController:RegisterIntersection(id, config)
	assert(type(id) == "string", "Intersection id must be a string")
	config = config or {}

	self._intersections[id] = {
		id             = id,
		state          = TRAFFIC_STATES.RED,
		timer          = config.offset or 0,    -- stagger intersections
		greenDuration  = config.greenDuration  or self._config.lightCycle.GREEN_DURATION,
		yellowDuration = config.yellowDuration or self._config.lightCycle.YELLOW_DURATION,
		redDuration    = config.redDuration    or self._config.lightCycle.RED_DURATION,
		linkedGroups   = config.linkedGroups   or {},  -- TrafficLight group names
		blocked        = false,   -- true when vehicles should not proceed
	}
end

-- ─────────────────────────────────────────────
-- Core Loop
-- ─────────────────────────────────────────────

--- Starts the traffic simulation loop
function TrafficController:Start()
	if self._isRunning then
		warn("[TrafficController] Already running.")
		return
	end
	self._isRunning = true