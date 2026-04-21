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
		ROUND_DURATION = 300, -- 5 minutes (adjustable)
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
	if self.State.swarm[target] then return end -- Already infected
	if os.time() - self.State.lastTag < self.Config.COOLDOWN then return end
	
	local dist = (tagger.Character.PrimaryPart.Position - target.Character.PrimaryPart.Position).Magnitude
	if dist > self.Config.TAG_DISTANCE then return end
	
	-- Swarm Proliferation
	self.State.swarm[target] = true
	self.State.lastTag = os.time()
	self:_applyVisuals(target)
	
	self.Bridges.GameUpdate:FireAll("INFECTED", target.Name)
	Telemetry.dispatchPulse({ event = "Sovereign_Infection", count = #self.State.swarm })
	
	-- Victory Condition Check
	local players = Players:GetPlayers()
	local infectedCount = 0
	for _ in pairs(self.State.swarm) do infectedCount += 1 end
    
    -- [[ MONETIZATION GATE: INFECTION RESONANCE RATIO (IRR) ]]
	if infectedCount >= 10 then
        local timeElapsed = self.Config.ROUND_DURATION - self.State.timer
        if timeElapsed <= 45 then
            for _, p in ipairs(players) do
                -- Only prompt once per cycle
                if not self.State.prompted[p] then
                    self.State.prompted[p] = true
                    pcall(function()
                        game:GetService("MarketplaceService"):PromptProductPurchase(p, 123456789)
                    end)
                    Telemetry.dispatchPulse({ event = "Sovereign_Monetization_Prompt", metric = "IRR_Triggered" })
                end
            end
        end
    end

	if infectedCount >= #players then self.State.active = false end
end

-- [[ LIFESTYLE & ROUND LOGIC ]]

-- Format seconds as MM:SS
local function formatTime(seconds: number): string
	local m = math.floor(seconds / 60)
	local s = seconds % 60
	return string.format("%d:%02d", m, s)
end

-- Build or retrieve the HUD for a player
local function getOrBuildHUD(player: Player)
	local gui = player:FindFirstChild("PlayerGui")
	if not gui then return nil end

	local sg = gui:FindFirstChild("Sovereign_GameUI")
	if sg then return sg end

	sg = Instance.new("ScreenGui")
	sg.Name = "Sovereign_GameUI"
	sg.ResetOnSpawn = false
	sg.DisplayOrder = 5
	sg.Parent = gui

	-- Top-center pill container
	local pill = Instance.new("Frame")
	pill.Name = "Pill"
	pill.Size = UDim2.fromOffset(320, 52)
	pill.Position = UDim2.new(0.5, 0, 0, 12)
	pill.AnchorPoint = Vector2.new(0.5, 0)
	pill.BackgroundColor3 = Color3.fromRGB(8, 8, 16)
	pill.BackgroundTransparency = 0.15
	pill.BorderSizePixel = 0
	pill.Parent = sg

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 26)
	corner.Parent = pill

	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(0, 210, 255)
	stroke.Thickness = 1.5
	stroke.Transparency = 0.2
	stroke.Parent = pill

	-- Round label (left side)
	local roundLabel = Instance.new("TextLabel")
	roundLabel.Name = "RoundLabel"
	roundLabel.Size = UDim2.fromScale(0.45, 1)
	roundLabel.Position = UDim2.fromScale(0, 0)
	roundLabel.BackgroundTransparency = 1
	roundLabel.TextColor3 = Color3.fromRGB(0, 210, 255)
	roundLabel.TextSize = 13
	roundLabel.Font = Enum.Font.GothamBold
	roundLabel.Text = "ROUND"
	roundLabel.TextXAlignment = Enum.TextXAlignment.Center
	roundLabel.Parent = pill

	-- Divider
	local divider = Instance.new("Frame")
	divider.Name = "Divider"
	divider.Size = UDim2.fromOffset(1, 28)
	divider.Position = UDim2.new(0.45, 0, 0.5, 0)
	divider.AnchorPoint = Vector2.new(0, 0.5)
	divider.BackgroundColor3 = Color3.fromRGB(0, 210, 255)
	divider.BackgroundTransparency = 0.6
	divider.BorderSizePixel = 0
	divider.Parent = pill

	-- Clock (right side)
	local clock = Instance.new("TextLabel")
	clock.Name = "Clock"
	clock.Size = UDim2.fromScale(0.55, 1)
	clock.Position = UDim2.fromScale(0.45, 0)
	clock.BackgroundTransparency = 1
	clock.TextColor3 = Color3.fromRGB(255, 255, 255)
	clock.TextSize = 22
	clock.Font = Enum.Font.GothamBold
	clock.Text = "5:00"
	clock.TextXAlignment = Enum.TextXAlignment.Center
	clock.Parent = pill

	-- Status bar below pill
	local status = Instance.new("TextLabel")
	status.Name = "Status"
	status.Size = UDim2.fromOffset(320, 24)
	status.Position = UDim2.new(0.5, 0, 0, 70)
	status.AnchorPoint = Vector2.new(0.5, 0)
	status.BackgroundTransparency = 1
	status.TextColor3 = Color3.fromRGB(180, 190, 210)
	status.TextSize = 12
	status.Font = Enum.Font.Gotham
	status.Text = ""
	status.Parent = sg

	return sg
end

local function UpdateGlobalUI(timerSeconds: number?, statusText: string?, roundPhase: string?)
	for _, player in ipairs(Players:GetPlayers()) do
		local sg = getOrBuildHUD(player)
		if not sg then continue end

		local pill = sg:FindFirstChild("Pill")
		if pill then
			local clock = pill:FindFirstChild("Clock")
			local roundLabel = pill:FindFirstChild("RoundLabel")

			if timerSeconds ~= nil and clock then
				local t = math.max(0, timerSeconds)
				clock.Text = formatTime(t)
				-- Turn clock red in last 30s
				clock.TextColor3 = (t <= 30)
					and Color3.fromRGB(255, 60, 60)
					or Color3.fromRGB(255, 255, 255)
			end

			if roundPhase and roundLabel then
				roundLabel.Text = roundPhase
			end
		end

		local statusLabel = sg:FindFirstChild("Status")
		if statusLabel and statusText then
			statusLabel.Text = statusText
		end
	end
end

function TagGameService:RunRoundLoop()
	while true do
		self.State.active = false
		for player, list in pairs(self.State.visuals) do
			for _, v in ipairs(list) do v:Destroy() end
		end
		self.State.visuals = {}
		self.State.swarm = {}
		self.State.prompted = {}

		-- Intermission countdown
		for i = self.Config.INTERMISSION, 1, -1 do
			UpdateGlobalUI(nil, "Next round in " .. i .. "s...", "INTERMISSION")
			task.wait(1)
		end

		local p = Players:GetPlayers()
		if #p >= self.Config.MIN_PLAYERS then
			self.State.active = true
			self.State.timer = self.Config.ROUND_DURATION

			local patientZero = p[math.random(1, #p)]
			self.State.swarm[patientZero] = true
			self:_applyVisuals(patientZero)

			self.Bridges.GameUpdate:FireAll("INCEPTION", patientZero.Name, self.State.timer)

			while self.State.timer > 0 and self.State.active do
				local infectedCount = 0
				for _ in pairs(self.State.swarm) do infectedCount += 1 end
				UpdateGlobalUI(
					self.State.timer,
					"Infected: " .. infectedCount .. " / " .. #Players:GetPlayers(),
					"ROUND"
				)
				self.State.timer -= 1
				task.wait(1)
			end

			UpdateGlobalUI(0, "Round over!", "ROUND")
			task.wait(2)
		else
			UpdateGlobalUI(self.Config.ROUND_DURATION, "Waiting for players...", "WAITING")
			task.wait(1)
		end
	end
end

function TagGameService:Init()
	-- Bridge Receiver Guard
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
