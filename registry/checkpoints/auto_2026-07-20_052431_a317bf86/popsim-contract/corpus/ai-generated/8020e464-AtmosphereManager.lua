local AtmosphereManager = {}
AtmosphereManager.__index = AtmosphereManager

local Lighting = game:GetService("Lighting")
local TweenService = game:GetService("TweenService")

local State = {
	CurrentMode = "GothicNormal",
	PreviousMode = nil,
	IsTransitioning = false,
	ActiveInstances = {}
}

local AtmospherePresets = {
	GothicNormal = {
		Atmosphere = { Density = 0.35, Offset = 0.25, Color = Color3.fromRGB(45, 25, 60), Decay = Color3.fromRGB(20, 10, 30), Glare = 0.15, Haze = 0.6 },
		ColorCorrection = { Brightness = 0.02, Contrast = 0.15, Saturation = -0.1, TintColor = Color3.fromRGB(180, 160, 200) },
		Bloom = { Intensity = 0.4, Size = 24, Threshold = 0.95 },
		Lighting = { Brightness = 0.6, OutdoorAmbient = Color3.fromRGB(30, 20, 45), FogEnd = 650, FogColor = Color3.fromRGB(25, 15, 35) }
	},
	ChaosRound = {
		Atmosphere = { Density = 0.55, Offset = 0.4, Color = Color3.fromRGB(80, 15, 20), Decay = Color3.fromRGB(60, 5, 10), Glare = 0.45, Haze = 1.1 },
		ColorCorrection = { Brightness = -0.05, Contrast = 0.35, Saturation = 0.05, TintColor = Color3.fromRGB(255, 120, 90) },
		Bloom = { Intensity = 0.85, Size = 42, Threshold = 0.75 },
		Lighting = { Brightness = 0.35, OutdoorAmbient = Color3.fromRGB(70, 15, 20), FogEnd = 280, FogColor = Color3.fromRGB(55, 10, 15) }
	},
	DashAbility = {
		Atmosphere = { Density = 0.28, Offset = 0.18, Color = Color3.fromRGB(35, 55, 85), Decay = Color3.fromRGB(15, 25, 50), Glare = 0.65, Haze = 0.35 },
		ColorCorrection = { Brightness = 0.08, Contrast = 0.25, Saturation = 0.1, TintColor = Color3.fromRGB(140, 190, 255) },
		Bloom = { Intensity = 0.7, Size = 18, Threshold = 0.88 },
		Lighting = { Brightness = 0.75, OutdoorAmbient = Color3.fromRGB(40, 55, 80), FogEnd = 920, FogColor = Color3.fromRGB(20, 35, 60) }
	}
}

local function ApplyPreset(presetName)
	local preset = AtmospherePresets[presetName]
	if not preset then return end

	for instanceName, props in pairs(preset) do
		local instance = State.ActiveInstances[instanceName]
		if not instance then
			if instanceName == "Atmosphere" then
				instance = Instance.new("Atmosphere")
				instance.Parent = Lighting
			elseif instanceName == "ColorCorrection" then
				instance = Instance.new("ColorCorrectionEffect")
				instance.Parent = Lighting
			elseif instanceName == "Bloom" then
				instance = Instance.new("BloomEffect")
				instance.Parent = Lighting
			end
			State.ActiveInstances[instanceName] = instance
		end

		for prop, value in pairs(props) do
			instance[prop] = value
		end
	end

	local lightProps = preset.Lighting
	if lightProps then
		for prop, value in pairs(lightProps) do
			Lighting[prop] = value
		end
	end
end

local function TweenToPreset(presetName, duration)
	State.IsTransitioning = true
	local preset = AtmospherePresets[presetName]
	if not preset then
		State.IsTransitioning = false
		return
	end

	local tweenInfo = TweenInfo.new(duration or 1.2, Enum.EasingStyle.Sine, Enum.EasingDirection.Out)

	for instanceName, props in pairs(preset) do
		local instance = State.ActiveInstances[instanceName]
		if instance then
			local tweenProps = {}
			for prop, value in pairs(props) do
				tweenProps[prop] = value
			end
			TweenService:Create(instance, tweenInfo, tweenProps):Play()
		end
	end

	local lightTween = TweenService:Create(Lighting, tweenInfo, preset.Lighting or {})
	lightTween:Play()
	lightTween.Completed:Wait()
	State.IsTransitioning = false
end

function AtmosphereManager:Init()
	State.CurrentMode = "GothicNormal"
	ApplyPreset("GothicNormal")
end

function AtmosphereManager:SetMode(modeName, instant)
	if State.IsTransitioning or modeName == State.CurrentMode then return end

	State.PreviousMode = State.CurrentMode
	State.CurrentMode = modeName

	if instant then
		ApplyPreset(modeName)
	else
		TweenToPreset(modeName)
	end
end

function AtmosphereManager:TriggerChaosRound(duration)
	self:SetMode("ChaosRound")
	task.delay(duration or 45, function()
		if State.CurrentMode == "ChaosRound" then
			self:SetMode(State.PreviousMode or "GothicNormal")
		end
	end)
end

function AtmosphereManager:ApplyDashEffect()
	local previous = State.CurrentMode
	self:SetMode("DashAbility", true)
	task.delay(0.8, function()
		if State.CurrentMode == "DashAbility" then
			self:SetMode(previous, true)
		end
	end)
end

function AtmosphereManager:GetCurrentMode()
	return State.CurrentMode
end

function AtmosphereManager:Cleanup()
	for _, instance in pairs(State.ActiveInstances) do
		if instance then instance:Destroy() end
	end
	State.ActiveInstances = {}
	State.CurrentMode = "GothicNormal"
end

AtmosphereManager:Init()
return AtmosphereManager