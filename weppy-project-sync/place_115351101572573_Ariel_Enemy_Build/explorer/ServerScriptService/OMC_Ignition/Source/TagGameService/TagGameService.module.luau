local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local ServerScriptService = game:GetService("ServerScriptService")

local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local VictimService = require(script.Parent:WaitForChild("VictimService"))

local function CreateBridge(name)
	local remote = ReplicatedStorage:FindFirstChild(name) or Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = ReplicatedStorage
	return {
		FireAll = function(...) remote:FireAllClients(...) end,
		_remote = remote,
	}
end

local TagGameService = {
	Name = "TagGameService",
	Config = {
		ROUND_DURATION = 300,
		INTERMISSION = 3,
		MONSTER_TAG_DISTANCE = 6.8,
		PLAYER_TAG_DISTANCE = 9,
		PLAYER_TAG_COOLDOWN = 0.4,
		MONSTER_TAG_COOLDOWN = 0.85,
		POST_ROUND_DELAY = 8,
	},
	Bridges = {
		GameUpdate = CreateBridge("OMC_TagUpdate"),
	},
	State = {
		active = false,
		participants = {},
		alivePlayers = {},
		roundEndAt = 0,
		heartbeatConn = nil,
		lastMonsterTagAt = {},
		lastPlayerTagAt = {},
	},
}

local function getRootFromModel(model)
	if not model then return nil end
	if model:IsA("Model") then
		return model:FindFirstChild("HumanoidRootPart") or model.PrimaryPart
	end
	return nil
end

local function getPlayerRoot(player)
	local character = player and player.Character
	if not character then return nil end
	return character:FindFirstChild("HumanoidRootPart")
end

local function monsterKey(monster)
	local id = monster and monster:GetAttribute("MonsterId")
	if id then
		return tostring(id)
	end
	return monster and monster.Name or "unknown"
end

local function formatTime(seconds)
	local sec = math.max(0, math.floor(seconds))
	local m = math.floor(sec / 60)
	local s = sec % 60
	return string.format("%d:%02d", m, s)
end

local function showStatusUI(text)
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if gui then
			local sg = gui:FindFirstChild("Sovereign_GameUI")
			if not sg then
				sg = Instance.new("ScreenGui")
				sg.Name = "Sovereign_GameUI"
				sg.ResetOnSpawn = false
				sg.Parent = gui
				local txt = Instance.new("TextLabel")
				txt.Name = "Status"
				txt.Size = UDim2.new(0, 220, 0, 46)
				txt.Position = UDim2.new(1, -232, 0, 20)
				txt.BackgroundTransparency = 0.25
				txt.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
				txt.TextColor3 = Color3.fromRGB(245, 245, 245)
				txt.TextSize = 20
				txt.Font = Enum.Font.GothamBold
				txt.Parent = sg
				Instance.new("UICorner", txt).CornerRadius = UDim.new(0, 8)
				local stroke = Instance.new("UIStroke", txt)
				stroke.Color = Color3.fromRGB(200, 30, 30)
				stroke.Thickness = 1.5
			end
			sg.Enabled = true
			sg.Status.Text = text
		end
	end
end

local function clearStatusUI()
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if gui then
			local sg = gui:FindFirstChild("Sovereign_GameUI")
			if sg then
				sg:Destroy()
			end
		end
	end
end

