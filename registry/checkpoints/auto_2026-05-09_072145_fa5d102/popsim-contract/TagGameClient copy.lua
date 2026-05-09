-- TagGameClient (LocalScript in StarterPlayerScripts)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local TextChatService = game:GetService("TextChatService")
local SoundService = game:GetService("SoundService")

local localPlayer = Players.LocalPlayer
local camera = workspace.CurrentCamera

-- === REMOTE EVENTS (change names if your back-end uses different ones) ===
local playerTaggedEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("PlayerTagged")
local itPlayerUpdatedEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("ItPlayerUpdated")
local roundStartedEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("RoundStarted") -- optional
local roundEndedEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("RoundEnded") -- optional

-- === HUD REFERENCES ===
local hud = localPlayer:WaitForChild("PlayerGui"):WaitForChild("TagHUD")
local statusLabel = hud:WaitForChild("StatusLabel")
local timerLabel = hud:WaitForChild("TimerLabel")
local tagCounter = hud:FindFirstChild("TagCounter") and hud.TagCounter:FindFirstChild("TextLabel")

-- === STATE ===
local currentItPlayer: Player? = nil
local connectionList = {}

-- === HELPER: Create "IT" visuals on a character ===
local function applyItVisuals(character: Model)
	if not character then return end
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root then return end

	-- Highlight (neon glow)
	local highlight = Instance.new("Highlight")
	highlight.Name = "ItHighlight"
	highlight.FillColor = Color3.fromRGB(255, 0, 0)
	highlight.OutlineColor = Color3.fromRGB(255, 255, 0)
	highlight.FillTransparency = 0.4
	highlight.OutlineTransparency = 0
	highlight.Parent = character

	-- Billboard "IT" label
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "ItBillboard"
	billboard.Size = UDim2.new(4, 0, 1, 0)
	billboard.StudsOffset = Vector3.new(0, 3, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = character

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = "🔥 IT 🔥"
	label.TextColor3 = Color3.fromRGB(255, 255, 0)
	label.TextScaled = true
	label.Font = Enum.Font.Arcade
	label.Parent = billboard

	-- Particle trail (rowdy energy)
	local trail = Instance.new("ParticleEmitter")
	trail.Name = "ItTrail"
	trail.Texture = "rbxassetid://241650899" -- fire/sparkle
	trail.Color = ColorSequence.new{ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 0, 0)), ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 255, 0))}
	trail.Lifetime = NumberRange.new(0.6, 1.2)
	trail.Rate = 80
	trail.Speed = NumberRange.new(2, 8)
	trail.Parent = root
end

local function removeItVisuals(character: Model)
	if not character then return end
	for _, obj in ipairs(character:GetChildren()) do
		if obj.Name == "ItHighlight" or obj.Name == "ItBillboard" or obj.Name == "ItTrail" then
			obj:Destroy()
		end
	end
end

-- === TAG EVENT HANDLER (explosion + sound + screen flash) ===
local function onPlayerTagged(tagged: Player, tagger: Player)
	if not tagged.Character then return end

	-- Tag explosion particles on tagged player
	local root = tagged.Character:FindFirstChild("HumanoidRootPart")
	if root then
		local explosion = Instance.new("ParticleEmitter")
		explosion.Texture = "rbxassetid://243098098" -- confetti/explosion
		explosion.Color = ColorSequence.new(Color3.fromRGB(255, 100, 0))
		explosion.Lifetime = NumberRange.new(1.5, 2.5)
		explosion.Rate = 300
		explosion.Speed = NumberRange.new(20, 40)
		explosion.Parent = root
		game:GetService("Debris"):AddItem(explosion, 3)
	end

	-- Play hit sound (global so everyone hears)
	local hitSound = Instance.new("Sound")
	hitSound.SoundId = "rbxassetid://131057008" -- classic tag hit
	hitSound.Volume = 0.8
	hitSound.Parent = SoundService
	hitSound:Play()
	game:GetService("Debris"):AddItem(hitSound, 3)

	-- Screen flash for the tagged player
	if tagged == localPlayer then
		statusLabel.Text = "YOU GOT TAGGED! 😵"
		statusLabel.TextColor3 = Color3.fromRGB(255, 0, 0)
		local flashTween = TweenService:Create(statusLabel, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 2, true), {TextTransparency = 0})
		flashTween:Play()
	end
end

