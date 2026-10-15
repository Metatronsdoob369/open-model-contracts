-- LobbyController.luau
-- Handles join GUI, first-person camera lock, in-seat HUD, countdown, and glide

local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService        = game:GetService("RunService")

local player = Players.LocalPlayer
local camera = workspace.CurrentCamera

local LobbyController = {
	Name  = "LobbyController",
	State = {
		seated       = false,
		isHost       = false,
		gliding      = false,
		glideConn    = nil,
		camConn      = nil,
		inSeatUI     = nil,
		countdownGui = nil,
	},
}

local GLIDE_LIFT_MULTIPLIER = 0.9
local GLIDE_MAX_FALL_SPEED = 34
local GLIDE_STEER_POWER = 3.0
local GLIDE_MAX_HORIZONTAL_SPEED = 120

-- ── UI helpers ────────────────────────────────────────────────────────────────
local function clearUI(state, key)
	if state[key] then state[key]:Destroy(); state[key] = nil end
end

local function makeBtn(parent, text, pos, size, col, strokeCol)
	local btn = Instance.new("TextButton")
	btn.Size              = size or UDim2.new(0, 160, 0, 44)
	btn.Position          = pos
	btn.AnchorPoint       = Vector2.new(0.5, 0.5)
	btn.Text              = text
	btn.TextSize          = 18
	btn.Font              = Enum.Font.GothamBold
	btn.TextColor3        = Color3.fromRGB(255, 255, 255)
	btn.BackgroundColor3  = col or Color3.fromRGB(30, 30, 40)
	btn.BackgroundTransparency = 0.15
	btn.Parent            = parent
	Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 8)
	local stroke = Instance.new("UIStroke", btn)
	stroke.Color = strokeCol or Color3.fromRGB(0, 200, 255)
	return btn
end

-- ── Join confirmation GUI ─────────────────────────────────────────────────────
local function showJoinPrompt(seatIndex)
	local pg = player:FindFirstChild("PlayerGui")
	if not pg then return end

	-- Remove any existing join prompt
	local old = pg:FindFirstChild("Sovereign_LobbyJoin")
	if old then old:Destroy() end

	local sg = Instance.new("ScreenGui")
	sg.Name         = "Sovereign_LobbyJoin"
	sg.ResetOnSpawn = false
	sg.Parent       = pg

	local panel = Instance.new("Frame")
	panel.Size               = UDim2.new(0, 300, 0, 160)
	panel.Position           = UDim2.new(0.5, 0, 0.5, 0)
	panel.AnchorPoint        = Vector2.new(0.5, 0.5)
	panel.BackgroundColor3   = Color3.fromRGB(10, 12, 20)
	panel.BackgroundTransparency = 0.1
	panel.Parent             = sg
	Instance.new("UICorner", panel).CornerRadius = UDim.new(0, 12)
	local stroke = Instance.new("UIStroke", panel)
	stroke.Color     = Color3.fromRGB(0, 200, 255)
	stroke.Thickness = 2

	local title = Instance.new("TextLabel")
	title.Size                = UDim2.new(1, 0, 0, 50)
	title.Position            = UDim2.new(0, 0, 0, 14)
	title.BackgroundTransparency = 1
	title.Text                = "Join this seat?"
	title.TextSize            = 22
	title.Font                = Enum.Font.GothamBold
	title.TextColor3          = Color3.fromRGB(220, 220, 255)
	title.Parent              = panel

	local yes = makeBtn(panel, "Yes — Join",
		UDim2.new(0.28, 0, 0.72, 0), UDim2.new(0, 120, 0, 40),
		Color3.fromRGB(20, 90, 20), Color3.fromRGB(50, 200, 80))

	local no = makeBtn(panel, "No",
		UDim2.new(0.72, 0, 0.72, 0), UDim2.new(0, 100, 0, 40),
		Color3.fromRGB(80, 20, 20), Color3.fromRGB(200, 50, 50))

	yes.MouseButton1Click:Connect(function()
		sg:Destroy()
		ReplicatedStorage:WaitForChild("OMC_Lobby_JoinResponse"):FireServer(seatIndex, true)
	end)
	no.MouseButton1Click:Connect(function()
		sg:Destroy()
		ReplicatedStorage:WaitForChild("OMC_Lobby_JoinResponse"):FireServer(seatIndex, false)
	end)
end