local function showResultsUI(titleText, survivors)
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if not gui then continue end

		local old = gui:FindFirstChild("Sovereign_ResultsUI")
		if old then old:Destroy() end

		local sg = Instance.new("ScreenGui")
		sg.Name = "Sovereign_ResultsUI"
		sg.ResetOnSpawn = false
		sg.Parent = gui

		local panel = Instance.new("Frame")
		panel.Size = UDim2.new(0, 420, 0, 320)
		panel.Position = UDim2.new(0.5, 0, 0.5, 0)
		panel.AnchorPoint = Vector2.new(0.5, 0.5)
		panel.BackgroundColor3 = Color3.fromRGB(10, 10, 20)
		panel.BackgroundTransparency = 0.08
		panel.Parent = sg
		Instance.new("UICorner", panel).CornerRadius = UDim.new(0, 12)
		local stroke = Instance.new("UIStroke", panel)
		stroke.Color = Color3.fromRGB(255, 80, 80)
		stroke.Thickness = 2

		local title = Instance.new("TextLabel")
		title.Size = UDim2.new(1, 0, 0, 56)
		title.Position = UDim2.new(0, 0, 0, 12)
		title.BackgroundTransparency = 1
		title.Text = titleText
		title.TextColor3 = Color3.fromRGB(255, 220, 220)
		title.TextSize = 28
		title.Font = Enum.Font.GothamBold
		title.Parent = panel

		local header = Instance.new("TextLabel")
		header.Size = UDim2.new(1, -20, 0, 26)
		header.Position = UDim2.new(0, 10, 0, 78)
		header.BackgroundTransparency = 1
		header.Text = #survivors > 0 and "Survivors:" or "No survivors."
		header.TextColor3 = Color3.fromRGB(220, 220, 220)
		header.TextSize = 16
		header.Font = Enum.Font.GothamMedium
		header.TextXAlignment = Enum.TextXAlignment.Left
		header.Parent = panel

		for i, name in ipairs(survivors) do
			local row = Instance.new("TextLabel")
			row.Size = UDim2.new(1, -30, 0, 24)
			row.Position = UDim2.new(0, 15, 0, 104 + ((i - 1) * 26))
			row.BackgroundTransparency = 1
			row.Text = "- " .. name
			row.TextColor3 = Color3.fromRGB(170, 255, 170)
			row.TextSize = 16
			row.Font = Enum.Font.Gotham
			row.TextXAlignment = Enum.TextXAlignment.Left
			row.Parent = panel
		end
	end
end

local function clearResultsUI()
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if gui then
			local sg = gui:FindFirstChild("Sovereign_ResultsUI")
			if sg then sg:Destroy() end
		end
	end
end

function TagGameService:_setPlayerRoundAlive(player, alive)
	player:SetAttribute("OMC_RoundAlive", alive and true or false)
	if alive then
		self.State.alivePlayers[player.UserId] = true
	else
		self.State.alivePlayers[player.UserId] = nil
	end
end

function TagGameService:_getAlivePlayers()
	local alive = {}
	for userId in pairs(self.State.alivePlayers) do
		local player = Players:GetPlayerByUserId(userId)
		if player and player.Parent == Players then
			local root = getPlayerRoot(player)
			if root then
				table.insert(alive, player)
			else
				self:_setPlayerRoundAlive(player, false)
			end
		end
	end
	return alive
end

function TagGameService:_killPlayer(player)
	if not player or not self.State.alivePlayers[player.UserId] then return end
	self:_setPlayerRoundAlive(player, false)
	local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if hum then
		hum.Health = 0
	end
	self.Bridges.GameUpdate:FireAll("PLAYER_DOWN", player.Name)
end

function TagGameService:_killMonster(monster)
	if not monster or monster:GetAttribute("Alive") == false then return end
	VictimService:KillMonster(monster)
	self.Bridges.GameUpdate:FireAll("MONSTER_DOWN", monster.Name)
end

function TagGameService:_evaluateContacts()
	local alivePlayers = self:_getAlivePlayers()
	local aliveMonsters = VictimService:GetAliveMonsters()
	if #alivePlayers == 0 or #aliveMonsters == 0 then return end

	local now = os.clock()
	for _, monster in ipairs(aliveMonsters) do
		local mRoot = getRootFromModel(monster)
		if mRoot then
			for _, player in ipairs(alivePlayers) do
				local pRoot = getPlayerRoot(player)
				if pRoot then
					local dist = (mRoot.Position - pRoot.Position).Magnitude
					if dist <= self.Config.PLAYER_TAG_DISTANCE then
						local pKey = string.format("%d:%s", player.UserId, monsterKey(monster))
						local lastPlayerTag = self.State.lastPlayerTagAt[pKey] or 0
						if (now - lastPlayerTag) >= self.Config.PLAYER_TAG_COOLDOWN then
							self.State.lastPlayerTagAt[pKey] = now
							self:_killMonster(monster)
							break
						end
					end
				end
			end
		end
	end

	aliveMonsters = VictimService:GetAliveMonsters()
	for _, monster in ipairs(aliveMonsters) do
		local mRoot = getRootFromModel(monster)
		if mRoot then
			for _, player in ipairs(self:_getAlivePlayers()) do
				local pRoot = getPlayerRoot(player)
				if pRoot then
					local dist = (mRoot.Position - pRoot.Position).Magnitude
					if dist <= self.Config.MONSTER_TAG_DISTANCE then
						local mKey = string.format("%s:%d", monsterKey(monster), player.UserId)
						local lastMonsterTag = self.State.lastMonsterTagAt[mKey] or 0
						if (now - lastMonsterTag) >= self.Config.MONSTER_TAG_COOLDOWN then
							self.State.lastMonsterTagAt[mKey] = now
							self:_killPlayer(player)
						end
					end
				end
			end
		end
	end
