local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ServerStorage = game:GetService("ServerStorage")

local VictimService = {
	Name = "VictimService",
	Config = {
		COUNT = 10,
		CHASE_SPEED = 18,
		RETARGET_RATE = 0.2,
		SPAWN_RADIUS = 70,
		PREDICTION_TIME = 0.04,
		LUNGE_DISTANCE = 7,
		TEMPLATE_FOLDER = "MonsterTemplates",
		WORKSPACE_TEMPLATE_FOLDER = "models",
		DEFAULT_TEMPLATE = "MonsterTemplate",
	},
	State = {
		active = false,
		monsters = {},
		folder = nil,
		chaseThread = nil,
	},
}

local function getMonsterRoot(monster)
	if not monster then return nil end
	if monster:IsA("Model") then
		return monster:FindFirstChild("HumanoidRootPart") or monster.PrimaryPart
	end
	return nil
end

local function stripEmbeddedMonsterScripts(monster)
	if not monster or not monster:IsA("Model") then
		return
	end
	for _, d in ipairs(monster:GetDescendants()) do
		if d:IsA("Script") or d:IsA("LocalScript") then
			d:Destroy()
		end
	end
end

local function ensureMonsterRootAndHumanoid(monster)
	if not monster or not monster:IsA("Model") then
		return nil, nil
	end

	local hum = monster:FindFirstChildOfClass("Humanoid")
	if not hum then
		hum = Instance.new("Humanoid")
		hum.Parent = monster
	end

	local root = getMonsterRoot(monster)
	if not root then
		local candidate = monster:FindFirstChildWhichIsA("BasePart", true)
		if candidate then
			monster.PrimaryPart = candidate
			root = candidate
		else
			root = Instance.new("Part")
			root.Name = "HumanoidRootPart"
			root.Size = Vector3.new(4, 6, 4)
			root.Material = Enum.Material.SmoothPlastic
			root.Color = Color3.fromRGB(180, 40, 40)
			root.Parent = monster
			monster.PrimaryPart = root
		end
	end

	return root, hum
end

local function ensureVictimFolder(self)
	if self.State.folder and self.State.folder.Parent then
		return self.State.folder
	end
	local folder = Workspace:FindFirstChild("Sovereign_Victims")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "Sovereign_Victims"
		folder.Parent = Workspace
	end
	self.State.folder = folder
	return folder
end

local function getMonsterTemplatePool(self)
	local templates = {}
	local workspaceFolder = Workspace:FindFirstChild(self.Config.WORKSPACE_TEMPLATE_FOLDER)
		or Workspace:FindFirstChild("Models")
	if workspaceFolder and (workspaceFolder:IsA("Folder") or workspaceFolder:IsA("Model")) then
		for _, child in ipairs(workspaceFolder:GetChildren()) do
			if child:IsA("Model") then
				local hasHumanoid = child:FindFirstChildOfClass("Humanoid") ~= nil
				local hasRoot = child:FindFirstChild("HumanoidRootPart", true) ~= nil
				local hasParts = child:FindFirstChildWhichIsA("BasePart", true) ~= nil
				if hasParts and (hasHumanoid or hasRoot) then
					table.insert(templates, child)
				end
			end
		end
	end

	if #templates == 0 then
		local folder = ServerStorage:FindFirstChild(self.Config.TEMPLATE_FOLDER)
		if folder and folder:IsA("Folder") then
			for _, child in ipairs(folder:GetChildren()) do
				if child:IsA("Model") then
					table.insert(templates, child)
				end
			end
		end
	end

	if #templates == 0 then
		local singleTemplate = ServerStorage:FindFirstChild(self.Config.DEFAULT_TEMPLATE)
		if singleTemplate and singleTemplate:IsA("Model") then
			table.insert(templates, singleTemplate)
		end
	end

	return templates
end

