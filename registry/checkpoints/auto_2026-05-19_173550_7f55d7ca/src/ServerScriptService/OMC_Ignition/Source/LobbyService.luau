-- LobbyService.luau
-- Corner lobby above boundary wall: stone room, 20 stadium seats, catapult launch

local Players             = game:GetService("Players")
local ReplicatedStorage   = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Workspace           = game:GetService("Workspace")

local LobbyService = {
	Name  = "LobbyService",
	State = {
		seats             = {},
		joinQueue         = {},
		hostPlayer        = nil,
		gameActive        = false,
		lobbyCF           = nil,
		startButton       = nil,
		startButtonPrompt = nil,
	},
	Bridges        = {},
	GameBeginEvent = nil,
	RoundEndEvent  = nil,
}

-- ── Part factory ──────────────────────────────────────────────────────────────
local function mk(parent, size, cf, color, mat, canCollide)
	local p = Instance.new("Part")
	p.Size       = size
	p.CFrame     = cf
	p.Color      = color or Color3.fromRGB(120, 110, 100)
	p.Material   = mat or Enum.Material.Slate
	p.Anchored   = true
	p.CanCollide = canCollide ~= false
	p.Parent     = parent
	return p
end

-- ── Constants ─────────────────────────────────────────────────────────────────
local LOBBY_W        = 80
local LOBBY_D        = 60
local LOBBY_H        = 20
local LOBBY_Y_OFFSET = 8   -- studs above boundary wall top
local STONE_COL      = Color3.fromRGB(120, 110, 100)
local STONE_MAT      = Enum.Material.Slate

local SEAT_ROWS = {
	{ z = -20, y = 1.5 },
	{ z = -15, y = 3.5 },
	{ z = -10, y = 5.5 },
	{ z =  -5, y = 7.5 },
	{ z =   0, y = 9.5 },
}
local SEAT_COLS  = { -9, -3, 3, 9 }
local SEAT_COLOR = Color3.fromRGB(80, 75, 70)

-- Catapult tuning (mobile-friendly traversal to reach hiding areas)
local LAUNCH_ORIGIN_Y = 230
local LAUNCH_RING_RADIUS = 26
local LAUNCH_HORIZONTAL_SPEED = 175
local LAUNCH_VERTICAL_SPEED = 210

