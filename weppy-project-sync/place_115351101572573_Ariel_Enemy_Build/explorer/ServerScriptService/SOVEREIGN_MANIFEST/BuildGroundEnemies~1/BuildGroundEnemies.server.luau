-- =============================================================================
-- BuildGroundEnemies
-- Spawns two ground enemy types:
--   CRAWLER — fast, low, swarms players, weak (60HP)
--   TITAN   — slow, heavy, high damage, requires 2 players to stagger (300HP)
-- FSM: PATROL → CHASE → ATTACK → STAGGER → DEAD
-- Movement: BodyVelocity + per-frame floor raycast (NO Humanoid.MoveTo)
-- Floor-pin: raycast each heartbeat from above enemy to find actual floor Y
-- =============================================================================

local ENABLE_ON_BOOT = true
print("[GROUND-ENEMIES] Script loaded")

local RunService    = game:GetService("RunService")
local Players       = game:GetService("Players")
local Debris        = game:GetService("Debris")

if not ENABLE_ON_BOOT then return end

local ARENA_CENTER = Vector3.new(1012, 60, 1007)
local ARENA_RADIUS = 35

-- ── Floor detection ───────────────────────────────────────────────────────────
local function findFloorY(x, z, enemyModel)
	local rp = RaycastParams.new()
	rp.FilterType = Enum.RaycastFilterType.Exclude
	rp.FilterDescendantsInstances = enemyModel and {enemyModel} or {}
	local origin    = Vector3.new(x, 300, z)
	local direction = Vector3.new(0, -400, 0)
	local result    = workspace:Raycast(origin, direction, rp)
	if result then
		return result.Position.Y
	end
	return nil  -- no floor found
end

local ENEMY_CFG = {
	CRAWLER = {
		name          = "Crawler",
		maxHealth     = 60,
		walkSpeed     = 24,
		damage        = 10,
		attackRange   = 5,
		chaseRange    = 50,
		attackCooldown = 0.8,
		size          = Vector3.new(3, 1.5, 4),
		color         = BrickColor.new("Reddish brown"),
		coopRequired  = 1,
		count         = 3,
	},
	TITAN = {
		name          = "Titan",
		maxHealth     = 300,
		walkSpeed     = 10,
		damage        = 40,
		attackRange   = 7,
		chaseRange    = 40,
		attackCooldown = 2.0,
		size          = Vector3.new(5, 6, 4),
		color         = BrickColor.new("Dark orange"),
		coopRequired  = 2,
		staggerRadius = 15,
		count         = 1,
	},
}

-- ── Helpers ───────────────────────────────────────────────────────────────────

local function randomSpawnPoint(heightOffset)
	for attempt = 1, 10 do
		local angle  = math.random() * math.pi * 2
		local radius = 8 + math.random() * 25
		local x = ARENA_CENTER.X + math.cos(angle) * radius
		local z = ARENA_CENTER.Z + math.sin(angle) * radius
		local floorY = findFloorY(x, z, nil)
		if floorY and floorY > -100 then
			return Vector3.new(x, floorY + heightOffset, z)
		end
	end
	-- Fallback: arena center with known floor
	local floorY = findFloorY(ARENA_CENTER.X, ARENA_CENTER.Z, nil) or ARENA_CENTER.Y
	return Vector3.new(ARENA_CENTER.X, floorY + heightOffset, ARENA_CENTER.Z)
end

local function getNearestPlayer(pos)
	local nearest, dist = nil, math.huge
	for _, p in ipairs(Players:GetPlayers()) do
		local char = p.Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if hrp then
			local d = (hrp.Position - pos).Magnitude
			if d < dist then nearest = p; dist = d end
		end
	end
	return nearest, dist
end

local function getPlayersWithin(pos, radius)
	local found = {}
	for _, p in ipairs(Players:GetPlayers()) do
		local char = p.Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if hrp and (hrp.Position - pos).Magnitude <= radius then
			table.insert(found, p)
		end
	end
	return found
end

local function isCloaked(player)
	local char = player.Character
	local hum  = char and char:FindFirstChildOfClass("Humanoid")
	return hum and hum:GetAttribute("OMC_Cloaked") == true
end

-- ── Build enemy model ─────────────────────────────────────────────────────────

