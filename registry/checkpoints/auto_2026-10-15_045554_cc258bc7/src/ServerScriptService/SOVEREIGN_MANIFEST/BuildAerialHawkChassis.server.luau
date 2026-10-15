-- =============================================================================
-- BuildAerialHawkChassis
-- Wraps the Bald Eagle mesh asset into a full combat-ready aerial enemy chassis.
-- HumanoidRootPart = physics root (BodyVelocity drives movement)
-- Eagle mesh welded to root as pure visual
-- Humanoid present for health/damage compatibility with VictimService
-- FSM: PATROL → CHASE → DIVE → RECOVER → STUNNED → DEAD
-- Co-op kill gate: requires 2 players within 20 studs
-- =============================================================================

local ENABLE_ON_BOOT = true
print("[HAWK] Script loaded — ENABLE_ON_BOOT:", ENABLE_ON_BOOT)

-- ── Mesh Config (from Bald Eagle asset) ──────────────────────────────────────
local MESH_ID    = "http://www.roblox.com/asset/?id=120647529"
local TEXTURE_ID = "http://www.roblox.com/asset/?id=120647378"
local MESH_SCALE = Vector3.new(1.25, 1.25, 1.25)

-- ── Archetype Config ──────────────────────────────────────────────────────────
local CFG = {
	name           = "AerialHawk",
	maxHealth      = 120,
	hoverHeight    = 18,   -- studs above spawn point
	patrolRadius   = 60,   -- studs
	chaseRange     = 45,   -- studs — aggro range
	diveSpeed      = 60,   -- studs/s
	diveRange      = 12,   -- studs — switches to dive when player within this
	recoverTime    = 2.2,  -- seconds after dive before re-entering PATROL
	coopKillRadius = 20,   -- studs — both players must be within this to finish
	coopKillCount  = 2,    -- players required for co-op kill
}

-- ── Services ──────────────────────────────────────────────────────────────────
local ServerStorage   = game:GetService("ServerStorage")
local RunService      = game:GetService("RunService")
local Players         = game:GetService("Players")

if not ENABLE_ON_BOOT then return end

-- ── Build chassis ─────────────────────────────────────────────────────────────
local function buildChassis()
	local model = Instance.new("Model")
	model.Name  = CFG.name

	-- Single physics+visual part — mesh lives here, BodyVelocity drives it directly
	-- No separate root needed; eliminates weld separation issues
	local root = Instance.new("Part")
	root.Name        = "HumanoidRootPart"
	root.Size        = Vector3.new(2, 1, 3)
	root.Anchored    = false
	root.CanCollide  = false
	root.CastShadow  = true
	root.Parent      = model

	local mesh = Instance.new("SpecialMesh")
	mesh.MeshType  = Enum.MeshType.FileMesh
	mesh.MeshId    = MESH_ID
	mesh.TextureId = TEXTURE_ID
	mesh.Scale     = MESH_SCALE
	mesh.Parent    = root

	-- BodyVelocity — aerial drive (NOT Humanoid.WalkSpeed)
	local bv = Instance.new("BodyVelocity")
	bv.Name     = "AerialDrive"
	bv.Velocity = Vector3.new(0, 0, 0)
	bv.MaxForce = Vector3.new(1e4, 1e4, 1e4)
	bv.Parent   = root

	-- BodyGyro — orientation hold
	local bg = Instance.new("BodyGyro")
	bg.Name      = "AerialGyro"
	bg.MaxTorque = Vector3.new(1e5, 1e5, 1e5)
	bg.D         = 100
	bg.Parent    = root

	-- Humanoid — health/damage, VictimService compatibility
	local hum = Instance.new("Humanoid")
	hum.RigType   = Enum.HumanoidRigType.R6
	hum.MaxHealth = CFG.maxHealth
	hum.Health    = CFG.maxHealth
	hum.WalkSpeed = 0  -- aerial: NEVER use WalkSpeed
	hum.Parent    = model

	model.PrimaryPart = root

	-- OMC attributes for director contract
	model:SetAttribute("OMC_Archetype",      "aerial")
	model:SetAttribute("OMC_MaxHealth",      CFG.maxHealth)
	model:SetAttribute("OMC_HoverHeight",    CFG.hoverHeight)
	model:SetAttribute("OMC_DiveSpeed",      CFG.diveSpeed)
	model:SetAttribute("OMC_CoopKillRadius", CFG.coopKillRadius)
	model:SetAttribute("OMC_CoopKillCount",  CFG.coopKillCount)
	model:SetAttribute("OMC_PrimerVersion",  "1.0.0")
	model:SetAttribute("OMC_MeshGrounded",   true)

	return model
end

-- ── FSM helpers ───────────────────────────────────────────────────────────────
local function getNearestPlayer(rootPos)
	local nearest, dist = nil, math.huge
	for _, p in ipairs(Players:GetPlayers()) do
		local char = p.Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if hrp then
			local d = (hrp.Position - rootPos).Magnitude
			if d < dist then nearest = p; dist = d end
		end
	end
	return nearest, dist
end

local function getPlayersWithinRadius(rootPos, radius)
	local found = {}
	for _, p in ipairs(Players:GetPlayers()) do
		local char = p.Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if hrp and (hrp.Position - rootPos).Magnitude <= radius then
			table.insert(found, p)
		end
	end
	return found
end

