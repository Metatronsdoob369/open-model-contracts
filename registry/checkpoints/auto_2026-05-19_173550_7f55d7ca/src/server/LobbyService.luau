-- LobbyService.luau
-- [[ THE LOOKOUT — PREMIUM SOCIAL HUB ]]
-- Features: 1st-Person Tactical View, Scare-Sequence Strobe, Uniform Dispersion Launch

local Players             = game:GetService("Players")
local ReplicatedStorage   = game:GetService("ReplicatedStorage")
local TweenService        = game:GetService("TweenService")
local ServerScriptService = game:GetService("ServerScriptService")
local Workspace           = game:GetService("Workspace")

local LobbyService = {
	Name  = "LobbyService",
	State = {
		seats             = {},
		lineup            = {}, -- { [Player] = { status = "Chill" | "Chair" } }
		gameActive        = false,
		lobbyFolder       = nil,
		lightingMode      = "Social",
	},
	Bridges        = {},
	GameBeginEvent = nil,
}

-- [[ CONSTANTS ]]
local LOBBY_CF   = CFrame.new(0, 500, 150)
local LOBBY_SIZE = Vector3.new(120, 30, 80)
local WINDOW_CF  = LOBBY_CF * CFrame.new(0, 0, -40) -- Look toward the arena at Z=0

-- [[ PART FACTORY ]]
local function mk(parent, size, cf, color, mat, trans)
	local p = Instance.new("Part")
	p.Size       = size
	p.CFrame     = cf
	p.Color      = color or Color3.fromRGB(45, 45, 50)
	p.Material   = mat or Enum.Material.Slate
	p.Anchored   = true
	p.Transparency = trans or 0
	p.Parent     = parent
	return p
end

-- [[ ATMOSPHERIC ORCHESTRATION ]]
local function setLightingMode(svc, mode)
	svc.State.lightingMode = mode
	local folder = svc.State.lobbyFolder
	if not folder then return end

	if mode == "Scare" then
		for _, light in ipairs(folder:GetDescendants()) do
			if light:IsA("PointLight") or light:IsA("SurfaceLight") then
				TweenService:Create(light, TweenInfo.new(1), {Brightness = 0}):Play()
			end
		end
		task.delay(1.5, function()
			local start = os.clock()
			while svc.State.lightingMode == "Scare" and (os.clock() - start) < 5 do
				for _, light in ipairs(folder:GetDescendants()) do
					if light:IsA("PointLight") then light.Enabled = not light.Enabled end
				end
				task.wait(0.08)
			end
		end)
	else
		for _, light in ipairs(folder:GetDescendants()) do
			if light:IsA("PointLight") or light:IsA("SurfaceLight") then
				TweenService:Create(light, TweenInfo.new(2), {Brightness = 2}):Play()
			end
		end
	end
end

-- [[ THE LINEUP BOARD ]]
local function updateLineupBoard(svc)
	local folder = svc.State.lobbyFolder
	local board = folder:FindFirstChild("LineupBoard")
	if not board then return end
	
	local gui = board:FindFirstChild("SurfaceGui")
	if not gui then return end
	
	local listFrame = gui:FindFirstChild("List")
	listFrame:ClearAllChildren()
	
	local count = 0
	for player, info in pairs(svc.State.lineup) do
		count = count + 1
		local lbl = Instance.new("TextLabel")
		lbl.Size = UDim2.new(1, -20, 0, 30)
		lbl.Position = UDim2.new(0, 10, 0, (count-1) * 35)
		lbl.Text = "• " .. player.Name .. " [" .. info.status .. "]"
		lbl.TextColor3 = Color3.fromRGB(255, 255, 255)
		lbl.TextXAlignment = Enum.TextXAlignment.Left
		lbl.BackgroundTransparency = 1
		lbl.Font = Enum.Font.Gotham
		lbl.TextSize = 20
		lbl.Parent = listFrame
	end
	
	local countLbl = gui:FindFirstChild("Count")
	countLbl.Text = "PLAYERS: " .. count .. " / 20"
end