local function buildEnemy(cfg, spawnPos)
	local model = Instance.new("Model")
	model.Name  = cfg.name

	-- Single visible body part — anchored=false, CanCollide=true for physics
	local root = Instance.new("Part")
	root.Name        = "HumanoidRootPart"
	root.Size        = cfg.size
	root.BrickColor  = cfg.color
	root.Material    = Enum.Material.SmoothPlastic
	root.Anchored    = false
	root.CanCollide  = true
	root.CFrame      = CFrame.new(spawnPos)
	root.Parent      = model

	-- BodyVelocity — horizontal movement drive (we control Y via floor-pin)
	local bv = Instance.new("BodyVelocity")
	bv.Name     = "GroundDrive"
	bv.Velocity = Vector3.new(0, 0, 0)
	bv.MaxForce = Vector3.new(1e5, 0, 1e5)  -- NO Y force — gravity handles descent
	bv.Parent   = root

	-- BodyGyro — keep upright
	local bg = Instance.new("BodyGyro")
	bg.MaxTorque = Vector3.new(1e6, 1e6, 1e6)
	bg.D = 500
	bg.CFrame = CFrame.new(spawnPos)
	bg.Parent = root

	-- Eyes
	local eyeL = Instance.new("Part")
	eyeL.Name = "EyeL"; eyeL.Size = Vector3.new(0.4,0.4,0.2)
	eyeL.BrickColor = BrickColor.new("Bright red")
	eyeL.Material = Enum.Material.Neon
	eyeL.Anchored = false; eyeL.CanCollide = false
	eyeL.Parent = model
	local wL = Instance.new("Weld")
	wL.Part0=root; wL.Part1=eyeL
	wL.C1 = CFrame.new(-cfg.size.X*0.25, cfg.size.Y*0.3, -cfg.size.Z*0.5)
	wL.Parent = root

	local eyeR = eyeL:Clone()
	eyeR.Name = "EyeR"; eyeR.Parent = model
	local wR = Instance.new("Weld")
	wR.Part0=root; wR.Part1=eyeR
	wR.C1 = CFrame.new(cfg.size.X*0.25, cfg.size.Y*0.3, -cfg.size.Z*0.5)
	wR.Parent = root

	-- Humanoid — health/damage tracking only (NOT used for movement)
	local hum = Instance.new("Humanoid")
	hum.RigType    = Enum.HumanoidRigType.R6
	hum.MaxHealth  = cfg.maxHealth
	hum.Health     = cfg.maxHealth
	hum.WalkSpeed  = 0   -- disabled: we drive with BodyVelocity
	hum.AutoRotate = false
	hum.Parent     = model

	model.PrimaryPart = root

	model:SetAttribute("OMC_Archetype",    "ground_" .. string.lower(cfg.name))
	model:SetAttribute("OMC_MaxHealth",    cfg.maxHealth)
	model:SetAttribute("OMC_CoopRequired", cfg.coopRequired)

	model.Parent = workspace
	return model, root, hum, bv, bg
end

-- ── FSM ───────────────────────────────────────────────────────────────────────

