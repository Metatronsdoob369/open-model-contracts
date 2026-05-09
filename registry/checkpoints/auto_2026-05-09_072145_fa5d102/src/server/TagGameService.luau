--[=[
    TagGameService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: Game_Rules
    Law Compliance: Phase Resonance §2, Token Integrity §4

    TOKENIZED PRIMER (Round/Tag Interaction):
    - Abstracted "It" mechanics with configurable markers.
    - Framework-free governed signals.
    - No hard-coded assets (Uses Config tokens for map anchors).
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Sovereign Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

-- Native Bridge Factory (SafeFire)
local function CreateBridge(name)
	local remote = ReplicatedStorage:FindFirstChild(name) or Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = ReplicatedStorage
	return {
		FireAll = function(...) remote:FireAllClients(...) end,
		OnEvent = remote.OnServerEvent,
		_remote = remote
	}
end

local TagGameService = {
	Name = "TagGameService",
	Config = {
		ROUND_DURATION = 300, -- 5 minutes
		INTERMISSION = 5,
		MIN_PLAYERS = 1,
		COOLDOWN = 1.0,
		MARK_COLOR = Color3.fromRGB(50, 255, 50),
		MARK_NAME = "OMC_Infection",
		TAG_DISTANCE = 18,
	},
	Bridges = {
		GameUpdate = CreateBridge("OMC_TagUpdate"),
		TagRequest = CreateBridge("OMC_TagRequest"),
	},
	State = { active = false, swarm = {}, timer = 0, lastTag = 0, visuals = {} },
}

local function formatTime(seconds)
	local m = math.floor(seconds / 60)
	local s = seconds % 60
	return string.format("%d:%02d", m, s)
end

-- [[ SPATIAL GOVERNANCE ]]

function TagGameService:_applyVisuals(player)
	local char = player.Character
	if not char then return end
	self.State.visuals[player] = {}
	for _, p in ipairs(char:GetChildren()) do
		if p:IsA("BasePart") then
			local sg = Instance.new("SurfaceGui")
			sg.Name = self.Config.MARK_NAME
			sg.AlwaysOnTop = true
			sg.Parent = p
			local f = Instance.new("Frame")
			f.Size = UDim2.new(1,0,1,0)
			f.BackgroundColor3 = self.Config.MARK_COLOR
			f.BackgroundTransparency = 0.4
			f.Parent = sg
			table.insert(self.State.visuals[player], sg)
		end
	end
end

function TagGameService:_processTag(tagger, target)
	if not self.State.active or not self.State.swarm[tagger] then return end
	if self.State.swarm[target] then return end
	if os.time() - self.State.lastTag < self.Config.COOLDOWN then return end

	local dist = (tagger.Character.PrimaryPart.Position - target.Character.PrimaryPart.Position).Magnitude
	if dist > self.Config.TAG_DISTANCE then return end

	self.State.swarm[target] = true
	self.State.lastTag = os.time()
	self:_applyVisuals(target)

	self.Bridges.GameUpdate:FireAll("INFECTED", target.Name)
	Telemetry.dispatchPulse({ event = "Sovereign_Infection", count = #self.State.swarm })

	local players = Players:GetPlayers()
	local infectedCount = 0
	for _ in pairs(self.State.swarm) do infectedCount += 1 end
	if infectedCount >= #players then self.State.active = false end
end

-- [[ ROUND UI ]]

local function UpdateGlobalUI(text)
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
				txt.Size = UDim2.new(0, 160, 0, 44)
				txt.Position = UDim2.new(1, -170, 0, 20) -- Top right
				txt.AnchorPoint = Vector2.new(0, 0)
				txt.BackgroundTransparency = 0.3
				txt.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
				txt.TextColor3 = Color3.fromRGB(250, 250, 250)
				txt.TextSize = 20
				txt.Font = Enum.Font.GothamMedium
				txt.Parent = sg

				local corner = Instance.new("UICorner", txt)
				corner.CornerRadius = UDim.new(0, 8)

				local stroke = Instance.new("UIStroke", txt)
				stroke.Color = Color3.fromRGB(0, 255, 200)
				stroke.Thickness = 1.5
			end
			sg.Status.Text = text
		end
	end
end

-- [[ RESULTS SCREEN ]]

local function ShowResults(survivors)
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if not gui then continue end

		-- Hide the countdown UI
		local countdownGui = gui:FindFirstChild("Sovereign_GameUI")
		if countdownGui then countdownGui.Enabled = false end

		local sg = Instance.new("ScreenGui")
		sg.Name = "Sovereign_ResultsUI"
		sg.ResetOnSpawn = false
		sg.Parent = gui

		-- Dark overlay panel
		local panel = Instance.new("Frame")
		panel.Size = UDim2.new(0, 360, 0, 300)
		panel.Position = UDim2.new(0.5, 0, 0.5, 0)
		panel.AnchorPoint = Vector2.new(0.5, 0.5)
		panel.BackgroundColor3 = Color3.fromRGB(10, 10, 20)
		panel.BackgroundTransparency = 0.1
		panel.Parent = sg
		Instance.new("UICorner", panel).CornerRadius = UDim.new(0, 12)
		local stroke = Instance.new("UIStroke", panel)
		stroke.Color = Color3.fromRGB(0, 255, 200)
		stroke.Thickness = 2

		-- Title
		local title = Instance.new("TextLabel")
		title.Size = UDim2.new(1, 0, 0, 50)
		title.Position = UDim2.new(0, 0, 0, 10)
		title.BackgroundTransparency = 1
		title.Text = #survivors > 0 and "SURVIVORS WIN!" or "INFECTION WINS!"
		title.TextColor3 = Color3.fromRGB(0, 255, 200)
		title.TextSize = 26
		title.Font = Enum.Font.GothamBold
		title.Parent = panel

		-- Survivors header
		local header = Instance.new("TextLabel")
		header.Size = UDim2.new(1, 0, 0, 30)
		header.Position = UDim2.new(0, 0, 0, 65)
		header.BackgroundTransparency = 1
		header.Text = #survivors > 0 and "Survivors:" or "No survivors."
		header.TextColor3 = Color3.fromRGB(200, 200, 200)
		header.TextSize = 18
		header.Font = Enum.Font.GothamMedium
		header.Parent = panel

		-- Survivor list
		for i, survivorName in ipairs(survivors) do
			local row = Instance.new("TextLabel")
			row.Size = UDim2.new(1, -20, 0, 28)
			row.Position = UDim2.new(0, 10, 0, 90 + (i - 1) * 32)
			row.BackgroundTransparency = 1
			row.Text = "✓  " .. survivorName
			row.TextColor3 = Color3.fromRGB(50, 255, 120)
			row.TextSize = 17
			row.Font = Enum.Font.Gotham
			row.TextXAlignment = Enum.TextXAlignment.Left
			row.Parent = panel
		end
	end
end

-- [[ ROUND LOOP ]]

function TagGameService:RunRoundLoop()
	-- Intermission before game starts
	UpdateGlobalUI("Intermission...")
	task.wait(self.Config.INTERMISSION)

	local p = Players:GetPlayers()
	if #p < self.Config.MIN_PLAYERS then
		UpdateGlobalUI("Waiting...")
		return
	end

	-- Start round
	self.State.active = true
	self.State.timer = self.Config.ROUND_DURATION

	local patientZero = p[math.random(1, #p)]
	self.State.swarm[patientZero] = true
	self:_applyVisuals(patientZero)

	self.Bridges.GameUpdate:FireAll("INCEPTION", patientZero.Name, self.State.timer)

	while self.State.timer > 0 and self.State.active do
		UpdateGlobalUI(formatTime(self.State.timer))
		self.State.timer -= 1
		task.wait(1)
	end

	self.State.active = false

	-- Build survivor list
	local allPlayers = Players:GetPlayers()
	local survivors = {}
	for _, player in ipairs(allPlayers) do
		if not self.State.swarm[player] then
			table.insert(survivors, player.Name)
		end
	end

	ShowResults(survivors)
end

function TagGameService:Init()
	self.Bridges.TagRequest.OnEvent:Connect(function(player, targetName)
		local target = Players:FindFirstChild(targetName)
		if target then self:_processTag(player, target) end
	end)
	print("🏮 [TAG] Infection Mutation Manifest. Proliferation protocol active.")
end

function TagGameService:Start()
	task.spawn(function() self:RunRoundLoop() end)
end

return TagGameService