-- [[ GEOMETRY MANIFESTATION ]]
local function buildTheLookout(svc)
	local folder = Instance.new("Folder")
	folder.Name   = "TheLookout_SocialHub"
	folder.Parent = Workspace
	svc.State.lobbyFolder = folder

	-- Floor & Ceiling
	mk(folder, Vector3.new(LOBBY_SIZE.X, 1, LOBBY_SIZE.Z), LOBBY_CF * CFrame.new(0, -LOBBY_SIZE.Y/2, 0))
	mk(folder, Vector3.new(LOBBY_SIZE.X, 1, LOBBY_SIZE.Z), LOBBY_CF * CFrame.new(0, LOBBY_SIZE.Y/2, 0))
	
	-- Walls
	mk(folder, Vector3.new(1, LOBBY_SIZE.Y, LOBBY_SIZE.Z), LOBBY_CF * CFrame.new(-LOBBY_SIZE.X/2, 0, 0))
	mk(folder, Vector3.new(1, LOBBY_SIZE.Y, LOBBY_SIZE.Z), LOBBY_CF * CFrame.new(LOBBY_SIZE.X/2, 0, 0))
	mk(folder, Vector3.new(LOBBY_SIZE.X, LOBBY_SIZE.Y, 1), LOBBY_CF * CFrame.new(0, 0, -LOBBY_SIZE.Z/2))

	-- THE TACTICAL WINDOW (Viewport)
	mk(folder, Vector3.new(LOBBY_SIZE.X, LOBBY_SIZE.Y, 0.5), WINDOW_CF, Color3.fromRGB(0, 150, 255), Enum.Material.ForceField, 0.8)

	-- THE LINEUP BOARD
	local board = mk(folder, Vector3.new(30, 20, 0.5), LOBBY_CF * CFrame.new(0, 0, -LOBBY_SIZE.Z/2 + 0.6), Color3.fromRGB(20, 20, 25))
	board.Name = "LineupBoard"
	local sg = Instance.new("SurfaceGui", board)
	sg.Face = Enum.NormalId.Front
	sg.CanvasSize = Vector2.new(600, 400)
	
	local title = Instance.new("TextLabel", sg)
	title.Size = UDim2.new(1, 0, 0, 60); title.Text = "THE LINEUP"; title.TextSize = 40
	title.Font = Enum.Font.GothamBold; title.TextColor3 = Color3.fromRGB(0, 200, 255); title.BackgroundTransparency = 1
	
	local count = Instance.new("TextLabel", sg)
	count.Name = "Count"; count.Size = UDim2.new(1, 0, 0, 40); count.Position = UDim2.new(0, 0, 0, 60)
	count.Text = "PLAYERS: 0 / 20"; count.TextColor3 = Color3.fromRGB(200, 200, 200); count.BackgroundTransparency = 1
	
	local list = Instance.new("Frame", sg)
	list.Name = "List"; list.Size = UDim2.new(1, -40, 1, -120); list.Position = UDim2.new(0, 20, 0, 110); list.BackgroundTransparency = 1

	-- PLAY NOW BUTTON
	local btn = mk(folder, Vector3.new(6, 6, 1), LOBBY_CF * CFrame.new(0, -5, -LOBBY_SIZE.Z/2 + 1), Color3.fromRGB(0, 255, 100), Enum.Material.Neon)
	local pp = Instance.new("ProximityPrompt", btn)
	pp.ActionText = "Hop In!"; pp.ObjectText = "Play Now"
	pp.Triggered:Connect(function(player)
		if svc.State.gameActive then return end
		if svc.State.lineup[player] then return end
		svc.Bridges.AskChoice:FireClient(player)
	end)

	-- STADIUM SEATING
	for row = 1, 4 do
		for col = 1, 5 do
			local x, z, y = (col-3)*12, (row-1)*8+10, (row-1)*3-10
			local seat = Instance.new("Seat")
			seat.Size = Vector3.new(4, 1, 4); seat.CFrame = LOBBY_CF * CFrame.new(x, y, z)
			seat.Color = Color3.fromRGB(30, 30, 35); seat.Anchored = true; seat.Parent = folder
			table.insert(svc.State.seats, { seat = seat, occupant = nil })
		end
	end

	-- LIGHTING
	local l = Instance.new("PointLight", folder)
	l.Brightness = 2; l.Range = 100; l.Parent = mk(folder, Vector3.new(1,1,1), LOBBY_CF * CFrame.new(0, 10, 0), nil, nil, 1)
end

-- [[ LOGIC ]]
local function runLaunchSequence(svc)
	svc.State.gameActive = true
	setLightingMode(svc, "Scare")
	for i = 5, 0, -1 do svc.Bridges.Countdown:FireAllClients(i); task.wait(1) end

	local count = 0
	for player, info in pairs(svc.State.lineup) do
		count = count + 1
		local char = player.Character
		if char then
			local hrp = char:FindFirstChild("HumanoidRootPart")
			local hum = char:FindFirstChildOfClass("Humanoid")
			if hum then hum.Sit = false end
			local angle = (count / 20) * (math.pi * 2)
			if hrp then hrp.AssemblyLinearVelocity = Vector3.new(math.cos(angle)*80, 120, math.sin(angle)*80) end
			svc.Bridges.Launched:FireClient(player)
		end
	end

	task.wait(2)
	setLightingMode(svc, "Social")
	svc.State.lineup = {}
	for _, s in ipairs(svc.State.seats) do s.occupant = nil end
	updateLineupBoard(svc)
	if svc.GameBeginEvent then svc.GameBeginEvent:Fire() end
	svc.State.gameActive = false
end

-- [[ LIFECYCLE ]]
function LobbyService:Init()
	local be = Instance.new("BindableEvent")
	be.Name   = "OMC_Lobby_GameBegin"
	be.Parent = ServerScriptService
	self.GameBeginEvent = be
	print("🏮 [LOBBY] The Lookout Initialized.")
end

function LobbyService:Start()
	buildTheLookout(self)
	local function re(name)
		local r = ReplicatedStorage:FindFirstChild(name) or Instance.new("RemoteEvent")
		r.Name = name; r.Parent = ReplicatedStorage; return r
	end
	self.Bridges.Countdown = re("OMC_Lobby_Countdown")
	self.Bridges.Launched  = re("OMC_Lobby_Launched")
	self.Bridges.AskChoice = re("OMC_Lobby_AskChoice")
	self.Bridges.ChoiceResponse = re("OMC_Lobby_ChoiceResponse")

	self.Bridges.ChoiceResponse.OnServerEvent:Connect(function(player, choice)
		if self.State.gameActive then return end
		if self.State.lineup[player] then return end
		local info = { status = choice }
		if choice == "Chair" then
			local free = nil
			for _, s in ipairs(self.State.seats) do if not s.occupant then free = s; break end end
			if free and player.Character then
				local hum = player.Character:FindFirstChildOfClass("Humanoid")
				if hum then free.seat:Sit(hum); free.occupant = player end
			else info.status = "Chill" end
		end
		self.State.lineup[player] = info
		updateLineupBoard(self)
	end)

	Players.PlayerAdded:Connect(function(player)
		-- task.wait(10) -- Testing trigger disabled to prevent auto-launch
	end)
end

return LobbyService
