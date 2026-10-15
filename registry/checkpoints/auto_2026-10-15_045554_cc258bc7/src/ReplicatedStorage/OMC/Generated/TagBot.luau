-- [[ SECTOR ALPHA: AI BOT ENGINE ]]
local CollectionService = game:GetService("CollectionService")
local ServerStorage = game:GetService("ServerStorage")

local TagBot = {}

function TagBot.spawn(count)
	local arena = workspace:FindFirstChild("SectorAlpha_Arena")
	if not arena then return end

	local floor = arena:FindFirstChild("Floor")
	if not floor then return end

	local template = ServerStorage:FindFirstChild("MonsterTemplate")
	if not template then
		warn("[TAG-BOT] MonsterTemplate not found in ServerStorage — add monster.rbxm and rename it MonsterTemplate")
		return
	end

	print("🤖 [TAG-BOT] Manifesting " .. count .. " Monster Bots...")

	for i = 1, count do
		local bot = template:Clone()
		bot.Name = "GlimmerBot_" .. i

		local spawnPos = floor.Position + Vector3.new(math.random(-50, 50), 5, math.random(-50, 50))
		if bot.PrimaryPart then
			bot:SetPrimaryPartCFrame(CFrame.new(spawnPos))
		end
		bot.Parent = arena

		CollectionService:AddTag(bot, "OMC_Bot")

		-- Simple roaming AI
		task.spawn(function()
			while bot.Parent do
				local primary = bot.PrimaryPart
				if not primary then task.wait(1) continue end

				local targetPos = Vector3.new(
					floor.Position.X + math.random(-80, 80),
					primary.Position.Y,
					floor.Position.Z + math.random(-80, 80)
				)
				local direction = (targetPos - primary.Position).Unit

				for _ = 1, 100 do
					if not bot.Parent then break end
					primary = bot.PrimaryPart
					if not primary then break end
					bot:SetPrimaryPartCFrame(primary.CFrame + (direction * 0.4))
					task.wait(0.05)
				end
				task.wait(math.random(1, 3))
			end
		end)
	end
end

return TagBot
