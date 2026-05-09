-- =============================================================================
-- InventoryService
-- 3-slot inventory system. Power-ups spawn at randomized map points and
-- respawn after use. Players pick up by touching. Server-authoritative.
--
-- Power-ups: JETPACK | CLOAK | SPITBALL | HEAL
-- Healing is player-to-player only — no healing pickups exist.
-- =============================================================================

local Players         = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService      = game:GetService("RunService")

-- ── Config ────────────────────────────────────────────────────────────────────

local POWERUP_TYPES = { "JETPACK", "CLOAK", "SPITBALL" }

local POWERUP_CFG = {
	JETPACK  = { color = BrickColor.new("Bright orange"),  duration = 20,  respawnDelay = 15 },
	CLOAK    = { color = BrickColor.new("Electric blue"),  duration = 10,  respawnDelay = 20 },
	SPITBALL = { color = BrickColor.new("Bright green"),   duration = 0,   respawnDelay = 10 }, -- duration=0 = uses charges
}

local INVENTORY_SIZE = 3

-- Spawn zone: randomized points within the arena bounds
-- Centered around (1012, 58, 1007) — lobby/arena center
local ARENA_CENTER = Vector3.new(1012, 62, 1007)
local ARENA_RADIUS = 40  -- studs from center, keeps pickups on the floor

-- ── RemoteEvents setup ────────────────────────────────────────────────────────

local function ensureFolder(parent, name)
	local f = parent:FindFirstChild(name)
	if not f then
		f = Instance.new("Folder")
		f.Name = name
		f.Parent = parent
	end
	return f
end

local omcFolder   = ensureFolder(ReplicatedStorage, "OMC")
local eventsFolder = ensureFolder(omcFolder, "Events")

local function getOrCreateRemote(name, class)
	local existing = eventsFolder:FindFirstChild(name)
	if existing then return existing end
	local r = Instance.new(class)
	r.Name   = name
	r.Parent = eventsFolder
	return r
end

local InventoryUpdate  = getOrCreateRemote("InventoryUpdate",  "RemoteEvent")  -- server→client
local UseItem          = getOrCreateRemote("UseItem",          "RemoteEvent")  -- client→server
local HealRequest      = getOrCreateRemote("HealRequest",      "RemoteEvent")  -- client→server
local HealEffect       = getOrCreateRemote("HealEffect",       "RemoteEvent")  -- server→client

-- ── Player inventory state ────────────────────────────────────────────────────

-- inventory[player] = { [1]=item|nil, [2]=item|nil, [3]=item|nil }
local inventory = {}

local function getInventory(player)
	if not inventory[player] then
		inventory[player] = { nil, nil, nil }
	end
	return inventory[player]
end

local function firstEmptySlot(player)
	local inv = getInventory(player)
	for i = 1, INVENTORY_SIZE do
		if not inv[i] then return i end
	end
	return nil
end

local function addItem(player, itemType)
	local slot = firstEmptySlot(player)
	if not slot then return false end
	getInventory(player)[slot] = itemType
	InventoryUpdate:FireClient(player, getInventory(player))
	return true
end

local function removeItem(player, slot)
	getInventory(player)[slot] = nil
	InventoryUpdate:FireClient(player, getInventory(player))
end

-- ── Pickup spawning ───────────────────────────────────────────────────────────

local pickupFolder = ensureFolder(workspace, "PowerupPickups")

local function randomArenaPoint()
	local angle  = math.random() * math.pi * 2
	local radius = math.random() * ARENA_RADIUS
	return Vector3.new(
		ARENA_CENTER.X + math.cos(angle) * radius,
		ARENA_CENTER.Y,
		ARENA_CENTER.Z + math.sin(angle) * radius
	)
end

local function spawnPickup(itemType)
	local cfg = POWERUP_CFG[itemType]

	local part = Instance.new("Part")
	part.Name        = "Pickup_" .. itemType
	part.Size        = Vector3.new(2, 2, 2)
	part.Shape       = Enum.PartType.Ball
	part.BrickColor  = cfg.color
	part.Material    = Enum.Material.Neon
	part.Anchored    = true
	part.CanCollide  = false
	part.CFrame      = CFrame.new(randomArenaPoint())
	part.Parent      = pickupFolder

	-- Spin effect
	local spin = Instance.new("BodyAngularVelocity")
	spin.AngularVelocity = Vector3.new(0, 2, 0)
	spin.MaxTorque       = Vector3.new(0, 1e4, 0)
	spin.Parent          = part

	-- Label
	local billboard = Instance.new("BillboardGui")
	billboard.Size        = UDim2.new(0, 80, 0, 30)
	billboard.StudsOffset = Vector3.new(0, 2, 0)
	billboard.AlwaysOnTop = false
	billboard.Parent      = part
	local label = Instance.new("TextLabel", billboard)
	label.Size            = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text            = itemType
	label.TextColor3      = Color3.new(1, 1, 1)
	label.TextScaled      = true
	label.Font            = Enum.Font.GothamBold

	-- Touch to collect
	part.Touched:Connect(function(hit)
		local char = hit.Parent
		if not char then return end
		local player = Players:GetPlayerFromCharacter(char)
		if not player then return end
		if not part.Parent then return end  -- already collected

		local added = addItem(player, itemType)
		if added then
			part:Destroy()
			print(string.format("[INVENTORY] %s picked up %s", player.Name, itemType))
			-- Respawn after delay
			task.delay(cfg.respawnDelay, function()
				spawnPickup(itemType)
			end)
		end
	end)

	return part
