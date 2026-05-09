-- =============================================================================
-- BuildGroundEnemies
-- Spawns two ground enemy types:
--   CRAWLER — fast, low, swarms players, weak (60HP)
--   TITAN   — slow, heavy, high damage, requires 2 players to stagger (300HP)
-- FSM: PATROL → CHASE → ATTACK → STAGGER → DEAD
-- Titan co-op stagger gate: requires 2 players within 15 studs to knock back
-- =============================================================================

local ENABLE_ON_BOOT = true
print("[GROUND-ENEMIES] Script loaded")

local RunService    = game:GetService("RunService")
local Players       = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")

if not ENABLE_ON_BOOT then return end

local ARENA_CENTER = Vector3.new(1012, 60, 1007)
local ARENA_RADIUS = 50

local ENEMY_CFG = {
	CRAWLER = {
		name          = "Crawler",
		maxHealth     = 60,
		walkSpeed     = 24,
		damage        = 10,
		attackRange   = 4,
		chaseRange    = 50,
		attackCooldown = 0.8,
		size          = Vector3.new(3, 1.5, 4),
		color         = BrickColor.new("Reddish brown"),
		coopRequired  = 1,   -- solo kill OK
		count         = 3,   -- spawn 3 crawlers
	},
	TITAN = {
		name          = "Titan",
		maxHealth     = 300,
		walkSpeed     = 10,
		damage        = 40,
		attackRange   = 6,
		chaseRange    = 40,
		attackCooldown = 2.0,
		size          = Vector3.new(5, 6, 4),
		color         = BrickColor.new("Dark orange"),
		coopRequired  = 2,   -- requires 2 players to stagger
		staggerRadius = 15,  -- both players must be within this
		count         = 1,
	},
}

-- ── Helpers ───────────────────────────────────────────────────────────────────

local function randomSpawnPoint(yOffset)
	local angle  = math.random() * math.pi * 2
	local radius = 20 + math.random() * ARENA_RADIUS
	return Vector3.new(
		ARENA_CENTER.X + math.cos(angle) * radius,
		ARENA_CENTER.Y + (yOffset or 0),
		ARENA_CENTER.Z + math.sin(angle) * radius
	)
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

	local root = Instance.new("Part")
	root.Name        = "HumanoidRootPart"
	root.Size        = cfg.size
	root.BrickColor  = cfg.color
	root.Material    = Enum.Material.SmoothPlastic
	root.Anchored    = false
	root.CanCollide  = true
	root.CFrame      = CFrame.new(spawnPos)
	root.Parent      = model

	-- Eyes
	local eyeL = Instance.new("Part")
	eyeL.Name = "EyeL"; eyeL.Size = Vector3.new(0.4,0.4,0.2)
	eyeL.BrickColor = BrickColor.new("Bright red")
	eyeL.Material = Enum.Material.Neon
	eyeL.Anchored = false; eyeL.CanCollide = false
	eyeL.Parent = model
	local wL = Instance.new("Weld")
	wL.Part0=root; wL.Part1=eyeL
	wL.C1 = CFrame.new(-0.5, cfg.size.Y*0.3, -cfg.size.Z*0.5)
	wL.Parent = root

	local eyeR = eyeL:Clone()
	eyeR.Name = "EyeR"; eyeR.Parent = model
	local wR = Instance.new("Weld")
	wR.Part0=root; wR.Part1=eyeR
	wR.C1 = CFrame.new(0.5, cfg.size.Y*0.3, -cfg.size.Z*0.5)
	wR.Parent = root

	local hum = Instance.new("Humanoid")
	hum.RigType    = Enum.HumanoidRigType.R6
	hum.MaxHealth  = cfg.maxHealth
	hum.Health     = cfg.maxHealth
	hum.WalkSpeed  = cfg.walkSpeed
	hum.Parent     = model

	model.PrimaryPart = root

	-- OMC attributes
	model:SetAttribute("OMC_Archetype",    "ground_" .. string.lower(cfg.name))
	model:SetAttribute("OMC_MaxHealth",    cfg.maxHealth)
	model:SetAttribute("OMC_CoopRequired", cfg.coopRequired)

	model.Parent = workspace
	return model, root, hum
end

-- ── FSM ───────────────────────────────────────────────────────────────────────

