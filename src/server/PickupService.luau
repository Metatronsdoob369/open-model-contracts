--[=[
    PickupService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: Game_Rules (World Interaction)
    Law Compliance: Resonance Manifestation §4, Spatio-Temporal Integrity §7

    Handles the manifestation and respawning of world pickups (Jetpacks, Cloaks, etc).
    Integrates with InventoryService for collection logic.
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

-- Sovereign Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

local InventoryService = nil -- Injected via ignition

local PickupService = {
	Name = "PickupService",
	Config = {
		RESPAWN_TIME = 30,
		FLOAT_HEIGHT = 4,
		PICKUP_RADIUS = 6,
		ITEMS = {
			Jetpack = {
				icon = "rbxassetid://123456", -- Placeholder, replace with real ID
				color = Color3.fromRGB(0, 240, 255),
			},
			Cloak = {
				icon = "rbxassetid://654321",
				color = Color3.fromRGB(180, 0, 255),
			}
		}
	},
	ActivePickups = {},
}

-- [[ PRIVATE METHODS ]]

local function CreatePickupVisual(itemName, position)
	local config = PickupService.Config.ITEMS[itemName]
	
	local part = Instance.new("Part")
	part.Name = "Pickup_" .. itemName
	part.Size = Vector3.new(2, 2, 2)
	part.Position = position + Vector3.new(0, PickupService.Config.FLOAT_HEIGHT, 0)
	part.Anchored = true
	part.CanCollide = false
	part.Material = Enum.Material.Neon
	part.Color = config.color
	part.Transparency = 0.5
	part.Parent = workspace
	
	-- Gothic Glow Effect
	local pointLight = Instance.new("PointLight")
	pointLight.Color = config.color
	pointLight.Range = 12
	pointLight.Brightness = 2
	pointLight.Parent = part
	
	-- Beam Beacon (for visibility)
	local attachment = Instance.new("Attachment", part)
	local beam = Instance.new("Beam")
	beam.Attachment0 = attachment
	beam.Attachment1 = Instance.new("Attachment", workspace.Terrain) -- Sky anchor
	beam.Attachment1.WorldPosition = part.Position + Vector3.new(0, 500, 0)
	beam.Color = ColorSequence.new(config.color)
	beam.Width0 = 0.5
	beam.Width1 = 0
	beam.Transparency = NumberSequence.new(0.5)
	beam.Parent = part

	return part
end

function PickupService:SpawnItem(itemName, position)
	local visual = CreatePickupVisual(itemName, position)
	local pickupData = {
		name = itemName,
		pos = position,
		visual = visual,
		spawnedAt = os.time()
	}
	
	table.insert(self.ActivePickups, pickupData)
	
	-- Animation Loop
	task.spawn(function()
		while visual.Parent do
			local t = tick()
			visual.CFrame = CFrame.new(position + Vector3.new(0, PickupService.Config.FLOAT_HEIGHT + math.sin(t * 2) * 0.5, 0)) * CFrame.Angles(0, t, 0)
			task.wait()
		end
	end)
end

-- [[ PUBLIC INTERFACE ]]

function PickupService:Init(services)
	InventoryService = services.InventoryService
	
	-- Listen for collection requests (Simple proximity check loop for now)
	task.spawn(function()
		while true do
			for i, pickup in ipairs(self.ActivePickups) do
				for _, player in ipairs(Players:GetPlayers()) do
					local char = player.Character
					if char and char.PrimaryPart then
						local dist = (char.PrimaryPart.Position - pickup.visual.Position).Magnitude
						if dist < self.Config.PICKUP_RADIUS and not pickup.collecting then
							-- Trigger Collection
							pickup.collecting = true
							local success = InventoryService:PickupItem(player, pickup.name)
							if success then
								pickup.visual:Destroy()
								table.remove(self.ActivePickups, i)
								
								-- Respawn logic
								task.delay(self.Config.RESPAWN_TIME, function()
									self:SpawnItem(pickup.name, pickup.pos)
								end)
								
								Telemetry.dispatchPulse({ event = "Pickup_Collected", item = pickup.name })
								break
							end
						end
					end
				end
			end
			task.wait(0.2)
		end
	end)
	
	print("🎒 [PICKUP-SERVICE] World spawner manifest. Respawn: " .. self.Config.RESPAWN_TIME .. "s")
end

function PickupService:Start()
	-- Initial Spawning: Place items on map tiles
	task.delay(1, function()
		local arena = workspace:FindFirstChild("SectorAlpha_Arena")
		if arena then
			local tiles = {}
			for _, child in ipairs(arena:GetChildren()) do
				if child:IsA("BasePart") and child.Name ~= "Floor" then
					table.insert(tiles, child)
				end
			end
			
			-- Place 4 Jetpacks and 4 Cloaks on high ground
			for i = 1, 4 do
				local tile = tiles[math.random(1, #tiles)]
				if tile then
					self:SpawnItem("Jetpack", tile.Position + Vector3.new(0, tile.Size.Y/2, 0))
				end
			end
			for i = 1, 4 do
				local tile = tiles[math.random(1, #tiles)]
				if tile then
					self:SpawnItem("Cloak", tile.Position + Vector3.new(0, tile.Size.Y/2, 0))
				end
			end
		else
			warn("🎒 [PICKUP-SERVICE] No SectorAlpha_Arena found for spawning!")
		end
	end)
end

return PickupService
