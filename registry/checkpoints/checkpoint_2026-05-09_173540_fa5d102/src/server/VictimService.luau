local RunService = game:GetService("RunService")
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ServerStorage = game:GetService("ServerStorage")

local VictimService = {
	Name = "VictimService",
	Config = {
		COUNT = 10,
		EVASION_SPEED = 18,
		EVASION_DIST = 40,
	},
	State = { victims = {}, active = true },
}

local function freezeMonster(victim)
	local hum = victim:FindFirstChildOfClass("Humanoid")
	if hum then
		hum.WalkSpeed = 0
		hum.JumpPower = 0
	end
	for _, part in ipairs(victim:GetDescendants()) do
		if part:IsA("BasePart") then
			part.Anchored = true
			part.CanCollide = false
		end
	end
end

function VictimService:CreateVictim(i)
	local template = ServerStorage:FindFirstChild("MonsterTemplate")

	local m
	if template then
		m = template:Clone()
		m.Name = "Sovereign_Victim_" .. i
	else
		warn("[VICTIMS] MonsterTemplate not found in ServerStorage — using fallback rectangle")
		m = Instance.new("Model")
		m.Name = "Sovereign_Victim_" .. i
		local p = Instance.new("Part")
		p.Name = "HumanoidRootPart"
		p.Size = Vector3.new(4, 6, 4)
		p.Color = Color3.fromRGB(0, 150, 255)
		p.Material = Enum.Material.SmoothPlastic
		p.Anchored = false
		p.Parent = m
		local hum = Instance.new("Humanoid")
		hum.WalkSpeed = self.Config.EVASION_SPEED
		hum.Parent = m
		m.PrimaryPart = p
	end

	if m.PrimaryPart then
		m:SetPrimaryPartCFrame(CFrame.new(math.random(-40, 40), 10, math.random(-40, 40)))
	end

	local hum = m:FindFirstChildOfClass("Humanoid")
	if hum then
		hum.WalkSpeed = self.Config.EVASION_SPEED
	end

	local victimsFolder = Workspace:FindFirstChild("Sovereign_Victims") or (function()
		local f = Instance.new("Folder")
		f.Name = "Sovereign_Victims"
		f.Parent = Workspace
		return f
	end)()
	m.Parent = victimsFolder

	return m
end

function VictimService:_evasionLoop()
	task.spawn(function()
		while self.State.active do
			for _, victim in ipairs(self.State.victims) do
				if victim:GetAttribute("Tagged") then continue end

				local hrp = victim:FindFirstChild("HumanoidRootPart")
				local hum = victim:FindFirstChildOfClass("Humanoid")
				if not hrp or not hum then continue end

				if hrp.Position.Y < -20 then
					hrp.CFrame = CFrame.new(math.random(-30, 30), 15, math.random(-30, 30))
					hum:MoveTo(hrp.Position)
				end

				for _, player in ipairs(Players:GetPlayers()) do
					local char = player.Character
					if char and char:FindFirstChild("HumanoidRootPart") then
						local dist = (hrp.Position - char.HumanoidRootPart.Position).Magnitude

						if dist < 8 then
							victim:SetAttribute("Tagged", true)
							
							-- [[ SURGICAL CLEANUP ]]
							-- Make invisible and non-collidable immediately to prevent "bleed"
							for _, p in ipairs(victim:GetDescendants()) do
								if p:IsA("BasePart") then
									p.Transparency = 1
									p.CanCollide = false
									p.CanTouch = false
									p.CanQuery = false
								elseif p:IsA("Highlight") or p:IsA("BillboardGui") then
									p:Destroy()
								end
							end

							-- Move to "Shatter Vault" far away
							if hrp then
								hrp.CFrame = CFrame.new(0, -500, 0)
							end

							task.delay(0.1, function()
								victim:Destroy()
							end)

						elseif dist < self.Config.EVASION_DIST then
							local dir = (hrp.Position - char.HumanoidRootPart.Position).Unit
							hum:MoveTo(hrp.Position + dir * 25)
						end
					end
				end
			end
			task.wait(0.2)
		end
	end)
end

function VictimService:Start()
	print("🏮 [VICTIMS] Manifesting Swarm V2...")
	for i = 1, self.Config.COUNT do
		table.insert(self.State.victims, self:CreateVictim(i))
	end
	self:_evasionLoop()
end

function VictimService:Init()
	print("🏮 [VICTIMS] Swarm AI Anchored.")
end

return VictimService