-- ── In-seat HUD ───────────────────────────────────────────────────────────────
local function showSeatHUD(state, isHost)
	local pg = player:FindFirstChild("PlayerGui")
	if not pg then return end
	clearUI(state, "inSeatUI")

	local sg = Instance.new("ScreenGui")
	sg.Name         = "Sovereign_LobbyHUD"
	sg.ResetOnSpawn = false
	sg.Parent       = pg
	state.inSeatUI  = sg

	-- Exit button (bottom center)
	local exitBtn = makeBtn(sg, "Exit Lobby",
		UDim2.new(0.5, 0, 0.95, 0), UDim2.new(0, 140, 0, 40),
		Color3.fromRGB(80, 20, 20), Color3.fromRGB(200, 50, 50))
	exitBtn.AnchorPoint = Vector2.new(0.5, 1)
	exitBtn.MouseButton1Click:Connect(function()
		ReplicatedStorage:WaitForChild("OMC_Lobby_ExitSeat"):FireServer()
	end)

	-- Start Game button (host only, just above Exit)
	if isHost then
		local startBtn = makeBtn(sg, "Start Game",
			UDim2.new(0.5, 0, 0.87, 0), UDim2.new(0, 170, 0, 46),
			Color3.fromRGB(20, 110, 20), Color3.fromRGB(50, 255, 100))
		startBtn.AnchorPoint = Vector2.new(0.5, 1)
		startBtn.TextSize = 20
		startBtn.MouseButton1Click:Connect(function()
			ReplicatedStorage:WaitForChild("OMC_Lobby_StartGame"):FireServer()
		end)
	end
end

-- ── Camera first-person lock ──────────────────────────────────────────────────
local function lockFirstPerson(state)
	camera.CameraType = Enum.CameraType.Scriptable
	if state.camConn then state.camConn:Disconnect() end
	state.camConn = RunService.RenderStepped:Connect(function()
		local char = player.Character
		if not char then return end
		local head = char:FindFirstChild("Head")
		if head then camera.CFrame = head.CFrame end
	end)
end

local function unlockCamera(state)
	if state.camConn then state.camConn:Disconnect(); state.camConn = nil end
	camera.CameraType = Enum.CameraType.Custom
end

-- ── Countdown display ─────────────────────────────────────────────────────────
local function showCountdown(state, n)
	local pg = player:FindFirstChild("PlayerGui")
	if not pg then return end

	if not state.countdownGui then
		local sg = Instance.new("ScreenGui")
		sg.Name         = "Sovereign_Countdown"
		sg.ResetOnSpawn = false
		sg.Parent       = pg
		state.countdownGui = sg

		local lbl = Instance.new("TextLabel")
		lbl.Name                    = "Number"
		lbl.Size                    = UDim2.new(0, 200, 0, 200)
		lbl.Position                = UDim2.new(0.5, -100, 0.25, 0)
		lbl.BackgroundTransparency  = 1
		lbl.Font                    = Enum.Font.GothamBold
		lbl.TextSize                = 120
		lbl.TextColor3              = Color3.fromRGB(255, 220, 50)
		lbl.TextStrokeTransparency  = 0.3
		lbl.Parent                  = sg
	end

	local lbl = state.countdownGui:FindFirstChild("Number")
	if lbl then lbl.Text = n > 0 and tostring(n) or "GO!" end

	if n == 0 then
		task.delay(1, function() clearUI(state, "countdownGui") end)
	end
end

-- ── Glide mode ────────────────────────────────────────────────────────────────
local function enableGlide(state)
	state.gliding = true
	unlockCamera(state)

	local char = player.Character
	if not char then return end
	local hrp = char:FindFirstChild("HumanoidRootPart")
	local hum = char:FindFirstChildOfClass("Humanoid")
	if not hrp or not hum then return end

	-- Counter ~82% of gravity so player falls slowly
	local bf = Instance.new("BodyForce")
	bf.Name  = "GlideForce"
	bf.Force = Vector3.new(0, workspace.Gravity * hrp.AssemblyMass * GLIDE_LIFT_MULTIPLIER, 0)
	bf.Parent = hrp

	hum.WalkSpeed = 0  -- no ground movement while airborne

	if state.glideConn then state.glideConn:Disconnect() end
	state.glideConn = RunService.Heartbeat:Connect(function()
		if not state.gliding then return end
		local c = player.Character
		if not c then return end
		local r = c:FindFirstChild("HumanoidRootPart")
		if not r then return end

		-- Land detection
		if r.Position.Y < 12 then
			state.gliding = false
			local gf = r:FindFirstChild("GlideForce")
			if gf then gf:Destroy() end
			local h = c:FindFirstChildOfClass("Humanoid")
			if h then h.WalkSpeed = 32 end
			if state.glideConn then state.glideConn:Disconnect(); state.glideConn = nil end
			return
		end

		-- Platform-friendly steering: uses Humanoid.MoveDirection so touch controls,
		-- gamepad, and keyboard all drive glide movement without letter-key checks.
		local h = c:FindFirstChildOfClass("Humanoid")
		local moveDir = (h and h.MoveDirection) or Vector3.zero
		local impulse = Vector3.new(moveDir.X, 0, moveDir.Z) * GLIDE_STEER_POWER

		local vel  = r.AssemblyLinearVelocity
		-- Preserve catapult momentum; do not heavily damp horizontal speed.
		local baseHorizontal = Vector3.new(vel.X, 0, vel.Z) * 0.998
		local hVel = baseHorizontal + impulse
		if hVel.Magnitude > GLIDE_MAX_HORIZONTAL_SPEED then
			hVel = hVel.Unit * GLIDE_MAX_HORIZONTAL_SPEED
		end

		local yVel = vel.Y
		if yVel < -GLIDE_MAX_FALL_SPEED then
			yVel = -GLIDE_MAX_FALL_SPEED
		end

		r.AssemblyLinearVelocity = Vector3.new(hVel.X, yVel, hVel.Z)
	end)
