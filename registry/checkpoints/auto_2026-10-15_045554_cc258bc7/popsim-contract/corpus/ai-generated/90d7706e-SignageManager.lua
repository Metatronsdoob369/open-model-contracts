-- SignageManager.lua
-- Manages all signage systems in the Gothic Metropolis Tag game
-- Handles dynamic signs, chaos round indicators, leaderboards, and environmental signage

local SignageManager = {}
SignageManager.__index = SignageManager

-- Services
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Constants
local SIGN_UPDATE_INTERVAL = 0.5
local CHAOS_FLICKER_SPEED = 0.1
local NORMAL_FLICKER_SPEED = 2.0
local MAX_LEADERBOARD_ENTRIES = 10
local SIGN_TAG = "GothicSign"
local CHAOS_SIGN_TAG = "ChaosSign"
local BILLBOARD_TAG = "GothicBillboard"
local NEON_TAG = "NeonSign"

-- Sign Types
local SignType = {
	STATIC = "Static",
	ANIMATED = "Animated",
	LEADERBOARD = "Leaderboard",
	CHAOS_INDICATOR = "ChaosIndicator",
	PLAYER_STATUS = "PlayerStatus",
	DIRECTIONAL = "Directional",
	TIMER = "Timer",
	NEON = "Neon",
}

-- Sign States
local SignState = {
	NORMAL = "Normal",
	CHAOS = "Chaos",
	FLICKERING = "Flickering",
	DISABLED = "Disabled",
	ALERT = "Alert",
}

-- Gothic color palette
local GothicColors = {
	PRIMARY = Color3.fromRGB(180, 0, 0),       -- Deep Crimson
	SECONDARY = Color3.fromRGB(80, 0, 120),    -- Dark Purple
	ACCENT = Color3.fromRGB(255, 140, 0),      -- Amber
	NEON_BLUE = Color3.fromRGB(0, 200, 255),   -- Cyan Blue
	NEON_GREEN = Color3.fromRGB(0, 255, 100),  -- Toxic Green
	NEON_PURPLE = Color3.fromRGB(180, 0, 255), -- Vivid Purple
	CHAOS_RED = Color3.fromRGB(255, 30, 30),   -- Bright Chaos Red
	DARK_BG = Color3.fromRGB(10, 5, 15),       -- Near Black Background
	GOLD = Color3.fromRGB(255, 215, 0),        -- Gold for leaderboard
	WHITE = Color3.fromRGB(240, 240, 240),     -- Off White
	FLICKER_OFF = Color3.fromRGB(20, 10, 30),  -- Dim state for flicker
}

-- Sign Templates
local SignTemplates = {
	LEADERBOARD_HEADER = "--- TOP DASHERS ---",
	CHAOS_WARNING = "!!! CHAOS ROUND !!!",
	CHAOS_SUBTEXT = "ALL BETS ARE OFF",
	TAG_STATUS_IT = "YOU ARE IT",
	TAG_STATUS_FREE = "STAY FREE",
	SAFE_ZONE = "SANCTUARY",
	DASH_ZONE = "DASH ZONE",
	RESPAWN_POINT = "RESPAWN",
	CITY_NAME = "GOTHICA PRIME",
	SUBTITLE = "Est. Age of Shadows",
}

-- Constructor
function SignageManager.new()
	local self = setmetatable({}, SignageManager)

	-- State tracking
	self._signs = {}              -- All registered sign objects
	self._leaderboardSigns = {}   -- Leaderboard specific signs
	self._chaosIndicators = {}    -- Chaos round indicators
	self._timerSigns = {}         -- Timer display signs
	self._neonSigns = {}          -- Neon animated signs
	self._playerStatusSigns = {}  -- Per-player status signs

	-- Game state
	self._isChaosRound = false
	self._currentItPlayer = nil
	self._roundTimer = 0
	self._leaderboardData = {}
	self._chaosIntensity = 0.0

	-- Internal tracking
	self._connections = {}
	self._updateCounter = 0
	self._flickerConnections = {}
	self._tweenCache = {}
	self._initialized = false

	return self
end

-- Initialize the SignageManager and scan workspace for signs
function SignageManager:Initialize()
	if self._initialized then
		warn("SignageManager: Already initialized.")
		return
	end

	-- Scan workspace for tagged signs
	self:_scanWorkspaceForSigns()

	-- Set up CollectionService listeners for dynamically added signs
	self:_setupCollectionListeners()

	-- Begin update loop
	self:_startUpdateLoop()

	-- Initialize leaderboard data
	self:_initializeLeaderboardData()

	self._initialized = true
	print("SignageManager: Initialized successfully. Found " .. #self._signs .. " signs.")
end

-- Destroy the SignageManager and clean up
function SignageManager:Destroy()
	-- Disconnect all connections
	for _, connection in pairs(self._connections) do
		if connection and connection.Connected then
			connection:Disconnect()
		end
	end

	-- Disconnect flicker connections
	for _, connection in pairs(self._flickerConnections) do
		if connection and connection.Connected then
			connection:Disconnect()
		end
	end

	-- Cancel active tweens
	for _, tween in pairs(self._tweenCache) do
		if tween then
			tween:Cancel()
		end
	end

	-- Clear all state
	self._signs = {}
	self._leaderboardSigns = {}
	self._chaosIndicators = {}
	self._timerSigns = {}
	self._neonSigns = {}
	self._playerStatusSigns = {}
	self._connections = {}
	self._flickerConnections = {}
	self._tweenCache = {}
	self._initialized = false

	print("SignageManager: Destroyed and cleaned up.")
end

-- Register a new sign object manually
function SignageManager:RegisterSign(signObject, signType, customConfig)
	if not signObject then
		warn("SignageManager: Cannot register nil sign object.")
		return nil
	end

	-- Build sign data entry
	local signData = {
		Object = signObject,
		Type = signType or SignType.STATIC,
		State = SignState.NORMAL,
		Config = customConfig or {},
		LastUpdated = 0,
		FlickerActive = false,
		OriginalProperties = {},
	}

	-- Cache original properties for restoration
	signData.OriginalProperties = self:_cacheSignProperties(signObject)

	-- Register by type
	local signId = tostring(signObject) .. "_" .. tick()
	signData.Id = signId
	self._signs[signId] = signData

	-- Add to type-specific lists
	if signType == SignType.LEADERBOARD then
		table.insert(self._leaderboardSigns, signId)
		self:_initializeLeaderboardSign(signObject)
	elseif signType == SignType.CHAOS_INDICATOR then
		table.insert(self._chaosIndicators, signId)
	elseif signType == SignType.TIMER then
		table.insert(self._timerSigns, signId)
	elseif signType == SignType.NEON then
		table.insert(self._neonSigns, signId)
		self:_startNeonAnimation(signId)
	end

	return signId
end

-- Unregister a sign by its ID
function SignageManager:UnregisterSign(signId)
	if not self._signs[signId] then
		warn("SignageManager: Sign ID not found: " .. tostring(signId))
		return
	end

	-- Stop flicker if active
	self:_stopFlicker(signId)

	-- Remove from type lists
	local function removeFromList(list, id)
		for i, v in ipairs(list) do
			if v == id then
				table.remove