local function runEnemyFSM(model, root, hum, bv, bg, cfg)
	local state         = "PATROL"
	local patrolAngle   = math.random() * math.pi * 2
	local patrolOrigin  = root.Position
	local lastAttack    = 0
	local staggerTimer  = 0
	local floorY        = root.Position.Y  -- track last known floor
	local frameCount    = 0

	model:SetAttribute("OMC_FSMState", state)

	RunService.Heartbeat:Connect(function(dt)
		if not model.Parent then return end

		if hum.Health <= 0 then
			model:SetAttribute("OMC_FSMState", "DEAD")
			bv.Velocity = Vector3.new(0, 0, 0)
			task.delay(10, function()
				if model.Parent then model:Destroy() end
				task.wait(0.5)
				buildAndRunEnemy(cfg)
			end)
			model:Destroy()
			return
		end

		local rootPos = root.Position

		-- ── Floor pin (every 3 frames to reduce cost) ──────────────────────────
		frameCount += 1
		if frameCount % 3 == 0 then
			local detected = findFloorY(rootPos.X, rootPos.Z, model)
			if detected and detected > -100 then
				floorY = detected
			end
		end

		-- If we've fallen too far below the last known floor, teleport back
		local targetY = floorY + cfg.size.Y / 2
		if rootPos.Y < floorY - 3 then
			root.CFrame = CFrame.new(rootPos.X, targetY, rootPos.Z)
			bv.Velocity = Vector3.new(0, 0, 0)
		end

		-- ── Targeting (skip cloaked) ────────────────────────────────────────────
		local nearest, dist = nil, math.huge
		for _, p in ipairs(Players:GetPlayers()) do
			if not isCloaked(p) then
				local char = p.Character
				local hrp  = char and char:FindFirstChild("HumanoidRootPart")
				if hrp then
					local d = (hrp.Position - rootPos).Magnitude
					if d < dist then nearest = p; dist = d end
				end
			end
		end

		-- ── State machine ──────────────────────────────────────────────────────
		if state == "PATROL" then
			patrolAngle += dt * 0.4
			local tx = patrolOrigin.X + math.cos(patrolAngle) * 18
			local tz = patrolOrigin.Z + math.sin(patrolAngle) * 18
			local dir = Vector3.new(tx - rootPos.X, 0, tz - rootPos.Z)
			if dir.Magnitude > 0.5 then
				local moveDir = dir.Unit
				bv.Velocity = moveDir * (cfg.walkSpeed * 0.5)
				bg.CFrame = CFrame.lookAt(rootPos, rootPos + moveDir)
			else
				bv.Velocity = Vector3.new(0, 0, 0)
			end
			if nearest and dist < cfg.chaseRange then
				state = "CHASE"
				model:SetAttribute("OMC_FSMState", "CHASE")
			end

		elseif state == "CHASE" then
			if not nearest or dist > cfg.chaseRange * 1.3 then
				state = "PATROL"
				model:SetAttribute("OMC_FSMState", "PATROL")
				return
			end
			local tHRP = nearest.Character and nearest.Character:FindFirstChild("HumanoidRootPart")
			if tHRP then
				local dir = (tHRP.Position - rootPos)
				local flatDir = Vector3.new(dir.X, 0, dir.Z)
				if flatDir.Magnitude > 0.5 then
					local moveDir = flatDir.Unit
					bv.Velocity = moveDir * cfg.walkSpeed
					bg.CFrame = CFrame.lookAt(rootPos, rootPos + moveDir)
				end
			end
			if dist <= cfg.attackRange then
				state = "ATTACK"
				bv.Velocity = Vector3.new(0, 0, 0)
				model:SetAttribute("OMC_FSMState", "ATTACK")
			end

		elseif state == "ATTACK" then
			bv.Velocity = Vector3.new(0, 0, 0)
			if not nearest or dist > cfg.attackRange * 1.5 then
				state = "CHASE"
				model:SetAttribute("OMC_FSMState", "CHASE")
				return
			end

			local now = tick()
			if now - lastAttack >= cfg.attackCooldown then
				lastAttack = now
				local tChar = nearest.Character
				local tHum  = tChar and tChar:FindFirstChildOfClass("Humanoid")

				if cfg.name == "TITAN" then
					local nearby = getPlayersWithin(rootPos, cfg.staggerRadius or 15)
					model:SetAttribute("OMC_CoopStaggerReady", #nearby >= 2)
				end

				if tHum and tHum:GetAttribute("OMC_Cloaked") ~= true then
					tHum:TakeDamage(cfg.damage)
					print(string.format("[%s] Attacked %s for %d dmg",
						cfg.name, nearest.Name, cfg.damage))
				end
			end

		elseif state == "STAGGER" then
			staggerTimer -= dt
			bv.Velocity = Vector3.new(0, 0, 0)
			if staggerTimer <= 0 then
				state = "CHASE"
				model:SetAttribute("OMC_FSMState", "CHASE")
			end
		end
	end)

	-- Titan stagger trigger
	if cfg.name == "TITAN" then
		RunService.Heartbeat:Connect(function()
			if not model.Parent or state ~= "ATTACK" then return end
			local rootPos = root.Position
			local nearby = getPlayersWithin(rootPos, cfg.staggerRadius or 15)
			if #nearby >= 2 then
				state = "STAGGER"
				staggerTimer = 2.5
				model:SetAttribute("OMC_FSMState", "STAGGER")
				local knockbv = Instance.new("BodyVelocity")
				knockbv.Velocity  = Vector3.new(math.random(-20,20), 8, math.random(-20,20))
				knockbv.MaxForce  = Vector3.new(1e5,1e5,1e5)
				knockbv.Parent    = root
				Debris:AddItem(knockbv, 0.3)
				print("[TITAN] Staggered by co-op attack!")
			end
		end)
	end
end

-- ── Spawn wrapper ─────────────────────────────────────────────────────────────

function buildAndRunEnemy(cfg)
	local heightOffset = cfg.size.Y / 2 + 1  -- spawn 1 stud above floor
	local spawnPos = randomSpawnPoint(heightOffset)
	local model, root, hum, bv, bg = buildEnemy(cfg, spawnPos)
	runEnemyFSM(model, root, hum, bv, bg, cfg)
	print(string.format("[GROUND] %s spawned at (%.0f, %.1f, %.0f)",
		cfg.name, spawnPos.X, spawnPos.Y, spawnPos.Z))
end

-- ── Initial spawn ─────────────────────────────────────────────────────────────

-- Wait for arena geometry to fully load before spawning
task.wait(6)

-- Sanity check floor at arena center
local testY = findFloorY(ARENA_CENTER.X, ARENA_CENTER.Z, nil)
print(string.format("[GROUND] Floor probe at arena center (%.0f, %.0f): Y=%.1f",
	ARENA_CENTER.X, ARENA_CENTER.Z, testY or -999))

for i = 1, ENEMY_CFG.CRAWLER.count do
	buildAndRunEnemy(ENEMY_CFG.CRAWLER)
	task.wait(0.3)
end

for i = 1, ENEMY_CFG.TITAN.count do
	buildAndRunEnemy(ENEMY_CFG.TITAN)
end

print(string.format("[GROUND] %d Crawlers + %d Titan active",
	ENEMY_CFG.CRAWLER.count, ENEMY_CFG.TITAN.count))