end

-- ── Controller lifecycle ──────────────────────────────────────────────────────
function LobbyController:Init()
	print("[LOBBY-CLIENT] Initialized.")
end

function LobbyController:Start()
	local RS = ReplicatedStorage

	RS:WaitForChild("OMC_Lobby_AskJoin").OnClientEvent:Connect(function(seatIndex)
		showJoinPrompt(seatIndex)
	end)

	-- Teleport onto the seat; Roblox native seat contact triggers the sit animation
	RS:WaitForChild("OMC_Lobby_DoSit").OnClientEvent:Connect(function(seat)
		local char = player.Character
		if not char then return end
		local hrp = char:FindFirstChild("HumanoidRootPart")
		if not hrp then return end
		hrp.CFrame = seat.CFrame * CFrame.new(0, 2, 0)
	end)

	RS:WaitForChild("OMC_Lobby_Seated").OnClientEvent:Connect(function(isHost)
		if self.State.seated then return end  -- already handled by Attribute signal
		self.State.seated = true
		self.State.isHost = isHost
		local pg = player:FindFirstChild("PlayerGui")
		if pg then
			local old = pg:FindFirstChild("Sovereign_LobbyJoin")
			if old then old:Destroy() end
		end
		lockFirstPerson(self.State)
		showSeatHUD(self.State, isHost)
	end)

	player:GetAttributeChangedSignal("OMC_LobbySeated"):Connect(function()
		local seated = player:GetAttribute("OMC_LobbySeated")
		local isHost = player:GetAttribute("OMC_LobbyIsHost") == true
		if seated then
			if self.State.seated then return end
			self.State.seated = true
			self.State.isHost = isHost
			local pg = player:FindFirstChild("PlayerGui")
			if pg then
				local old = pg:FindFirstChild("Sovereign_LobbyJoin")
				if old then old:Destroy() end
			end
			lockFirstPerson(self.State)
			showSeatHUD(self.State, isHost)
		else
			self.State.seated = false
			self.State.isHost = false
			unlockCamera(self.State)
			clearUI(self.State, "inSeatUI")
		end
	end)

	RS:WaitForChild("OMC_Lobby_Unseated").OnClientEvent:Connect(function()
		self.State.seated = false
		self.State.isHost = false
		unlockCamera(self.State)
		clearUI(self.State, "inSeatUI")
		local char = player.Character
		if char then
			local hum = char:FindFirstChildOfClass("Humanoid")
			if hum then hum.Sit = false end
		end
	end)

	RS:WaitForChild("OMC_Lobby_Countdown").OnClientEvent:Connect(function(n)
		showCountdown(self.State, n)
	end)

	RS:WaitForChild("OMC_Lobby_Launched").OnClientEvent:Connect(function(launchCF, launchVelocity)
		clearUI(self.State, "inSeatUI")
		self.State.seated = false

		-- Deterministic local ejection so launch is visible even if seat replication lags.
		unlockCamera(self.State)
		local char = player.Character
		local hum = char and char:FindFirstChildOfClass("Humanoid")
		local hrp = char and char:FindFirstChild("HumanoidRootPart")
		local seatWeld = char and char:FindFirstChild("SeatWeld", true)
		if seatWeld and seatWeld:IsA("Weld") then
			seatWeld:Destroy()
		end
		if hum then
			hum.Sit = false
			hum:ChangeState(Enum.HumanoidStateType.Jumping)
			hum:ChangeState(Enum.HumanoidStateType.Freefall)
		end
		if hrp then
			if typeof(launchCF) == "CFrame" then
				hrp.CFrame = launchCF
			end
			if typeof(launchVelocity) == "Vector3" then
				hrp.AssemblyLinearVelocity = launchVelocity
			end
		end

		enableGlide(self.State)
	end)
end

return LobbyController