end

function TagGameService:_collectSurvivors()
	local survivors = {}
	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("OMC_RoundAlive") then
			table.insert(survivors, player.Name)
		end
	end
	return survivors
end

function TagGameService:_endRound(result)
	if not self.State.active then return end
	self.State.active = false
	local survivors = self:_collectSurvivors()

	if self.State.heartbeatConn then
		self.State.heartbeatConn:Disconnect()
		self.State.heartbeatConn = nil
	end

	VictimService:StopRound()

	for _, player in ipairs(Players:GetPlayers()) do
		self:_setPlayerRoundAlive(player, false)
	end

	clearStatusUI()
	showResultsUI(result, survivors)

	self.Bridges.GameUpdate:FireAll("ROUND_END", result)
	Telemetry.dispatchPulse({ event = "RoundEnd", result = result })

	local roundEndedEvent = ServerScriptService:FindFirstChild("OMC_RoundEnded")
	if roundEndedEvent and roundEndedEvent:IsA("BindableEvent") then
		roundEndedEvent:Fire(result)
	end

	task.delay(self.Config.POST_ROUND_DELAY, function()
		clearResultsUI()
		for _, player in ipairs(Players:GetPlayers()) do
			local char = player.Character
			local root = char and char:FindFirstChild("HumanoidRootPart")
			if root then
				root.CFrame = _G.LobbySpawnCF or CFrame.new(0, 40, 0)
			end
		end
	end)
end

function TagGameService:_tickRound()
	if not self.State.active then return end

	self:_evaluateContacts()

	if VictimService:AreAllMonstersDead() then
		self:_endRound("Survivors Win - All Monsters Eliminated")
		return
	end

	local alivePlayers = self:_getAlivePlayers()
	if #alivePlayers == 0 then
		self:_endRound("Monsters Win - All Players Eliminated")
		return
	end

	local remaining = math.max(0, self.State.roundEndAt - os.clock())
	showStatusUI("Survive: " .. formatTime(remaining))
	if remaining <= 0 then
		self:_endRound("Survivors Win - Time Expired")
	end
end

function TagGameService:StartRound(launchedUserIds)
	if self.State.active then return end

	self.State.participants = {}
	self.State.alivePlayers = {}
	self.State.lastMonsterTagAt = {}
	self.State.lastPlayerTagAt = {}

	for _, player in ipairs(Players:GetPlayers()) do
		local include = true
		if type(launchedUserIds) == "table" then
			include = false
			for _, userId in ipairs(launchedUserIds) do
				if userId == player.UserId then
					include = true
					break
				end
			end
		end
		if include then
			self.State.participants[player.UserId] = true
			self:_setPlayerRoundAlive(player, true)
		else
			self:_setPlayerRoundAlive(player, false)
		end
	end

	self.State.active = true
	self.State.roundEndAt = os.clock() + self.Config.ROUND_DURATION

	showStatusUI("Round Starting...")
	task.wait(self.Config.INTERMISSION)

	VictimService:StartRound()

	if self.State.heartbeatConn then
		self.State.heartbeatConn:Disconnect()
	end
	self.State.heartbeatConn = RunService.Heartbeat:Connect(function()
		self:_tickRound()
	end)

	self.Bridges.GameUpdate:FireAll("ROUND_START", self.Config.ROUND_DURATION)
	Telemetry.dispatchPulse({ event = "RoundStart", duration = self.Config.ROUND_DURATION })
	print("[TAG] Round started.")
end

function TagGameService:Init()
	print("[TAG] Service initialized.")
end

function TagGameService:Start()
	local gameBegin = ServerScriptService:WaitForChild("OMC_Lobby_GameBegin", 30)
	if gameBegin and gameBegin:IsA("BindableEvent") then
		gameBegin.Event:Connect(function(launchedUserIds)
			if not self.State.active then
				task.spawn(function()
					self:StartRound(launchedUserIds)
				end)
			end
		end)
	end
end

return TagGameService
