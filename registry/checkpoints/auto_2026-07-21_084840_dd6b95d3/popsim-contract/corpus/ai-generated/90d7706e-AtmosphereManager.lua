-- AtmosphereManager.lua
-- Manages dynamic atmosphere, lighting, fog, and environmental effects
-- for a gothic city tag game with dashing abilities and chaos rounds

local AtmosphereManager = {}
AtmosphereManager.__index = AtmosphereManager

-- Services
local Lighting = game:GetService("Lighting")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

-- Constants
local TWEEN_INFO_FAST = TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
local TWEEN_INFO_SLOW = TweenInfo.new(6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
local TWEEN_INFO_INSTANT = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)

-- Atmosphere presets for different game states
local ATMOSPHERE_PRESETS = {
	Normal = {
		-- Lighting
		Brightness = 1.5,
		ClockTime = 21,
		FogEnd = 800,
		FogStart = 200,
		FogColor = Color3.fromRGB(20, 10, 30),
		Ambient = Color3.fromRGB(40, 20, 60),
		OutdoorAmbient = Color3.fromRGB(30, 15, 50),
		ShadowColor = Color3.fromRGB(15, 5, 25),
		-- Atmosphere object
		Density = 0.4,
		Offset = 0.2,
		Color = Color3.fromRGB(50, 30, 70),
		Decay = Color3.fromRGB(15, 5, 25),
		Glare = 0.1,
		Haze = 1.5,
		-- Sky color
		SkyColor = Color3.fromRGB(10, 5, 20),
	},
	Chase = {
		Brightness = 2.0,
		ClockTime = 22,
		FogEnd = 500,
		FogStart = 100,
		FogColor = Color3.fromRGB(80, 10, 10),
		Ambient = Color3.fromRGB(80, 15, 15),
		OutdoorAmbient = Color3.fromRGB(60, 10, 10),
		ShadowColor = Color3.fromRGB(30, 5, 5),
		Density = 0.6,
		Offset = 0.3,
		Color = Color3.fromRGB(120, 20, 20),
		Decay = Color3.fromRGB(40, 5, 5),
		Glare = 0.3,
		Haze = 2.5,
		SkyColor = Color3.fromRGB(30, 5, 5),
	},
	Chaos = {
		Brightness = 3.0,
		ClockTime = 23,
		FogEnd = 300,
		FogStart = 50,
		FogColor = Color3.fromRGB(150, 0, 50),
		Ambient = Color3.fromRGB(120, 0, 60),
		OutdoorAmbient = Color3.fromRGB(100, 0, 40),
		ShadowColor = Color3.fromRGB(50, 0, 20),
		Density = 0.8,
		Offset = 0.5,
		Color = Color3.fromRGB(180, 10, 60),
		Decay = Color3.fromRGB(60, 0, 20),
		Glare = 0.6,
		Haze = 4.0,
		SkyColor = Color3.fromRGB(50, 0, 20),
	},
	Dawn = {
		Brightness = 1.0,
		ClockTime = 5,
		FogEnd = 1200,
		FogStart = 400,
		FogColor = Color3.fromRGB(60, 40, 80),
		Ambient = Color3.fromRGB(70, 50, 90),
		OutdoorAmbient = Color3.fromRGB(80, 60, 100),
		ShadowColor = Color3.fromRGB(20, 15, 35),
		Density = 0.3,
		Offset = 0.1,
		Color = Color3.fromRGB(90, 70, 120),
		Decay = Color3.fromRGB(30, 20, 50),
		Glare = 0.05,
		Haze = 1.0,
		SkyColor = Color3.fromRGB(30, 20, 50),
	},
	Midnight = {
		Brightness = 0.8,
		ClockTime = 0,
		FogEnd = 600,
		FogStart = 150,
		FogColor = Color3.fromRGB(5, 5, 20),
		Ambient = Color3.fromRGB(10, 5, 25),
		OutdoorAmbient = Color3.fromRGB(8, 4, 20),
		ShadowColor = Color3.fromRGB(3, 2, 10),
		Density = 0.5,
		Offset = 0.25,
		Color = Color3.fromRGB(15, 10, 35),
		Decay = Color3.fromRGB(5, 3, 15),
		Glare = 0.02,
		Haze = 2.0,
		SkyColor = Color3.fromRGB(5, 3, 15),
	},
}

-- Lightning flash colors for chaos round
local LIGHTNING_COLORS = {
	Color3.fromRGB(255, 200, 255),
	Color3.fromRGB(200, 150, 255),
	Color3.fromRGB(255, 100, 200),
	Color3.fromRGB(150, 100, 255),
}

-- Manager constructor
function AtmosphereManager.new()
	local self = setmetatable({}, AtmosphereManager)

	-- State
	self.CurrentPreset = "Normal"
	self.IsTransitioning = false
	self.IsChaosActive = false
	self.PulseEnabled = false
	self.LightningEnabled = false

	-- Connections
	self._connections = {}
	self._activeTweens = {}

	-- References to Lighting children
	self._atmosphere = nil
	self._bloom = nil
	self._colorCorrection = nil
	self._depthOfField = nil
	self._sunRays = nil

	-- Internal timers
	self._pulseTime = 0
	self._lightningTimer = 0
	self._lightningInterval = 8

	-- Initialize
	self:_setupLightingEffects()
	self:_applyPresetInstant("Normal")

	return self
end

-- Internal: Set up or find existing Lighting effect instances
function AtmosphereManager:_setupLightingEffects()
	-- Atmosphere
	self._atmosphere = Lighting:FindFirstChildOfClass("Atmosphere")
	if not self._atmosphere then
		self._atmosphere = Instance.new("Atmosphere")
		self._atmosphere.Parent = Lighting
	end

	-- Bloom post effect
	self._bloom = Lighting:FindFirstChildOfClass("BloomEffect")
	if not self._bloom then
		self._bloom = Instance.new("BloomEffect")
		self._bloom.Intensity = 0.8
		self._bloom.Size = 24
		self._bloom.Threshold = 0.95
		self._bloom.Parent = Lighting
	end

	-- Color correction
	self._colorCorrection = Lighting:FindFirstChildOfClass("ColorCorrectionEffect")
	if not self._colorCorrection then
		self._colorCorrection = Instance.new("ColorCorrectionEffect")
		self._colorCorrection.Brightness = 0
		self._colorCorrection.Contrast = 0.15
		self._colorCorrection.Saturation = -0.2