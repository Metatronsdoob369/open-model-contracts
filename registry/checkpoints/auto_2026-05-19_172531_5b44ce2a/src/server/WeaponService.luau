-- WeaponService.luau
-- [[ THE ARSENAL ORCHESTRATOR ]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local WeaponData = require(script.Parent.Parent.shared.WeaponData)

local WeaponService = {
	Name = "WeaponService",
}

-- [[ PRIVATE HELPERS ]]

local function mkProjectile(weaponName, startCF, direction)
	local data = WeaponData[weaponName]
	if not data then return end
	
	local p = Instance.new("Part")
	p.Name = weaponName
	p.Size = weaponName == "PaperAirplane" and Vector3.new(2, 0.2, 2) or Vector3.new(0.5, 0.5, 0.5)
	p.CFrame = startCF
	p.Color = data.Color
	p.Material = Enum.Material.SmoothPlastic
	p.CanCollide = false
	p.Parent = workspace
	
	-- Add physics
	local bf = Instance.new("BodyForce")
	-- Counteract gravity for the airplane to make it "glide"
	local gravityForce = p:GetMass() * workspace.Gravity
	bf.Force = Vector3.new(0, gravityForce * (1 - data.Gravity), 0)
	bf.Parent = p
	
	p.Velocity = direction * data.Speed
	
	-- Add a trail for that "Resonance" look
	local attachment0 = Instance.new("Attachment", p)
	attachment0.Position = Vector3.new(0, 0, 0.5)
	local attachment1 = Instance.new("Attachment", p)
	attachment1.Position = Vector3.new(0, 0, -0.5)
	
	local trail = Instance.new("Trail")
	trail.Attachment0 = attachment0
	trail.Attachment1 = attachment1
	trail.Color = ColorSequence.new(data.TrailColor)
	trail.Lifetime = 0.5
	trail.WidthScale = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(1, 0)
	})
	trail.Parent = p
	
	-- Hit Detection (Simplified for now)
	task.spawn(function()
		local connection
		connection = p.Touched:Connect(function(hit)
			if hit.Parent:FindFirstChild("Humanoid") then
				print("🎯 [WEAPON] " .. weaponName .. " hit " .. hit.Parent.Name)
				p:Destroy()
				connection:Disconnect()
			end
		end)
		
		task.wait(5) -- Auto-cleanup after 5 seconds
		if p.Parent then p:Destroy() end
		if connection then connection:Disconnect() end
	end)
	
	return p
end

-- [[ PUBLIC API ]]

function WeaponService:Fire(player, weaponName, targetPos)
	local character = player.Character
	if not character or not character:FindFirstChild("Head") then return end
	
	local startPos = character.Head.Position + (targetPos - character.Head.Position).Unit * 5
	local direction = (targetPos - character.Head.Position).Unit
	
	print("🚀 [WEAPON] " .. player.Name .. " fired a " .. weaponName)
	mkProjectile(weaponName, CFrame.new(startPos, targetPos), direction)
end

function WeaponService:Init()
	-- Create RemoteEvent if it doesn't exist
	if not ReplicatedStorage:FindFirstChild("WeaponFire") then
		local rf = Instance.new("RemoteEvent")
		rf.Name = "WeaponFire"
		rf.Parent = ReplicatedStorage
	end
	
	ReplicatedStorage.WeaponFire.OnServerEvent:Connect(function(player, weaponName, targetPos)
		self:Fire(player, weaponName, targetPos)
	end)
end

function WeaponService:Start()
	print("⚔️ [WEAPON] Arsenal active and ready for flight.")
end

return WeaponService
