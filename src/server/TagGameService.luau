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
		ROUND_DURATION = 120, -- Longer for bot hunt
		INTERMISSION = 5,
		MIN_PLAYERS = 1, -- LONE WOLF ALPHA
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

local function UpdateGlobalUI(text)
	for _, player in ipairs(Players:GetPlayers()) do
		local gui = player:FindFirstChild("PlayerGui")
		if gui then
			local sg = gui:FindFirstChild("Sovereign_GameUI")
			if not sg then
				sg = Instance.new("ScreenGui")
				sg.Name = "Sovereign_GameUI"
				sg.Parent = gui
				
				local txt = Instance.new("TextLabel")
				txt.Name = "Status"
				txt.Size = UDim2.new(0, 400, 0, 50)
				txt.Position = UDim2.new(0.5, -200, 0, 30) -- Centered below Roblox topbar
				txt.AnchorPoint = Vector2.new(0.5, 0)
				txt.BackgroundTransparency = 0.3
				txt.BackgroundColor3 = Color3.fromRGB(15, 15, 25) -- Deep Luxury Charcoal
				txt.TextColor3 = Color3.fromRGB(250, 250, 250)
				txt.TextSize = 18
				txt.Font = Enum.Font.GothamMedium -- Clean geometric sans-serif
				txt.Parent = sg
				
				local corner = Instance.new("UICorner", txt)
				corner.CornerRadius = UDim.new(0, 8)
				
				local stroke = Instance.new("UIStroke", txt)
				stroke.Color = Color3.fromRGB(0, 255, 200) -- Ties into the new glowing aesthetic
				stroke.Thickness = 1.5
			end
			sg.Status.Text = " VIRAL VESTRY | " .. text
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
		self.State.prompted = {} -- Clear prompts for new round
		
		UpdateGlobalUI("INTERMISSION (" .. self.Config.INTERMISSION .. "s)")
		task.wait(self.Config.INTERMISSION)
		
		local p = Players:GetPlayers()
		if #p >= self.Config.MIN_PLAYERS then
			self.State.active = true
			self.State.timer = self.Config.ROUND_DURATION
			
			local patientZero = p[math.random(1, #p)]
			self.State.swarm[patientZero] = true
			self:_applyVisuals(patientZero)
			
			self.Bridges.GameUpdate:FireAll("INCEPTION", patientZero.Name, self.State.timer)
			
			while self.State.timer > 0 and self.State.active do
				UpdateGlobalUI("INFECTION PURGE | Time Remaining: " .. self.State.timer .. "s")
				self.State.timer -= 1
				task.wait(1)
			end
			
			UpdateGlobalUI("ROUND OVER. SWARM SECURED.")
			task.wait(2)
		else
			UpdateGlobalUI("WAITING FOR PLAYERS...")
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