local function runEnemyFSM(model, root, hum, cfg)
	local state         = "PATROL"
	local patrolAngle   = math.random() * math.pi * 2
	local patrolOrigin  = root.Position
	local lastAttack    = 0
	local staggerTimer  = 0

	model:SetAttribute("OMC_FSMState", state)

	RunService.Heartbeat:Connect(function(dt)
		if not model.Parent then return end
		if hum.Health <= 0 then
			model:SetAttribute("OMC_FSMState", "DEAD")
			-- Respawn after 10s
			task.delay(10, function()
				if model.Parent then model:Destroy() end
				task.wait(1)
				buildAndRunEnemy(cfg)
			end)
			model:Destroy()
			return
		end

		local rootPos = root.Position

		-- Skip cloaked players in targeting
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

		if state == "PATROL" then
			patrolAngle += dt * 0.3
			local tx = patrolOrigin.X + math.cos(patrolAngle) * 20
			local tz = patrolOrigin.Z + math.sin(patrolAngle) * 20
			local dir = Vector3.new(tx - rootPos.X, 0, tz - rootPos.Z)
			if dir.Magnitude > 0.1 then
				root.CFrame = root.CFrame:Lerp(
					CFrame.new(rootPos, rootPos + dir),
					dt * 3
				)
				hum:MoveTo(Vector3.new(tx, rootPos.Y, tz))
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
				hum:MoveTo(tHRP.Position)
			end
			if dist <= cfg.attackRange then
				state = "ATTACK"
				model:SetAttribute("OMC_FSMState", "ATTACK")
			end

		elseif state == "ATTACK" then
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

				-- Titan co-op stagger gate
				if cfg.name == "TITAN" then
					local nearby = getPlayersWithin(rootPos, cfg.staggerRadius or 15)
					model:SetAttribute("OMC_CoopStaggerReady", #nearby >= 2)
				end

				if tHum and tHum:GetAttribute("OMC_Cloaked") ~= true then
					tHum:TakeDamage(cfg.damage)
				end
			end

		elseif state == "STAGGER" then
			staggerTimer -= dt
			hum.WalkSpeed = 0
			if staggerTimer <= 0 then
				hum.WalkSpeed = cfg.walkSpeed
				state = "CHASE"
				model:SetAttribute("OMC_FSMState", "CHASE")
			end
		end
	end)

	-- Titan stagger trigger — 2 players nearby deal bonus knockback
	if cfg.name == "TITAN" then
		RunService.Heartbeat:Connect(function(dt)
			if not model.Parent then return end
			local rootPos = root.Position
			local nearby = getPlayersWithin(rootPos, cfg.staggerRadius or 15)
			if #nearby >= 2 and state == "ATTACK" then
				state = "STAGGER"
				staggerTimer = 2.5
				model:SetAttribute("OMC_FSMState", "STAGGER")
				-- Knockback
				local bv = Instance.new("BodyVelocity")
				bv.Velocity  = Vector3.new(math.random(-20,20), 15, math.random(-20,20))
				bv.MaxForce  = Vector3.new(1e4,1e4,1e4)
				bv.Parent    = root
				game:GetService("Debris"):AddItem(bv, 0.4)
				print("[TITAN] Staggered by co-op attack!")
			end
		end)
	end
end

-- ── Spawn wrapper (needed for respawn reference) ──────────────────────────────

function buildAndRunEnemy(cfg)
	local spawnPos = randomSpawnPoint(cfg.size.Y / 2)
	local model, root, hum = buildEnemy(cfg, spawnPos)
	runEnemyFSM(model, root, hum, cfg)
	print(string.format("[GROUND] %s spawned at (%.0f, %.0f, %.0f)",
		cfg.name, spawnPos.X, spawnPos.Y, spawnPos.Z))
end

-- ── Initial spawn ─────────────────────────────────────────────────────────────

task.wait(2)

for i = 1, ENEMY_CFG.CRAWLER.count do
	buildAndRunEnemy(ENEMY_CFG.CRAWLER)
	task.wait(0.2)
end

for i = 1, ENEMY_CFG.TITAN.count do
	buildAndRunEnemy(ENEMY_CFG.TITAN)
end

print(string.format("[GROUND] %d Crawlers + %d Titan spawned",
	ENEMY_CFG.CRAWLER.count, ENEMY_CFG.TITAN.count))
