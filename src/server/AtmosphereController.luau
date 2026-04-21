--[=[
    AtmosphereController.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    Role: Aesthetic Manifestation — Modern Clean
]=]

local Lighting = game:GetService("Lighting")

local AtmosphereController = {}

function AtmosphereController:Manifest()
	print("🏮 [ATMOSPHERE] Manifesting Sovereign Arena Aesthetic...")

	-- Clean modern arena lighting
	Lighting.Brightness = 1.8
	Lighting.Ambient = Color3.fromRGB(130, 140, 160)
	Lighting.OutdoorAmbient = Color3.fromRGB(100, 110, 130)
	Lighting.ClockTime = 0
	Lighting.EnvironmentDiffuseScale = 0.5
	Lighting.EnvironmentSpecularScale = 0.8

	-- Remove Viral Vestry toxic green atmosphere
	local oldAtmo = Lighting:FindFirstChild("Sovereign_Atmo")
	if oldAtmo then oldAtmo:Destroy() end

	-- Subtle dark-blue atmosphere — deep space arena
	local atmo = Instance.new("Atmosphere")
	atmo.Name = "Sovereign_Atmo"
	atmo.Color = Color3.fromRGB(20, 30, 60)
	atmo.Decay = Color3.fromRGB(5, 10, 25)
	atmo.Density = 0.12
	atmo.Glare = 0.05
	atmo.Haze = 0
	atmo.Parent = Lighting

	-- Crisp bloom — just enough for neon tiles to pop
	local bloom = Lighting:FindFirstChild("Sovereign_Bloom") or Instance.new("BloomEffect")
	bloom.Name = "Sovereign_Bloom"
	bloom.Intensity = 0.06
	bloom.Threshold = 2.8
	bloom.Size = 10
	bloom.Parent = Lighting

	-- Color correction for cinematic punch
	local cc = Lighting:FindFirstChild("Sovereign_CC") or Instance.new("ColorCorrectionEffect")
	cc.Name = "Sovereign_CC"
	cc.Contrast = 0.12
	cc.Saturation = 0.15
	cc.Brightness = -0.02
	cc.TintColor = Color3.fromRGB(220, 225, 255)
	cc.Parent = Lighting
end

return AtmosphereController