end

-- ── Initial spawn — one of each type at random points ────────────────────────

task.wait(2)  -- let world finish loading

for _, itemType in ipairs(POWERUP_TYPES) do
	spawnPickup(itemType)
end

print("[INVENTORY] Power-up spawner active —", #POWERUP_TYPES, "pickups in world")

-- ── Use item handler ──────────────────────────────────────────────────────────

UseItem.OnServerEvent:Connect(function(player, slot)
	local inv = getInventory(player)
	local item = inv[slot]
	if not item then return end

	local char = player.Character
	local hrp  = char and char:FindFirstChild("HumanoidRootPart")
	local hum  = char and char:FindFirstChildOfClass("Humanoid")
	if not (char and hrp and hum) then return end

	local cfg = POWERUP_CFG[item]

	print(string.format("[INVENTORY] %s used %s (slot %d)", player.Name, item, slot))
	removeItem(player, slot)

	if item == "JETPACK" then
		-- Jetpack: apply upward BodyVelocity burst
		-- Teammate throw logic handled client-side via JetpackThrow RemoteEvent
		local bv = Instance.new("BodyVelocity")
		bv.Velocity  = Vector3.new(0, 80, 0)
		bv.MaxForce  = Vector3.new(0, 1e5, 0)
		bv.Parent    = hrp
		game:GetService("Debris"):AddItem(bv, 0.4)

		-- Duration: keep jetpack active
		local active = true
		task.delay(cfg.duration, function() active = false end)

		-- Hover assist while active
		task.spawn(function()
			local startT = tick()
			while active and tick() - startT < cfg.duration do
				if hrp and hrp.Parent then
					local vel = hrp.AssemblyLinearVelocity
					if vel.Y < -10 then
						local assist = Instance.new("BodyVelocity")
						assist.Velocity = Vector3.new(vel.X, -5, vel.Z)
						assist.MaxForce = Vector3.new(0, 1e4, 0)
						assist.Parent   = hrp
						game:GetService("Debris"):AddItem(assist, 0.1)
					end
				end
				task.wait(0.1)
			end
		end)

	elseif item == "CLOAK" then
		-- Cloak: invisibility + invincibility
		for _, part in ipairs(char:GetDescendants()) do
			if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
				part.Transparency = 0.85
			end
		end
		hum:SetAttribute("OMC_Cloaked", true)

		task.delay(cfg.duration, function()
			if not char.Parent then return end
			for _, part in ipairs(char:GetDescendants()) do
				if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
					part.Transparency = 0
				end
			end
			hum:SetAttribute("OMC_Cloaked", false)
			print(string.format("[INVENTORY] %s cloak expired", player.Name))
		end)

	elseif item == "SPITBALL" then
		-- Spitball: grant 3 charges, handled via SpitballFire RemoteEvent
		local current = hum:GetAttribute("OMC_SpitballCharges") or 0
		hum:SetAttribute("OMC_SpitballCharges", current + 3)
		print(string.format("[INVENTORY] %s has %d spitball charges", player.Name, current + 3))
	end
end)

-- ── Heal handler — player-to-player only ──────────────────────────────────────

HealRequest.OnServerEvent:Connect(function(healer, targetPlayer)
	if healer == targetPlayer then return end

	local healerChar = healer.Character
	local healerHRP  = healerChar and healerChar:FindFirstChild("HumanoidRootPart")
	local targetChar = targetPlayer and targetPlayer.Character
	local targetHRP  = targetChar and targetChar:FindFirstChild("HumanoidRootPart")
	local targetHum  = targetChar and targetChar:FindFirstChildOfClass("Humanoid")

	if not (healerHRP and targetHRP and targetHum) then return end

	-- Must be within 10 studs to heal
	local dist = (healerHRP.Position - targetHRP.Position).Magnitude
	if dist > 10 then
		print(string.format("[INVENTORY] %s too far to heal %s (%.1f studs)", healer.Name, targetPlayer.Name, dist))
		return
	end

	-- Only heal if target is in danger zone (below 30% health)
	local pct = targetHum.Health / targetHum.MaxHealth
	if pct > 0.3 then
		print(string.format("[INVENTORY] %s health not critical (%.0f%%)", targetPlayer.Name, pct * 100))
		return
	end

	local healAmount = targetHum.MaxHealth * 0.4  -- heal to ~70%
	targetHum.Health = math.min(targetHum.MaxHealth, targetHum.Health + healAmount)

	HealEffect:FireClient(healer,    "healer", targetPlayer.Name)
	HealEffect:FireClient(targetPlayer, "receiver", healer.Name)

	print(string.format("[INVENTORY] %s healed %s (+%.0f HP)", healer.Name, targetPlayer.Name, healAmount))
end)

-- ── Cleanup on player leave ───────────────────────────────────────────────────

Players.PlayerRemoving:Connect(function(player)
	inventory[player] = nil
end)

print("[INVENTORY] Service initialized — 3-slot inventory, player-to-player healing only")
