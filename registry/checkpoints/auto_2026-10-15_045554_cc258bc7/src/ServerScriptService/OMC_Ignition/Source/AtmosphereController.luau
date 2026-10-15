--[=[
    ViralVestryAtmosphere.luau
    Status: ARCHITECT SELECT | Diamond-Stable
    Role: Aesthetic Manifestation
]=]

local Lighting = game:GetService("Lighting")

local AtmosphereController = {}

function AtmosphereController:Manifest()
	print("🏮 [ATMOSPHERE] Manifesting Viral Vestry Aesthetic...")
	
	-- 1. Global Lighting Shift (Midnight Luxury Aesthetic)
	Lighting.Brightness = 2.2
	Lighting.Ambient = Color3.fromRGB(110, 115, 130) -- Lifted for crisp character visibility
	Lighting.OutdoorAmbient = Color3.fromRGB(85, 90, 110) -- Midnight shadows shouldn't be pitch black
	Lighting.ClockTime = 0 -- Midnight (Moon overhead)
	Lighting.EnvironmentDiffuseScale = 0.6 -- Lowered to stop ambient "ballooning" off characters
	Lighting.EnvironmentSpecularScale = 1.0
	
	-- 2. Toxic Miasma
	local atmo = Lighting:FindFirstChild("Sovereign_Atmo") or Instance.new("Atmosphere")
	atmo.Name = "Sovereign_Atmo"
	atmo.Color = Color3.fromRGB(50, 255, 50)
	atmo.Decay = Color3.fromRGB(0, 50, 0)
	atmo.Density = 0.25 -- Thinned for visibility
	atmo.Glare = 0.1
	atmo.Parent = Lighting
	
	-- 3. Luxury Crisp Bloom (Prevents ballooning blowout)
	local bloom = Lighting:FindFirstChild("Sovereign_Bloom") or Instance.new("BloomEffect")
	bloom.Name = "Sovereign_Bloom"
	bloom.Intensity = 0.08       -- Thin, non-saturating
	bloom.Threshold = 2.5        -- ONLY triggers on ultra-bright luxury sources
	bloom.Size = 14              -- Tight radius glow
	bloom.Parent = Lighting
	
	self:_ManifestAurora()
end

function AtmosphereController:_ManifestAurora()
	-- Prevent double-spawning
	if game:GetService("Workspace"):FindFirstChild("Sovereign_AuroraBorealis") then
		return
	end

	print("🌌 [ATMOSPHERE] Igniting Aurora Borealis...")
	
	-- 1. Construct the Sky Anchor
	local skyPlate = Instance.new("Part")
	skyPlate.Name = "Sovereign_AuroraBorealis"
	skyPlate.Size = Vector3.new(2048, 5, 2048)
	skyPlate.Position = Vector3.new(0, 400, 0) -- Dropped beneath the heavy atmospheric fog limits
	skyPlate.Anchored = true
	skyPlate.CanCollide = false
	skyPlate.Transparency = 1
	skyPlate.Parent = game:GetService("Workspace")

	-- 2. Manifest Aurora Ribbons
	local particle = Instance.new("ParticleEmitter")
	particle.Name = "AuroraRibbons"
	particle.Texture = "rbxassetid://1321727339" -- Soft cloud/flare texture to override default sparkles
	particle.EmissionDirection = Enum.NormalId.Bottom -- Emits DOWN towards the players
	
	-- Massive, sweeping size
	particle.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 200),
		NumberSequenceKeypoint.new(0.5, 600),
		NumberSequenceKeypoint.new(1, 200)
	})
	
	-- Luxury Color Banding: Green -> Teal -> Purple
	particle.Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, Color3.fromRGB(0, 255, 120)),   
		ColorSequenceKeypoint.new(0.5, Color3.fromRGB(0, 200, 255)), 
		ColorSequenceKeypoint.new(1, Color3.fromRGB(150, 0, 255))    
	})
	
	-- Feathered edges for realism
	particle.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(0.5, 0.75), 
		NumberSequenceKeypoint.new(1, 1)
	})
	
	particle.Lifetime = NumberRange.new(25, 40) -- Stays in the sky a long time
	particle.Rate = 6                           -- Slow ribbon generation
	particle.Speed = NumberRange.new(5, 15)     -- Slow drifting
	particle.VelocitySpread = 60
	particle.LightEmission = 0.8                -- Critical: This makes it glow luxuriously in the sky
	particle.Parent = skyPlate
end

return AtmosphereController
