-- [[ SECTOR ALPHA: AI BOT ENGINE ]]
local CollectionService = game:GetService("CollectionService")

local TagBot = {}

function TagBot.spawn(count)
	local arena = workspace:FindFirstChild("SectorAlpha_Arena")
	if not arena then return end
	
	local spawnArea = arena:FindFirstChild("Floor")
	if not spawnArea then return end
	
	print("🤖 [TAG-BOT] Manifesting " .. count .. " AI Targets...")
	
	for i = 1, count do
		local bot = Instance.new("Part")
		bot.Name = "GlimmerBot_" .. i
		bot.Size = Vector3.new(4, 4, 4)
		bot.Position = spawnArea.Position + Vector3.new(math.random(-50, 50), 10, math.random(-50, 50))
		bot.BrickColor = BrickColor.new("Cyan")
		bot.Material = Enum.Material.Neon
		bot.Transparency = 0.4
		bot.Parent = arena
		
		-- Use a simplified "Body" instead of full Humanoid for performance
		local root = Instance.new("Part")
		root.Name = "HumanoidRootPart"
		root.Size = bot.Size
		root.CFrame = bot.CFrame
		root.Transparency = 1
		root.Parent = bot
		
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = bot
		weld.Part1 = root
		weld.Parent = bot

		-- Mark for TagLogic
		CollectionService:AddTag(bot, "OMC_Bot")
		
		-- Simple AI Movement
		task.spawn(function()
			while bot.Parent do
				local targetPos = spawnArea.Position + Vector3.new(math.random(-80, 80), 0, math.random(-80, 80))
				local direction = (targetPos - bot.Position).Unit
				
				-- Smooth glide
				for step = 1, 100 do
					if not bot.Parent then break end
					bot.Position = bot.Position + (direction * 0.8)
					task.wait(0.05)
				end
				task.wait(math.random(1, 3))
			end
		end)
	end
end

return TagBot
