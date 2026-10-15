--[[
    TagGameClient (OMC-Governed Front-End)
    --------------------------------------
    Front-end visuals and interaction for the Tag Game.
    Governed by Open Model Contracts (OMC) via ReplicatedStorage bridge.
    
    Why this is "pro-grade":
    - Visuals: Neon Highlight + Billboard IT label + Particle Trails.
    - Chaos: /rowdy command triggers global visual storm in sync.
    - Bridge: Built-in hooks for OMC contract verification (_checkOMC).
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local TextChatService = game:GetService("TextChatService")
local SoundService = game:GetService("SoundService")
local Debris = game:GetService("Debris")

local localPlayer = Players.LocalPlayer
local camera = workspace.CurrentCamera

-- === CONFIGURATION (Bridged to OMC TagGameContractSchema) ===
local CONFIG = {
	REMOTES_FOLDER = "RemoteEvents",
	IT_LABEL = "🔥 IT 🔥",
	HIGHLIGHT_COLOR = Color3.fromRGB(255, 0, 0),
	OUTLINE_COLOR = Color3.fromRGB(255, 255, 0),
	ROWDY_SOUND_ID = "rbxassetid://1848354536",
	TAG_SOUND_ID = "rbxassetid://131057008",
}

-- === REMOTE EVENTS ===
local remotesFolder = ReplicatedStorage:WaitForChild(CONFIG.REMOTES_FOLDER)
local playerTaggedEvent = remotesFolder:WaitForChild("PlayerTagged")
local itPlayerUpdatedEvent = remotesFolder:WaitForChild("ItPlayerUpdated")
local roundStartedEvent = remotesFolder:WaitForChild("RoundStarted")
local roundEndedEvent = remotesFolder:WaitForChild("RoundEnded")

-- === HUD REFERENCES ===
local hud = localPlayer:WaitForChild("PlayerGui"):WaitForChild("TagHUD")
local statusLabel = hud:WaitForChild("StatusLabel")
local timerLabel = hud:WaitForChild("TimerLabel")

-- === STATE ===
local currentItPlayer = nil
local activeConnections = {}

-- === OMC BRIDGE HOOKS ===
-- Placeholder for real-time contract verification if needed
local function _checkOMC(actionName)
	-- In production, this can call a RemoteFunction to verify the agent's signature
	-- print("[OMC] Validating action:", actionName)
	return true
end

-- === VISUAL HELPERS ===

local function applyItVisuals(character)
	if not character then return end
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root then return end

	-- Cleanup existing just in case
	for _, obj in ipairs(character:GetChildren()) do
		if obj.Name == "ItHighlight" or obj.Name == "ItBillboard" then obj:Destroy() end
	end
	if root:FindFirstChild("ItTrail") then root.ItTrail:Destroy() end

	-- Highlight
	local highlight = Instance.new("Highlight")
	highlight.Name = "ItHighlight"
	highlight.FillColor = CONFIG.HIGHLIGHT_COLOR
	highlight.OutlineColor = CONFIG.OUTLINE_COLOR
	highlight.FillTransparency = 0.4
	highlight.Parent = character

	-- Billboard Label
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "ItBillboard"
	billboard.Size = UDim2.new(4, 0, 1.5, 0)
	billboard.StudsOffset = Vector3.new(0, 3.5, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = character

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = CONFIG.IT_LABEL
	label.TextColor3 = CONFIG.OUTLINE_COLOR
	label.TextScaled = true
	label.Font = Enum.Font.Arcade
	label.Parent = billboard

	-- Particle Trail
	local trail = Instance.new("ParticleEmitter")
	trail.Name = "ItTrail"
	trail.Texture = "rbxassetid://241650899"
	trail.Color = ColorSequence.new{
		ColorSequenceKeypoint.new(0, CONFIG.HIGHLIGHT_COLOR),
		ColorSequenceKeypoint.new(1, CONFIG.OUTLINE_COLOR)
	}
	trail.Lifetime = NumberRange.new(0.6, 1.2)
	trail.Rate = 100
	trail.Speed = NumberRange.new(3, 10)
	trail.Parent = root
end

local function removeItVisuals(character)
	if not character then return end
	for _, obj in ipairs(character:GetChildren()) do
		if obj.Name == "ItHighlight" or obj.Name == "ItBillboard" or obj.Name == "ItTrail" then
			obj:Destroy()
		end
	end
	local root = character:FindFirstChild("HumanoidRootPart")
	if root and root:FindFirstChild("ItTrail") then root.ItTrail:Destroy() end
end

-- === EVENT HANDLERS ===

local function onPlayerTagged(tagged, tagger)
	if not tagged.Character then return end
	
	-- Explosion Effect
	local root = tagged.Character:FindFirstChild("HumanoidRootPart")
	if root then
		local explosion = Instance.new("ParticleEmitter")
		explosion.Texture = "rbxassetid://243098098"
		explosion.Color = ColorSequence.new(CONFIG.HIGHLIGHT_COLOR)
		explosion.Lifetime = NumberRange.new(1, 2)
		explosion.Rate = 500
		explosion.Speed = NumberRange.new(25, 45)
		explosion.Parent = root
		Debris:AddItem(explosion, 2)
	end

	-- Global Sound
	local sound = Instance.new("Sound")
	sound.SoundId = CONFIG.TAG_SOUND_ID
	sound.Volume = 0.8
	sound.Parent = SoundService
	sound:Play()
	Debris:AddItem(sound, 3)

	-- HUD Feedback
	if tagged == localPlayer then
		statusLabel.Text = "YOU GOT TAGGED! 💀"
		statusLabel.TextColor3 = CONFIG.HIGHLIGHT_COLOR
		local tween = TweenService:Create(statusLabel, TweenInfo.new(0.3, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out, 1, true), {TextTransparency = 0})
		tween:Play()
	end
end

local function onItPlayerUpdated(newIt)
	if currentItPlayer and currentItPlayer.Character then
		removeItVisuals(currentItPlayer.Character)
	end

	currentItPlayer = newIt

	if newIt then
		if newIt.Character then
			applyItVisuals(newIt.Character)
		else
			local conn
			conn = newIt.CharacterAdded:Connect(function(char)
				applyItVisuals(char)
				conn:Disconnect()
			end)
		end
		
		statusLabel.Text = (newIt == localPlayer) and "YOU ARE IT! 🏃💨" or "IT: " .. newIt.DisplayName
		statusLabel.TextColor3 = (newIt == localPlayer) and CONFIG.OUTLINE_COLOR or Color3.new(1, 1, 1)
	else
		statusLabel.Text = "Waiting for Round..."
	end
end

-- === CHAOS: ROWDY COMMAND ===

local rowdyCmd = Instance.new("TextChatCommand")
rowdyCmd.Name = "RowdyCommand"
rowdyCmd.PrimaryAlias = "/rowdy"
rowdyCmd.SecondaryAlias = "/chaos"

rowdyCmd.Triggered:Connect(function(textSource)
	if not _checkOMC("TRIGGER_ROWDY") then return end
	
	print("🔥 [OMC-CHAOS] Activated by", textSource.UserId)
	
	-- Sound
	local s = Instance.new("Sound")
	s.SoundId = CONFIG.ROWDY_SOUND_ID
	s.Volume = 1.5
	s.Parent = SoundService
	s:Play()
	Debris:AddItem(s, 5)

	-- Global Visual Storm
	for _, plr in ipairs(Players:GetPlayers()) do
		task.spawn(function()
			local char = plr.Character
			if not char then return end
			local root = char:FindFirstChild("HumanoidRootPart")
			if root then
				local storm = Instance.new("ParticleEmitter")
				storm.Texture = "rbxassetid://241650899"
				storm.Color = ColorSequence.new{
					ColorSequenceKeypoint.new(0, Color3.new(1, 0, 1)),
					ColorSequenceKeypoint.new(1, Color3.new(0, 1, 1))
				}
				storm.Size = NumberSequence.new(2, 5)
				storm.Rate = 200
				storm.Speed = NumberRange.new(20, 50)
				storm.Parent = root
				Debris:AddItem(storm, 5)
			end
			
			-- Disco Colors
			for i = 1, 10 do
				for _, part in ipairs(char:GetChildren()) do
					if part:IsA("BasePart") then
						part.Color = Color3.fromHSV(math.random(), 1, 1)
					end
				end
				task.wait(0.2)
			end
		end)
	end
	
	-- Camera Shake
	local shakeEndTime = tick() + 4
	local shakeConn
	shakeConn = RunService.RenderStepped:Connect(function()
		if tick() > shakeEndTime then
			camera.CFrame = camera.CFrame -- Reset or leave it to controls
			shakeConn:Disconnect()
			return
		end
		camera.CFrame = camera.CFrame * CFrame.new(math.random(-1,1)*0.4, math.random(-1,1)*0.4, 0)
	end)
end)

-- Register Command
local channels = TextChatService:WaitForChild("TextChannels", 5)
if channels then
	local general = channels:WaitForChild("RBXGeneral", 5)
	if general then general:AddChild(rowdyCmd) end
end

-- === CONNECTIONS ===
table.insert(activeConnections, playerTaggedEvent.OnClientEvent:Connect(onPlayerTagged))
table.insert(activeConnections, itPlayerUpdatedEvent.OnClientEvent:Connect(onItPlayerUpdated))
table.insert(activeConnections, roundStartedEvent.OnClientEvent:Connect(function(duration)
	local endTime = tick() + duration
	local timerConn
	timerConn = RunService.Heartbeat:Connect(function()
		local remaining = math.max(0, math.ceil(endTime - tick()))
		timerLabel.Text = (remaining > 0) and "Timer: " .. remaining or "FINISH!"
		if remaining <= 0 then timerConn:Disconnect() end
	end)
end))

roundEndedEvent.OnClientEvent:Connect(function()
	timerLabel.Text = "Round Over!"
end)

print("🚀 [OMC] Tag Game Client Loaded. Try /rowdy for Chaos.")