--[=[
    SovereignCharacterFactory.luau
    Status: VAULT-READY | 4D-Hardened
    Function: Transforms 'Primer' models into High-Fidelity Sovereign entities.
]=]

local SovereignCharacterFactory = {}

local STYLES = {
	NEON_GLITCH = {
		PrimaryColor = Color3.fromRGB(0, 255, 255),
		Material = Enum.Material.Neon,
		Transparency = 0.2,
	},
	VOID_METAL = {
		PrimaryColor = Color3.fromRGB(50, 50, 50),
		Material = Enum.Material.Metal,
		Reflectance = 0.8,
	}
}

function SovereignCharacterFactory:ApplySovereignStyle(model, styleName)
	local style = STYLES[styleName or "NEON_GLITCH"]
	
	for _, part in ipairs(model:GetDescendants()) do
		if part:IsA("BasePart") then
			part.Anchored = false
			part.CanCollide = true

			local name = part.Name:lower()
			-- 1. Inject Neon into specific areas (Eyes, Joints, or small parts)
			if name:find("head") or name:find("eye") or part.Size.Magnitude < 1.5 then
				part.Material = Enum.Material.Neon
				part.Color = style.PrimaryColor
				
				local light = Instance.new("PointLight")
				light.Color = style.PrimaryColor
				light.Brightness = 3
				light.Range = 10
				light.Parent = part
			end
			
			-- 2. Metal/PBR upgrade for Limbs
			if name:find("arm") or name:find("leg") or name:find("torso") or part.Material == Enum.Material.Plastic then
				part.Material = Enum.Material.Metal
				part.Color = Color3.fromRGB(70, 70, 70)
				part.Reflectance = 0.6
			end
		end
	end

	
	-- 3. Digital Glitch Particles
	local torso = model:FindFirstChild("Torso") or model:FindFirstChild("UpperTorso")
	if torso then
		local attachment = Instance.new("Attachment")
		attachment.Name = "SovereignEffect"
		attachment.Parent = torso
		
		local particles = Instance.new("ParticleEmitter")
		particles.Color = ColorSequence.new(style.PrimaryColor)
		particles.Size = NumberSequence.new({
			NumberSequenceKeypoint.new(0, 0.5),
			NumberSequenceKeypoint.new(1, 0)
		})
		particles.Transparency = NumberSequence.new(0.5)
		particles.Lifetime = NumberRange.new(0.5, 1)
		particles.Rate = 20
		particles.Speed = NumberRange.new(2, 5)
		particles.SpreadAngle = Vector2.new(360, 360)
		particles.Texture = "rbxassetid://5831313756" -- Digital Glitch Texture
		particles.Parent = attachment
	end
	
	return model
end

return SovereignCharacterFactory