-- ── FSM ───────────────────────────────────────────────────────────────────────
local function runFSM(model)
	local root = model:FindFirstChild("HumanoidRootPart")
	local hum  = model:FindFirstChildOfClass("Humanoid")
	local bv   = root and root:FindFirstChild("AerialDrive")
	local bg   = root and root:FindFirstChild("AerialGyro")
	if not (root and hum and bv and bg) then
		warn("[HAWK FSM] Missing required parts — aborting")
		return
	end

	local state        = "PATROL"
	local patrolAngle  = 0
	local patrolOrigin = root.Position
	local recoverTimer = 0

	model:SetAttribute("OMC_FSMState", state)

	RunService.Heartbeat:Connect(function(dt)
		if not model.Parent then return end

		if hum.Health <= 0 then
			state = "DEAD"
			bv.Velocity = Vector3.new(0, 0, 0)
			model:SetAttribute("OMC_FSMState", "DEAD")
			return
		end

		local rootPos       = root.Position
		local nearest, dist = getNearestPlayer(rootPos)
		local targetY       = patrolOrigin.Y + CFG.hoverHeight
		local yCorrect      = (targetY - rootPos.Y) * 3

		if state == "PATROL" then
			patrolAngle += dt * 0.4
			local px  = patrolOrigin.X + math.cos(patrolAngle) * CFG.patrolRadius
			local pz  = patrolOrigin.Z + math.sin(patrolAngle) * CFG.patrolRadius
			local dir = Vector3.new(px - rootPos.X, yCorrect, pz - rootPos.Z)
			bv.Velocity = dir.Unit * 18
			bg.CFrame   = CFrame.lookAt(rootPos, rootPos + dir)
			if nearest and dist < CFG.chaseRange then
				state = "CHASE"
				model:SetAttribute("OMC_FSMState", "CHASE")
			end

		elseif state == "CHASE" then
			if not nearest or dist > CFG.chaseRange * 1.3 then
				state = "PATROL"
				model:SetAttribute("OMC_FSMState", "PATROL")
				return
			end
			local tHRP = nearest.Character and nearest.Character:FindFirstChild("HumanoidRootPart")
			if not tHRP then return end
			local toTarget = tHRP.Position - rootPos
			bv.Velocity = toTarget.Unit * 28
			bg.CFrame   = CFrame.lookAt(rootPos, rootPos + toTarget)
			local heightAbove = rootPos.Y - tHRP.Position.Y
			if dist < CFG.diveRange and heightAbove > 8 then
				state = "DIVE"
				model:SetAttribute("OMC_FSMState", "DIVE")
			end

		elseif state == "DIVE" then
			if not nearest then state = "RECOVER"; return end
			local tHRP = nearest.Character and nearest.Character:FindFirstChild("HumanoidRootPart")
			if not tHRP then state = "RECOVER"; return end
			local toTarget = tHRP.Position - rootPos
			bv.Velocity = toTarget.Unit * CFG.diveSpeed
			bg.CFrame   = CFrame.lookAt(rootPos, rootPos + toTarget)
			if dist < 4 then
				local tHum = nearest.Character:FindFirstChildOfClass("Humanoid")
				if tHum then tHum:TakeDamage(30) end
				state = "RECOVER"
				recoverTimer = CFG.recoverTime
				model:SetAttribute("OMC_FSMState", "RECOVER")
			end

		elseif state == "RECOVER" then
			recoverTimer -= dt
			bv.Velocity = Vector3.new(0, 20, 0)
			if recoverTimer <= 0 then
				state = "PATROL"
				model:SetAttribute("OMC_FSMState", "PATROL")
			end

		elseif state == "STUNNED" then
			bv.Velocity = Vector3.new(0, 0, 0)
			if model:GetAttribute("OMC_Stunned") ~= true then
				state = "PATROL"
				model:SetAttribute("OMC_FSMState", "PATROL")
			end
		end

		-- Co-op kill gate
		local nearby = getPlayersWithinRadius(rootPos, CFG.coopKillRadius)
		model:SetAttribute("OMC_CoopKillReady", #nearby >= CFG.coopKillCount)
	end)
end

-- ── Spawn ─────────────────────────────────────────────────────────────────────
task.wait(1)

local hawk = buildChassis()
hawk.Parent = workspace

local root = hawk:FindFirstChild("HumanoidRootPart")
if root then
	-- Spawn directly above the first player who joins
	local spawnCF = CFrame.new(1012, 80, 1007)  -- 22 studs above arena floor
	local Players = game:GetService("Players")
	local plrs = Players:GetPlayers()
	if #plrs > 0 then
		local char = plrs[1].Character
		local hrp  = char and char:FindFirstChild("HumanoidRootPart")
		if hrp then
			spawnCF = hrp.CFrame + Vector3.new(0, 30, 0)
		end
	end
	root.CFrame = spawnCF
	print("[HAWK] Spawned at:", root.Position)
end

-- Register template
local templates = ServerStorage:FindFirstChild("MonsterTemplates")
if not templates then
	templates = Instance.new("Folder")
	templates.Name = "MonsterTemplates"
	templates.Parent = ServerStorage
end
local existing = templates:FindFirstChild("AerialHawk_Template")
if existing then existing:Destroy() end
local clone = hawk:Clone()
clone.Name   = "AerialHawk_Template"
clone.Parent = templates

runFSM(hawk)

print("[HAWK] AerialHawk spawned — FSM running. State: PATROL")
print("[HAWK] MeshGrounded:", hawk:GetAttribute("OMC_MeshGrounded"))
print("[HAWK] CoopKillCount:", CFG.coopKillCount, "| CoopKillRadius:", CFG.coopKillRadius)
