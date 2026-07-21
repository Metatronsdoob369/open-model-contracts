-- Specialist: systems-pilot-01 | Role: Logic Orchestration
-- Mission: Sector Alpha — Tag Game (STABILITY UPGRADE)

local TagLogic = {}

-- [[ GOVERNANCE IMPORTS ]]
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

-- Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local CollectionService = game:GetService("CollectionService")

-- Configuration
local CONFIG = {
	TAG_DISTANCE = 7,
	COOLDOWN = 12,
	IT_COLOR = Color3.fromRGB(255, 0, 255),
	TELEMETRY_RATE = 5, -- Pulse every 5 seconds, NOT every frame
}

-- State
local currentIt = nil
local lastTagTime = {}
local totalTags = 0
local sessionStart = os.clock()
local lastPulseTime = 0

local function getTagsPerMin()
	local elapsed = os.clock() - sessionStart
	if elapsed < 10 then return 0 end
	return (totalTags / (elapsed / 60))
end

function TagLogic.assignIt(player)
	if currentIt then
		local char = currentIt.Character
		if char then
			local highlight = char:FindFirstChild("IT_Highlight")
			if highlight then highlight:Destroy() end
		end
	end

	currentIt = player
	totalTags = totalTags + 1

	local char = player.Character
	if char then
		local highlight = Instance.new("Highlight")
		highlight.Name = "IT_Highlight"
		highlight.FillColor = CONFIG.IT_COLOR
		highlight.Parent = char
	end

	print("[OMC] New 'It' Assigned: " .. player.Name)
end

function TagLogic.start()
	Players.PlayerAdded:Connect(function(player)
		if not currentIt then
			TagLogic.assignIt(player)
		end
	end)

	-- Main Game Loop
	RunService.Heartbeat:Connect(function()
		if not currentIt then return end
		local itChar = currentIt.Character
		if not itChar then return end
		local itRoot = itChar:FindFirstChild("HumanoidRootPart")
		if not itRoot then return end

		-- Scan Players
		for _, player in ipairs(Players:GetPlayers()) do
			if player ~= currentIt then
				local char = player.Character
				if char then
					local root = char:FindFirstChild("HumanoidRootPart")
					if root then
						local distance = (itRoot.Position - root.Position).Magnitude
						local now = os.clock()
						local lastTag = lastTagTime[player.UserId] or 0

						if distance < CONFIG.TAG_DISTANCE and (now - lastTag) > CONFIG.COOLDOWN then
							lastTagTime[currentIt.UserId] = now
							TagLogic.assignIt(player)
							break
						end
					end
				end
			end
		end

		-- Scan Bots (Solo Testing)
		for _, bot in ipairs(CollectionService:GetTagged("OMC_Bot")) do
			-- Support both Model (monster) and legacy Part bots
			local botRoot = bot:IsA("Model") and bot.PrimaryPart or bot:FindFirstChild("HumanoidRootPart")
			if not botRoot then botRoot = bot:IsA("BasePart") and bot or nil end
			if botRoot then
				local distance = (itRoot.Position - botRoot.Position).Magnitude
				local now = os.clock()
				local lastTag = lastTagTime[bot] or 0

				if distance < CONFIG.TAG_DISTANCE and (now - lastTag) > CONFIG.COOLDOWN then
					lastTagTime[bot] = now
					totalTags = totalTags + 1

					-- Visual flash using Highlight
					local flash = Instance.new("Highlight")
					flash.FillColor = Color3.fromRGB(255, 255, 255)
					flash.OutlineColor = Color3.fromRGB(255, 0, 0)
					flash.Parent = bot
					task.delay(0.3, function() flash:Destroy() end)

					print("🤖 [TAG] Monster Bot Tagged! Frequency rising...")
				end
			end
		end

		-- [[ THROTTLED TELEMETRY DISPATCH ]]
		local now = os.clock()
		if (now - lastPulseTime) >= CONFIG.TELEMETRY_RATE then
			lastPulseTime = now
			Telemetry.dispatchPulse({
				state = "Operational",
				itPlayer = currentIt and currentIt.Name or "None",
				tagFreq = getTagsPerMin(),
				resonance = getTagsPerMin() >= 6 and "Stable" or "Dissonant"
			})
		end
	end)
end

return TagLogic
