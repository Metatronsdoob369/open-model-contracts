-- =============================================================================
-- JetpackThrowClient
-- Handles the thrown player's experience:
-- - Slight veer control via WASD while airborne
-- - If thrown player has a JETPACK in inventory, they can boost mid-flight
--   to increase collision speed for hawk kill
-- =============================================================================

local Players         = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService      = game:GetService("RunService")

local player = Players.LocalPlayer

-- Wait for remotes
local eventsFolder
repeat task.wait(0.3)
	local omc = ReplicatedStorage:FindFirstChild("OMC")
	eventsFolder = omc and omc:FindFirstChild("Events")
until eventsFolder

local ThrowOffer   = eventsFolder:WaitForChild("JetpackThrowOffer", 10)
local ThrowAccept  = eventsFolder:WaitForChild("JetpackThrowAccept", 10)
local ThrowExecute = eventsFolder:WaitForChild("JetpackThrowExecute", 10)
local InventoryUpdate = eventsFolder:WaitForChild("InventoryUpdate", 10)
local UseItem      = eventsFolder:WaitForChild("UseItem", 10)

-- Track local inventory
local localInventory = { nil, nil, nil }
if InventoryUpdate then
	InventoryUpdate.OnClientEvent:Connect(function(inv)
		localInventory = inv
	end)
end

local function hasJetpack()
	for _, item in ipairs(localInventory) do
		if item == "JETPACK" then return true end
	end
	return false
end

local function getJetpackSlot()
	for i, item in ipairs(localInventory) do
		if item == "JETPACK" then return i end
	end
	return nil
end

-- ── Throw offer UI ────────────────────────────────────────────────────────────

local offerGui = nil

local function showOffer(throwerName, isBroadcast)
	if offerGui then offerGui:Destroy() end

	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "ThrowOfferGui"
	screenGui.ResetOnSpawn = false
	screenGui.Parent = player.PlayerGui
	offerGui = screenGui

	local frame = Instance.new("Frame", screenGui)
	frame.Size            = UDim2.new(0, 300, 0, 100)
	frame.Position        = UDim2.new(0.5, -150, 0.15, 0)
	frame.BackgroundColor3 = Color3.fromRGB(20, 20, 40)
	frame.BorderSizePixel = 0

	local corner = Instance.new("UICorner", frame)
	corner.CornerRadius = UDim.new(0, 8)

	local label = Instance.new("TextLabel", frame)
	label.Size = UDim2.new(1, 0, 0.5, 0)
	label.BackgroundTransparency = 1
	label.Text = (isBroadcast and "📡 " or "🎯 ") .. throwerName .. " wants to throw you!"
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold

	local acceptBtn = Instance.new("TextButton", frame)
	acceptBtn.Size     = UDim2.new(0.6, 0, 0.4, 0)
	acceptBtn.Position = UDim2.new(0.2, 0, 0.55, 0)
	acceptBtn.BackgroundColor3 = Color3.fromRGB(0, 180, 80)
	acceptBtn.Text     = "ACCEPT THROW [E]"
	acceptBtn.TextColor3 = Color3.new(1,1,1)
	acceptBtn.TextScaled = true
	acceptBtn.Font     = Enum.Font.GothamBold

	local function accept()
		if offerGui then offerGui:Destroy(); offerGui = nil end
		ThrowAccept:FireServer()
	end

	acceptBtn.Activated:Connect(accept)

	-- Keyboard shortcut E
	local conn
	conn = UserInputService.InputBegan:Connect(function(input, gpe)
		if gpe then return end
		if input.KeyCode == Enum.KeyCode.E then
			conn:Disconnect()
			accept()
		end
	end)

	-- Auto-dismiss after 5s
	task.delay(5, function()
		if offerGui then offerGui:Destroy(); offerGui = nil end
		if conn then conn:Disconnect() end
	end)
end

if ThrowOffer then
	ThrowOffer.OnClientEvent:Connect(showOffer)
end

-- ── Thrown flight control ─────────────────────────────────────────────────────

if ThrowExecute then
	ThrowExecute.OnClientEvent:Connect(function(throwDir)
		local char = player.Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if not hrp then return end

		print("[JETPACK-THROW] You are being thrown! Veer with WASD.")

		local inFlight    = true
		local flightStart = tick()
		local maxFlight   = 3  -- seconds of veer control

		-- Veer control loop
		local conn = RunService.RenderStepped:Connect(function()
			if not inFlight then return end
			if not hrp or not hrp.Parent then inFlight = false; return end
			if tick() - flightStart > maxFlight then inFlight = false; return end

			local cam    = workspace.CurrentCamera
			local camCF  = cam.CFrame
			local right  = camCF.RightVector
			local fwd    = Vector3.new(camCF.LookVector.X, 0, camCF.LookVector.Z).Unit

			local veer = Vector3.new(0, 0, 0)
			if UserInputService:IsKeyDown(Enum.KeyCode.W) or UserInputService:IsKeyDown(Enum.KeyCode.Up) then
				veer += fwd * 12
			end
			if UserInputService:IsKeyDown(Enum.KeyCode.S) or UserInputService:IsKeyDown(Enum.KeyCode.Down) then
				veer -= fwd * 8
			end
			if UserInputService:IsKeyDown(Enum.KeyCode.A) or UserInputService:IsKeyDown(Enum.KeyCode.Left) then
				veer -= right * 10
			end
			if UserInputService:IsKeyDown(Enum.KeyCode.D) or UserInputService:IsKeyDown(Enum.KeyCode.Right) then
				veer += right * 10
			end

			if veer.Magnitude > 0 then
				local bv = Instance.new("BodyVelocity")
				bv.Velocity  = hrp.AssemblyLinearVelocity + veer
				bv.MaxForce  = Vector3.new(1e4, 0, 1e4)  -- horizontal only, preserve vertical arc
				bv.Parent    = hrp
				game:GetService("Debris"):AddItem(bv, 0.05)
			end
		end)

		-- Jetpack boost mid-flight: press Space if you have jetpack
		local boostConn
		boostConn = UserInputService.InputBegan:Connect(function(input, gpe)
			if gpe or not inFlight then return end
			if input.KeyCode == Enum.KeyCode.Space and hasJetpack() then
				-- Boost toward current velocity direction = hawkward
				local vel = hrp.AssemblyLinearVelocity
				local boostDir = vel.Magnitude > 1 and vel.Unit or throwDir
				local bv = Instance.new("BodyVelocity")
				bv.Velocity  = boostDir * 160  -- boost speed for kill collision
				bv.MaxForce  = Vector3.new(1e5, 1e5, 1e5)
				bv.Parent    = hrp
				game:GetService("Debris"):AddItem(bv, 0.5)

				-- Consume jetpack slot
				local slot = getJetpackSlot()
				if slot then UseItem:FireServer(slot) end

				print("[JETPACK-THROW] Mid-flight boost activated!")
				boostConn:Disconnect()
			end
		end)

		-- End flight
		task.delay(maxFlight, function()
			inFlight = false
			if conn then conn:Disconnect() end
			if boostConn then boostConn:Disconnect() end
		end)
	end)
end