local function pickTemplate(self)
	local pool = getMonsterTemplatePool(self)
	if #pool == 0 then
		return nil
	end
	return pool[math.random(1, #pool)]
end

local function getAlivePlayers()
	local alive = {}
	local anyMarkedAlive = false

	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("OMC_RoundAlive") then
			anyMarkedAlive = true
			break
		end
	end

	for _, player in ipairs(Players:GetPlayers()) do
		local char = player.Character
		local hum = char and char:FindFirstChildOfClass("Humanoid")
		local isCharacterAlive = hum and hum.Health > 0
		local isRoundAlive = player:GetAttribute("OMC_RoundAlive")

		-- During ad-hoc studio tests, round attributes might not be set yet.
		-- In that case, fall back to chasing any living character.
		if (anyMarkedAlive and isRoundAlive) or ((not anyMarkedAlive) and isCharacterAlive) then
			table.insert(alive, player)
		end
	end
	return alive
end

local function nearestAlivePlayerFrom(pos)
	local bestPlayer = nil
	local bestDist = math.huge
	for _, player in ipairs(getAlivePlayers()) do
		local char = player.Character
		local root = char and char:FindFirstChild("HumanoidRootPart")
		if root then
			local dist = (root.Position - pos).Magnitude
			if dist < bestDist then
				bestDist = dist
				bestPlayer = player
			end
		end
	end
	return bestPlayer, bestDist
end

function VictimService:CreateVictim(i)
	local template = pickTemplate(self)
	local monster

	if template and template:IsA("Model") then
		monster = template:Clone()
		local variantName = template.Name
		monster.Name = string.format("Sovereign_Victim_%d_%s", i, variantName)
		stripEmbeddedMonsterScripts(monster)
		monster:SetAttribute("MonsterVariant", variantName)
	else
		warn("[VICTIMS] MonsterTemplate missing; using fallback block monster")
		monster = Instance.new("Model")
		monster.Name = "Sovereign_Victim_" .. i

		local root = Instance.new("Part")
		root.Name = "HumanoidRootPart"
		root.Size = Vector3.new(4, 6, 4)
		root.Material = Enum.Material.SmoothPlastic
		root.Color = Color3.fromRGB(180, 40, 40)
		root.Parent = monster

		local hum = Instance.new("Humanoid")
		hum.Parent = monster
		monster.PrimaryPart = root
	end

	local root, hum = ensureMonsterRootAndHumanoid(monster)

	-- Unanchor all parts and give server network ownership so MoveTo works
	for _, part in ipairs(monster:GetDescendants()) do
		if part:IsA("BasePart") then
			part.Anchored = false
			pcall(function() part:SetNetworkOwner(nil) end)
		end
	end

	if root then
		local spawnPos = Vector3.new(math.random(-self.Config.SPAWN_RADIUS, self.Config.SPAWN_RADIUS), 8, math.random(-self.Config.SPAWN_RADIUS, self.Config.SPAWN_RADIUS))
		if monster:IsA("Model") then
			monster:PivotTo(CFrame.new(spawnPos))
		end
	end

	if hum then
		-- Ensure the Humanoid is alive (cloned template may have Health = 0)
		if hum.MaxHealth <= 0 then hum.MaxHealth = 100 end
		hum.Health = hum.MaxHealth
		hum.WalkSpeed = self.Config.CHASE_SPEED
		hum.UseJumpPower = true
		hum.JumpPower = 70
		hum.AutoRotate = true
		hum.PlatformStand = false
		hum.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff
	end

	monster:SetAttribute("Tagged", false)
	monster:SetAttribute("Alive", true)
	monster:SetAttribute("MonsterId", i)
	if not monster:GetAttribute("MonsterVariant") then
		monster:SetAttribute("MonsterVariant", "Fallback")
	end
	monster.Parent = ensureVictimFolder(self)
	return monster
end

function VictimService:KillMonster(monster)
	if not monster or not monster.Parent then return end
	if monster:GetAttribute("Alive") == false then return end

	monster:SetAttribute("Tagged", true)
	monster:SetAttribute("Alive", false)

	local hum = monster:FindFirstChildOfClass("Humanoid")
	if hum then
		hum.WalkSpeed = 0
		hum.JumpPower = 0
		hum.Health = 0
	end

	for _, d in ipairs(monster:GetDescendants()) do
		if d:IsA("Motor6D") then
			d.Enabled = false
		elseif d:IsA("BasePart") then
			d.Anchored = false
			d.CanCollide = false
		end
	end
end

function VictimService:GetAliveMonsters()
	local alive = {}
	for _, monster in ipairs(self.State.monsters) do
		if monster and monster.Parent and monster:GetAttribute("Alive") ~= false then
			table.insert(alive, monster)
		end
	end
	return alive
end

function VictimService:AreAllMonstersDead()
	for _, monster in ipairs(self.State.monsters) do
		if monster and monster.Parent and monster:GetAttribute("Alive") ~= false then
			return false
		end
	end
	return true
end

-- ── Resonant Chase Loop ──────────────────────────────────────────────────────
function VictimService:_startChaseLoop()
	if self.State.chaseThread then return end
	
	-- [OMC RESONANCE GUARD]
	local function validateTarget(pos)
		if typeof(pos) ~= "Vector3" then return false end
		if pos.Y < -500 or pos.Y > 5000 then return false end -- Void check
		return true
	end

	self.State.chaseThread = task.spawn(function()
		while self.State.active do
			local aliveMonsters = self:GetAliveMonsters()
			for _, monster in ipairs(aliveMonsters) do
				local hum = monster:FindFirstChildOfClass("Humanoid")
				local root = getMonsterRoot(monster)
				
				if hum and root and validateTarget(root.Position) then
					local target, dist = nearestAlivePlayerFrom(root.Position)
					local targetRoot = target and target.Character and target.Character:FindFirstChild("HumanoidRootPart")
					
					if targetRoot and validateTarget(targetRoot.Position) then
						-- 4D Predictive Interception
						local velocity = targetRoot.AssemblyLinearVelocity
						local predictedPos = targetRoot.Position + (velocity * self.Config.PREDICTION_TIME)
						
						-- Lunge Logic (Resonance Threshold Check)
						if dist and dist <= self.Config.LUNGE_DISTANCE then
							predictedPos = predictedPos + (targetRoot.CFrame.LookVector * 3)
							hum.Jump = true
						end

						-- Vertical Resonance
						if (targetRoot.Position.Y - root.Position.Y) > 4 then
							hum.Jump = true
						end

						-- Sovereign Movement Execution
						hum:MoveTo(predictedPos)
					end
				end
			end
			
			-- Resonant Heartbeat (Synced to 3072-D Manifold)
			task.wait(self.Config.RETARGET_RATE)
		end
		self.State.chaseThread = nil
	end)
end

function VictimService:StopRound()
	self.State.active = false
	if self.State.folder and self.State.folder.Parent then
		self.State.folder:Destroy()
	end
	self.State.folder = nil
	self.State.monsters = {}
end

function VictimService:StartRound()
	self:StopRound()
	self.State.active = true

	for i = 1, self.Config.COUNT do
		table.insert(self.State.monsters, self:CreateVictim(i))
	end

	self:_startChaseLoop()
	print(string.format("[VICTIMS] Spawned %d monsters.", #self.State.monsters))
end

function VictimService:Init()
	print("[VICTIMS] Service initialized.")
end

function VictimService:Start()
	-- Round lifecycle is controlled by TagGameService via StartRound/StopRound.
end

return VictimService