-- ── Compute bounds for any container (Model or Folder) ───────────────────────
local function getContainerBounds(container)
	if container:IsA("Model") then
		local ok, cf, sz = pcall(function() return container:GetBoundingBox() end)
		if ok and cf then return cf, sz end
	end
	-- Manual AABB for Folder or fallback
	local minX, minY, minZ =  math.huge,  math.huge,  math.huge
	local maxX, maxY, maxZ = -math.huge, -math.huge, -math.huge
	local found = false
	for _, desc in ipairs(container:GetDescendants()) do
		if desc:IsA("BasePart") then
			found = true
			local p, h = desc.Position, desc.Size * 0.5
			minX = math.min(minX, p.X - h.X); maxX = math.max(maxX, p.X + h.X)
			minY = math.min(minY, p.Y - h.Y); maxY = math.max(maxY, p.Y + h.Y)
			minZ = math.min(minZ, p.Z - h.Z); maxZ = math.max(maxZ, p.Z + h.Z)
		end
	end
	if not found then return nil end
	return CFrame.new((minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2),
	       Vector3.new(maxX-minX,    maxY-minY,    maxZ-minZ)
end

-- ── Compute lobby CFrame from boundary wall corner ────────────────────────────
local function computeLobbyCF()
	local wallTopY, cornerX, cornerZ

	local walls = Workspace:FindFirstChild("BoundaryWalls")
	if walls then
		local cf, sz = getContainerBounds(walls)
		if cf then
			wallTopY = cf.Position.Y + sz.Y / 2
			cornerX  = cf.Position.X + sz.X / 2 + 2
			cornerZ  = cf.Position.Z + sz.Z / 2 + 2
		else
			warn("[LOBBY] BoundaryWalls has no BaseParts — check Rojo sync")
		end
	else
		warn("[LOBBY] BoundaryWalls not found in Workspace")
	end

	if not wallTopY then
		warn("[LOBBY] Falling back to hardcoded corner (202, 40, 202)")
		wallTopY, cornerX, cornerZ = 40, 202, 202
	end

	local floorY = wallTopY + LOBBY_Y_OFFSET
	local origin = Vector3.new(cornerX, floorY, cornerZ)
	return CFrame.new(origin, Vector3.new(0, floorY, 0))
end

-- ── Build lobby geometry ──────────────────────────────────────────────────────
local function buildLobby(folder, lobbyCF)
	mk(folder, Vector3.new(LOBBY_W, 1,       LOBBY_D), lobbyCF * CFrame.new(0,            0,            0),           STONE_COL, STONE_MAT) -- floor
	mk(folder, Vector3.new(LOBBY_W, 1,       LOBBY_D), lobbyCF * CFrame.new(0,            LOBBY_H,      0),           STONE_COL, STONE_MAT) -- ceiling
	mk(folder, Vector3.new(1,       LOBBY_H, LOBBY_D), lobbyCF * CFrame.new(-LOBBY_W/2,   LOBBY_H/2,    0),           STONE_COL, STONE_MAT) -- left wall
	mk(folder, Vector3.new(1,       LOBBY_H, LOBBY_D), lobbyCF * CFrame.new( LOBBY_W/2,   LOBBY_H/2,    0),           STONE_COL, STONE_MAT) -- right wall
	mk(folder, Vector3.new(LOBBY_W, LOBBY_H, 1),       lobbyCF * CFrame.new(0,            LOBBY_H/2,    LOBBY_D/2),   STONE_COL, STONE_MAT) -- back wall
	-- Front wall omitted — open bird's-eye view toward map centre
end

-- ── Lobby ceiling lights ──────────────────────────────────────────────────────
local function buildLighting(folder, lobbyCF)
	local coords = {
		{ -20, LOBBY_H - 0.6, -15 },
		{  20, LOBBY_H - 0.6, -15 },
		{   0, LOBBY_H - 0.6,   0 },
		{ -20, LOBBY_H - 0.6,  15 },
		{  20, LOBBY_H - 0.6,  15 },
	}
	for _, c in ipairs(coords) do
		local lamp = mk(folder, Vector3.new(2, 1, 2),
			lobbyCF * CFrame.new(c[1], c[2], c[3]),
			Color3.fromRGB(255, 235, 170), Enum.Material.Neon, false)
		local pl = Instance.new("PointLight")
		pl.Brightness = 1.5
		pl.Range      = 28
		pl.Color      = Color3.fromRGB(255, 235, 170)
		pl.Parent     = lamp
	end
end

-- ── Build stadium seating ─────────────────────────────────────────────────────
local function buildSeating(folder, state, lobbyCF)
	local index = 0
	for _, row in ipairs(SEAT_ROWS) do
		for _, cx in ipairs(SEAT_COLS) do
			index += 1

			local seat = Instance.new("Seat")
			seat.Size     = Vector3.new(2, 0.5, 2)
			seat.CFrame   = lobbyCF * CFrame.new(cx, row.y, row.z)
			seat.Color    = SEAT_COLOR
			seat.Material = Enum.Material.Slate
			seat.Anchored = true
			seat.Parent   = folder

			-- Seat back panel (+local Z = behind the seat, away from open face)
			mk(folder, Vector3.new(2, 2, 0.3),
				lobbyCF * CFrame.new(cx, row.y + 1.25, row.z + 1.15),
				SEAT_COLOR, Enum.Material.Slate)

			local pp = Instance.new("ProximityPrompt")
			pp.ActionText            = "Join Game"
			pp.ObjectText            = "Seat " .. index
			pp.MaxActivationDistance = 8
			pp.HoldDuration          = 0
			pp.RequiresLineOfSight   = false
			pp.ClickablePrompt       = true
			pp.KeyboardKeyCode       = Enum.KeyCode.Space
			pp.GamepadKeyCode        = Enum.KeyCode.ButtonX
			pp.Parent                = seat

			table.insert(state.seats, {
				seat     = seat,
				prompt   = pp,
				origCF   = seat.CFrame,
				index    = index,
				occupant = nil,
			})
		end
	end
end

-- ── Build start button ────────────────────────────────────────────────────────
local function buildStartButton(folder, state, lobbyCF)
	local btn = mk(folder, Vector3.new(4, 4, 0.5),
		lobbyCF * CFrame.new(0, 5, LOBBY_D/2 - 3),
		Color3.fromRGB(50, 200, 50), Enum.Material.Neon)

	local pl = Instance.new("PointLight")
	pl.Brightness = 2; pl.Range = 15
	pl.Color  = Color3.fromRGB(50, 200, 50)
	pl.Parent = btn

	local pp = Instance.new("ProximityPrompt")
	pp.ActionText            = "Start Game"
	pp.ObjectText            = "Launch Catapult"
	pp.MaxActivationDistance = 15
	pp.RequiresLineOfSight   = false
	pp.ClickablePrompt       = true
	pp.KeyboardKeyCode       = Enum.KeyCode.Space
	pp.GamepadKeyCode        = Enum.KeyCode.ButtonX
	pp.Parent                = btn

	state.startButton       = btn
	state.startButtonPrompt = pp
end

-- ── Seat helpers ──────────────────────────────────────────────────────────────
local function findFreeSeat(state)
	for _, s in ipairs(state.seats) do
		if not s.occupant then return s end
	end
end

local function findSeatForPlayer(state, player)
	for _, s in ipairs(state.seats) do
		if s.occupant == player then return s end
	end
end

local function removeFromQueue(state, player)
	for i = #state.joinQueue, 1, -1 do
		if state.joinQueue[i] == player then
			table.remove(state.joinQueue, i)
			return
		end
	end
end

local function sitPlayer(svc, entry, player)
	if not player.Character then return end

	entry.occupant       = player
	entry.prompt.Enabled = false
	print(string.format("[LOBBY] %s seated at seat %d", player.Name, entry.index))

	table.insert(svc.State.joinQueue, player)

	local isHost = (svc.State.hostPlayer == player)
	if not svc.State.hostPlayer then
		svc.State.hostPlayer = player
		isHost = true
	end

	player:SetAttribute("OMC_LobbySeated", true)
	player:SetAttribute("OMC_LobbyIsHost", isHost)
	-- Client handles physical seating (server-side seat:Sit fights client network ownership)
	svc.Bridges.DoSit:FireClient(player, entry.seat)
	svc.Bridges.Seated:FireClient(player, isHost)
end

local function unseatPlayer(svc, player)
	local s = findSeatForPlayer(svc.State, player)
	if not s then return end

	local char = player.Character
	if char then
		local hum = char:FindFirstChildOfClass("Humanoid")
		if hum then hum.Sit = false end
	end

	s.occupant       = nil
	s.prompt.Enabled = not svc.State.gameActive

	local wasHost = (svc.State.hostPlayer == player)
	removeFromQueue(svc.State, player)

	if wasHost then
		svc.State.hostPlayer = svc.State.joinQueue[1]
		if svc.State.hostPlayer then
			svc.Bridges.Seated:FireClient(svc.State.hostPlayer, true)
		end
	end

	player:SetAttribute("OMC_LobbySeated", false)
	player:SetAttribute("OMC_LobbyIsHost", false)
	svc.Bridges.Unseated:FireClient(player)
end

-- ── Launch sequence ───────────────────────────────────────────────────────────
local function runLaunch(svc)
	svc.State.gameActive                  = true
	svc.State.startButtonPrompt.Enabled   = false
	for _, s in ipairs(svc.State.seats) do s.prompt.Enabled = false end

	-- Countdown 5 → 0
	for i = 5, 0, -1 do
		svc.Bridges.Countdown:FireAllClients(i)
		task.wait(1)
	end

	-- Record seated players + their spread angle before tweening
	local launchList = {}
	local launchedUserIds = {}
	for i, s in ipairs(svc.State.seats) do
		if s.occupant then
			table.insert(launchList, {
				player = s.occupant,
				angle  = ((i - 1) / 20) * math.pi * 2,
				seat   = s,
			})
			table.insert(launchedUserIds, s.occupant.UserId)
		end
	end

	-- Bypass seat physics entirely: deterministic sky airdrop launch.
	local launchOrigin = Vector3.new(0, LAUNCH_ORIGIN_Y, 0)

	-- Eject players and apply launch velocity from stable sky origin.
	for _, entry in ipairs(launchList) do
		local char = entry.player.Character
		-- Force-clear lobby seated state before flight so client camera/UI unlocks.
		entry.player:SetAttribute("OMC_LobbySeated", false)
		entry.player:SetAttribute("OMC_LobbyIsHost", false)
		svc.Bridges.Unseated:FireClient(entry.player)
		if entry.seat and entry.seat.seat then entry.seat.seat.Disabled = true end

		if char then
			local hum = char:FindFirstChildOfClass("Humanoid")
			local hrp = char:FindFirstChild("HumanoidRootPart")
			local seatWeld = char:FindFirstChild("SeatWeld", true)
			if seatWeld and seatWeld:IsA("Weld") then
				seatWeld:Destroy()
			end
			if hum then
				hum.Sit = false
				hum:ChangeState(Enum.HumanoidStateType.Jumping)
				hum:ChangeState(Enum.HumanoidStateType.Freefall)
			end
			if hrp then
				local launchOffset = Vector3.new(math.cos(entry.angle) * LAUNCH_RING_RADIUS, 0, math.sin(entry.angle) * LAUNCH_RING_RADIUS)
				local launchCF = CFrame.new(launchOrigin + launchOffset)
				local launchVelocity = Vector3.new(
					math.cos(entry.angle) * LAUNCH_HORIZONTAL_SPEED,
					LAUNCH_VERTICAL_SPEED,
					math.sin(entry.angle) * LAUNCH_HORIZONTAL_SPEED
				)

				hrp.CFrame = launchCF
				pcall(function() hrp:SetNetworkOwner(nil) end)
				hrp.AssemblyLinearVelocity = launchVelocity
				hrp:ApplyImpulse(launchVelocity * hrp.AssemblyMass * 0.55)
				print(string.format("[LOBBY] Ejected %s from seat %d @ pos (%.1f, %.1f, %.1f) vel (%.1f, %.1f, %.1f)", entry.player.Name, entry.seat.index, hrp.Position.X, hrp.Position.Y, hrp.Position.Z, hrp.AssemblyLinearVelocity.X, hrp.AssemblyLinearVelocity.Y, hrp.AssemblyLinearVelocity.Z))
				svc.Bridges.Launched:FireClient(entry.player, launchCF, launchVelocity)
			else
				svc.Bridges.Launched:FireClient(entry.player)
			end
		else
			svc.Bridges.Launched:FireClient(entry.player)
		end
	end

	task.wait(0.35)

	-- Reset seats to original positions
	for _, s in ipairs(svc.State.seats) do
		s.seat.CFrame = s.origCF
		s.seat.Disabled = false
		if s.occupant then
			s.occupant:SetAttribute("OMC_LobbySeated", false)
			s.occupant:SetAttribute("OMC_LobbyIsHost", false)
		end
		s.occupant = nil
	end

	-- Signal game services to begin
	if svc.GameBeginEvent then
		svc.GameBeginEvent:Fire(launchedUserIds)
	end
end

local function resetLobbyAfterRound(svc)
	svc.State.gameActive = false
	svc.State.hostPlayer = nil
	svc.State.joinQueue = {}
	if svc.State.startButtonPrompt then
		svc.State.startButtonPrompt.Enabled = true
	end
	for _, s in ipairs(svc.State.seats) do
		s.prompt.Enabled = true
		s.occupant = nil
	end
end

-- ── Wire all interactions ─────────────────────────────────────────────────────
local function wireAll(svc)
	-- Seat ProximityPrompts + native-seat detection
	for _, s in ipairs(svc.State.seats) do
		local entry = s
		entry.prompt.Triggered:Connect(function(player)
			if entry.occupant then return end
			if findSeatForPlayer(svc.State, player) then return end
			sitPlayer(svc, entry, player)
		end)
		entry.seat:GetPropertyChangedSignal("Occupant"):Connect(function()
			local hum = entry.seat.Occupant
			if hum then
				local p = Players:GetPlayerFromCharacter(hum.Parent)
				if p and not entry.occupant then
					-- Player walked in natively: sync server state
					entry.occupant = p
					entry.prompt.Enabled = false
					if not findSeatForPlayer(svc.State, p) then
						table.insert(svc.State.joinQueue, p)
					end
					if not svc.State.hostPlayer then
						svc.State.hostPlayer = p
					end
					local isHost = (svc.State.hostPlayer == p)
					p:SetAttribute("OMC_LobbySeated", true)
					p:SetAttribute("OMC_LobbyIsHost", isHost)
					svc.Bridges.Seated:FireClient(p, isHost)
				end
			else
				if svc.State.gameActive then return end  -- ignore during catapult
				if entry.occupant then
					unseatPlayer(svc, entry.occupant)
				end
			end
		end)
	end

	-- Start button — any player nearby can launch when ≥1 person is seated
	svc.State.startButtonPrompt.Triggered:Connect(function(player)
		if svc.State.gameActive then return end
		if #svc.State.joinQueue == 0 then return end
		if player ~= svc.State.hostPlayer then return end
		print(string.format("[LOBBY] %s triggered launch from world prompt.", player.Name))
		task.spawn(function() runLaunch(svc) end)
	end)

	-- Client confirms join
	svc.Bridges.JoinResponse.OnServerEvent:Connect(function(player, seatIndex, accepted)
		if not accepted then return end
		if findSeatForPlayer(svc.State, player) then return end
		local entry = svc.State.seats[seatIndex]
		if not entry or entry.occupant then return end
		sitPlayer(svc, entry, player)
	end)

	-- Client exits seat
	svc.Bridges.ExitSeat.OnServerEvent:Connect(function(player)
		unseatPlayer(svc, player)
	end)

	-- Host starts game
	svc.Bridges.StartGame.OnServerEvent:Connect(function(player)
		if player ~= svc.State.hostPlayer then return end
		if svc.State.gameActive then return end
		print(string.format("[LOBBY] %s triggered launch from HUD.", player.Name))
		task.spawn(function() runLaunch(svc) end)
	end)

	-- Clean up on disconnect
	Players.PlayerRemoving:Connect(function(player)
		if findSeatForPlayer(svc.State, player) then
			unseatPlayer(svc, player)
		end
	end)
end

-- ── Service lifecycle ─────────────────────────────────────────────────────────
function LobbyService:Init()
	local be = Instance.new("BindableEvent")
	be.Name   = "OMC_Lobby_GameBegin"
	be.Parent = ServerScriptService
	self.GameBeginEvent = be

	local roundEnd = Instance.new("BindableEvent")
	roundEnd.Name = "OMC_RoundEnded"
	roundEnd.Parent = ServerScriptService
	self.RoundEndEvent = roundEnd

	self.RoundEndEvent.Event:Connect(function()
		resetLobbyAfterRound(self)
	end)

	print("[LOBBY] Initialized.")
end

function LobbyService:Start()
	local lobbyCF = computeLobbyCF()
	self.State.lobbyCF = lobbyCF

	local folder = Instance.new("Folder")
	folder.Name   = "Sovereign_Lobby"
	folder.Parent = Workspace

	buildLobby(folder, lobbyCF)
	buildSeating(folder, self.State, lobbyCF)
	buildStartButton(folder, self.State, lobbyCF)
	buildLighting(folder, lobbyCF)

	-- Expose spawn pad so CharacterService teleports players into the corner lobby
	_G.LobbySpawnCF = lobbyCF * CFrame.new(0, 2, 20)

	local function re(name)
		local r = Instance.new("RemoteEvent")
		r.Name = name; r.Parent = ReplicatedStorage
		return r
	end
	self.Bridges.DoSit        = re("OMC_Lobby_DoSit")
	self.Bridges.AskJoin      = re("OMC_Lobby_AskJoin")
	self.Bridges.JoinResponse = re("OMC_Lobby_JoinResponse")
	self.Bridges.Seated       = re("OMC_Lobby_Seated")
	self.Bridges.ExitSeat     = re("OMC_Lobby_ExitSeat")
	self.Bridges.StartGame    = re("OMC_Lobby_StartGame")
	self.Bridges.Countdown    = re("OMC_Lobby_Countdown")
	self.Bridges.Launched     = re("OMC_Lobby_Launched")
	self.Bridges.Unseated     = re("OMC_Lobby_Unseated")

	wireAll(self)
	local p = lobbyCF.Position
	print(string.format("[LOBBY] Corner lobby at (%.0f, %.0f, %.0f) — 20 seats ready.", p.X, p.Y, p.Z))
end

return LobbyService