-- === IT PLAYER UPDATED ===
local function onItPlayerUpdated(newIt: Player?)
	-- Clean old It visuals
	if currentItPlayer and currentItPlayer.Character then
		removeItVisuals(currentItPlayer.Character)
	end

	currentItPlayer = newIt

	-- Apply new It visuals
	if newIt and newIt.Character then
		applyItVisuals(newIt.Character)
	elseif newIt then
		-- Character not loaded yet — wait for it
		local conn
		conn = newIt.CharacterAdded:Connect(function(char)
			applyItVisuals(char)
			conn:Disconnect()
		end)
	end

	-- Update local HUD
	if newIt == localPlayer then
		statusLabel.Text = "YOU ARE IT! 🏃‍♂️"
		statusLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
	else
		statusLabel.Text = newIt and `IT: {newIt.DisplayName}` or "Waiting for round..."
		statusLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	end
end

-- === ROUND TIMER (optional) ===
local function startRoundTimer(seconds: number)
	local startTime = tick()
	local conn = RunService.Heartbeat:Connect(function()
		local remaining = math.max(0, seconds - (tick() - startTime))
		timerLabel.Text = `Round ends in: {math.floor(remaining)}`
		if remaining <= 0 then
			conn:Disconnect()
		end
	end)
	table.insert(connectionList, conn)
end

-- === ROWDY COMMAND (the chaos injector) ===
local rowdyCommand = Instance.new("TextChatCommand")
rowdyCommand.Name = "RowdyCommand"
rowdyCommand.PrimaryAlias = "/rowdy"
rowdyCommand.SecondaryAlias = "/chaos"

rowdyCommand.Triggered:Connect(function(textSource, message)
	-- Rowdy mode activates for EVERY client instantly — perfect prank
	print("🔥 ROWDY COMMAND ACTIVATED by", textSource.Name)

	-- 1. Particle storm on every character in the game
	for _, plr in ipairs(Players:GetPlayers()) do
		if plr.Character then
			local root = plr.Character:FindFirstChild("HumanoidRootPart")
			if root then
				-- Confetti explosion
				local storm = Instance.new("ParticleEmitter")
				storm.Texture = "rbxassetid://241650899"
				storm.Color = ColorSequence.new{ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 0, 255)), ColorSequenceKeypoint.new(1, Color3.fromRGB(0, 255, 255))}
				storm.Lifetime = NumberRange.new(2, 4)
				storm.Rate = 150
				storm.Speed = NumberRange.new(15, 35)
				storm.Acceleration = Vector3.new(0, -20, 0)
				storm.Parent = root
				game:GetService("Debris"):AddItem(storm, 6)

				-- Random color flash on body parts
				for _, part in ipairs(plr.Character:GetChildren()) do
					if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
						local origColor = part.Color
						TweenService:Create(part, TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 6, true), {Color = Color3.fromHSV(math.random(), 1, 1)}):Play()
						task.delay(6, function() if part then part.Color = origColor end end)
					end
				end
			end
		end
	end

	-- 2. Camera shake for everyone (fun disorientation)
	local shakeTime = 0
	local originalCFrame = camera.CFrame
	local shakeConn = RunService.RenderStepped:Connect(function(dt)
		shakeTime += dt
		if shakeTime > 4 then
			camera.CFrame = originalCFrame
			shakeConn:Disconnect()
			return
		end
		local shake = CFrame.new(math.random(-2,2)*0.3, math.random(-2,2)*0.3, 0)
		camera.CFrame = originalCFrame * shake
	end)
	table.insert(connectionList, shakeConn)

	-- 3. Loud silly sound (global)
	local rowdySound = Instance.new("Sound")
	rowdySound.SoundId = "rbxassetid://1848354536" -- cartoon chaos noise
	rowdySound.Volume = 1.2
	rowdySound.Parent = SoundService
	rowdySound:Play()
	game:GetService("Debris"):AddItem(rowdySound, 5)

	-- Optional: you can extend this with more effects (force jump, temp walkspeed, etc.)
end)

-- Register the command with the new TextChatService
TextChatService:WaitForChild("TextChannels"):WaitForChild("RBXGeneral"):AddChild(rowdyCommand)

-- === CONNECTIONS ===
playerTaggedEvent.OnClientEvent:Connect(onPlayerTagged)
itPlayerUpdatedEvent.OnClientEvent:Connect(onItPlayerUpdated)
roundStartedEvent.OnClientEvent:Connect(startRoundTimer)
roundEndedEvent.OnClientEvent:Connect(function()
	timerLabel.Text = "Round Over!"
end)

-- Cleanup on leave
localPlayer.CharacterRemoving:Connect(function()
	if currentItPlayer == localPlayer then
		removeItVisuals(localPlayer.Character)
	end
end)

-- Auto-clean connections when script destroys
game:BindToClose(function()
	for _, conn in connectionList do
		if conn.Connected then conn:Disconnect() end
	end
end)

print("🚀 High-level Tag Game Front-End loaded! Type /rowdy for instant chaos.")