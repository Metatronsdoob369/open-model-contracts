-- Dusk lighting — overrides MetropolisLighting midnight setting
local Lighting = game:GetService("Lighting")

local function setDusk()
	Lighting.ClockTime      = 18.5
	Lighting.Brightness     = 2
	Lighting.Ambient        = Color3.fromRGB(80, 60, 90)
	Lighting.OutdoorAmbient = Color3.fromRGB(140, 100, 70)
	Lighting.FogEnd         = 100000
	Lighting.FogStart       = 90000
	Lighting.FogColor       = Color3.fromRGB(10, 10, 20)  -- match night sky, kills orange band

	-- Tame bloom — neon dance floor was blowing out the scene
	for _, effect in ipairs(Lighting:GetChildren()) do
		if effect:IsA("BloomEffect") then
			effect.Intensity = 0.3
			effect.Size      = 14
			effect.Threshold = 2.5  -- only bloom very bright emissives
		end
	end

	-- Remove midnight skybox
	local sky = Lighting:FindFirstChildOfClass("Sky")
	if sky then sky:Destroy() end
	print("[LIGHTING] Dusk set — bloom tamed")
end

setDusk()
task.delay(2, setDusk)
