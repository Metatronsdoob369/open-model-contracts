--[=[
    VictimService.luau
    Status: ARCHITECT MANIFEST | Swarm V2
    Role: Manifest 10 Victims with Evasion AI and Xenon Highlighting
]=]

local RunService = game:GetService("RunService")
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

local VictimService = {
	Name = "VictimService",
	Config = {
		COUNT = 10,
		SPAWN_Y = 2, -- Moving closer to Y=0
		COLOR = Color3.fromRGB(0, 150, 255), -- Xenon Blue
		EVASION_SPEED = 18,
		EVASION_DIST = 40,
	},
	State = { victims = {}, active = true },
}

function VictimService:CreateVictim(i)
	local m = Instance.new("Model")
	m.Name = "Sovereign_Victim_" .. i
	
	local p = Instance.new("Part")
	p.Name = "HumanoidRootPart"
	p.Size = Vector3.new(4, 6, 4)
	p.Color = self.Config.COLOR
	p.Material = Enum.Material.SmoothPlastic
	p.Anchored = false -- PHYSICALLY ACTIVE
	p.CFrame = CFrame.new(math.random(-40, 40), 10, math.random(-40, 40)) -- Clamped tightly over the arena center so they don't fall off
	p.Parent = m
	
	local hum = Instance.new("Humanoid")
	hum.WalkSpeed = self.Config.EVASION_SPEED
	hum.Parent = m
	
	-- [[ BMW XENON HIGHLIGHTING ]]
	local highlight = Instance.new("SelectionBox")
	highlight.Name = "Xenon_Edge"
	highlight.Adornee = p
	highlight.Color3 = Color3.fromRGB(255, 255, 255)
	highlight.LineThickness = 0.05
	highlight.Transparency = 0.2
	highlight.Parent = p
	
	m.Parent = Workspace:FindFirstChild("Sovereign_Victims") or (function()
		local f = Instance.new("Folder")
		f.Name = "Sovereign_Victims"
		f.Parent = Workspace
		return f
	end)()
	
	return m
end

function VictimService:_evasionLoop()
	task.spawn(function()
		while self.State.active do
			for _, victim in ipairs(self.State.victims) do
				local hrp = victim:FindFirstChild("HumanoidRootPart")
				local hum = victim:FindFirstChild("Humanoid")
				if not hrp or not hum then continue end
				
				-- VOID FALL CATCHER
				if hrp.Position.Y < -20 then
					hrp.CFrame = CFrame.new(math.random(-30, 30), 15, math.random(-30, 30))
					hum:MoveTo(hrp.Position)
				end
				
				-- Find Nearest Infector (Player)
				for _, player in ipairs(Players:GetPlayers()) do
					local char = player.Character
					if char and char:FindFirstChild("HumanoidRootPart") then
						local dist = (hrp.Position - char.HumanoidRootPart.Position).Magnitude
						
						-- TAG LOGIC
						if dist < 8 and not victim:GetAttribute("Tagged") then
							victim:SetAttribute("Tagged", true)
							hrp.Color = Color3.fromRGB(50, 255, 50) -- Toxic Green
							hum.WalkSpeed = 0
							
							-- Optional UI flare above bot
							local bg = Instance.new("BillboardGui", hrp)
							bg.Size, bg.AlwaysOnTop = UDim2.new(4,0,2,0), true
							local txt = Instance.new("TextLabel", bg)
							txt.Size, txt.BackgroundTransparency, txt.TextScaled = UDim2.new(1,0,1,0), 1, true
							txt.TextColor3 = Color3.fromRGB(50, 255, 50)
							txt.Text = "INFECTED"
							
							task.delay(10, function()
								victim:Destroy() -- Clean up dead bot
							end)
							
						elseif dist < self.Config.EVASION_DIST and not victim:GetAttribute("Tagged") then
							-- RUN AWAY Logic
							local dir = (hrp.Position - char.HumanoidRootPart.Position).Unit
							hum:MoveTo(hrp.Position + dir * 25) -- Faster frantic running
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
