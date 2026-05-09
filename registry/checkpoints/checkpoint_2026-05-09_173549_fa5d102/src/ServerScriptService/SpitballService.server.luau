-- =============================================================================
-- SpitballService
-- Handles spitball projectile firing. Arcing projectile, AOE on impact.
-- Damages enemies only (no PvP). Consumes OMC_SpitballCharges attribute.
-- =============================================================================

local Players    = game:GetService("Players")
local Debris     = game:GetService("Debris")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local SPITBALL_CFG = {
	speed      = 60,    -- studs/s launch speed
	gravity    = 35,    -- arc gravity
	radius     = 6,     -- AOE blast radius studs
	damage     = 45,    -- damage per hit
	size       = 1.2,   -- ball size
	lifetime   = 8,     -- seconds before cleanup
}

local function ensureRemote(name, class)
	local evts = ReplicatedStorage:FindFirstChild("OMC")
		and ReplicatedStorage.OMC:FindFirstChild("Events")
	if not evts then return end
	local r = evts:FindFirstChild(name)
	if r then return r end
	r = Instance.new(class)
	r.Name = name
	r.Parent = evts
	return r
end

-- Wait for OMC events folder
local eventsFolder
local attempts = 0
repeat
	task.wait(0.5)
	attempts += 1
	local omc = ReplicatedStorage:FindFirstChild("OMC")
	eventsFolder = omc and omc:FindFirstChild("Events")
until eventsFolder or attempts > 20

if not eventsFolder then
	warn("[SPITBALL] Events folder not found — service aborted")
	return
end

local SpitballFire = Instance.new("RemoteEvent")
SpitballFire.Name   = "SpitballFire"
SpitballFire.Parent = eventsFolder

SpitballFire.OnServerEvent:Connect(function(player, origin, direction)
	local char = player.Character
	local hum  = char and char:FindFirstChildOfClass("Humanoid")
	if not hum then return end

	-- Check charges
	local charges = hum:GetAttribute("OMC_SpitballCharges") or 0
	if charges <= 0 then return end
	hum:SetAttribute("OMC_SpitballCharges", charges - 1)

	-- Create projectile
	local ball = Instance.new("Part")
	ball.Name        = "Spitball"
	ball.Shape       = Enum.PartType.Ball
	ball.Size        = Vector3.new(SPITBALL_CFG.size, SPITBALL_CFG.size, SPITBALL_CFG.size)
	ball.BrickColor  = BrickColor.new("Bright green")
	ball.Material    = Enum.Material.Neon
	ball.Transparency = 0.2
	ball.CanCollide  = true
	ball.Anchored    = false
	ball.CFrame      = CFrame.new(origin)
	ball.Parent      = workspace

	Debris:AddItem(ball, SPITBALL_CFG.lifetime)

	-- Launch with arc
	local bv = Instance.new("BodyVelocity")
	bv.Velocity  = direction.Unit * SPITBALL_CFG.speed
	bv.MaxForce  = Vector3.new(1e4, 1e4, 1e4)
	bv.Parent    = ball

	-- Apply gravity arc
	local bg = Instance.new("BodyForce")
	bg.Force  = Vector3.new(0, -workspace.Gravity * ball:GetMass() * (SPITBALL_CFG.gravity / workspace.Gravity), 0)
	bg.Parent = ball

	local hit = false
	ball.Touched:Connect(function(other)
		if hit then return end
		-- Ignore the shooter
		if other:IsDescendantOf(char) then return end
		-- Ignore other players
		local otherPlayer = Players:GetPlayerFromCharacter(other.Parent)
		if otherPlayer then return end

		hit = true
		ball:Destroy()

		-- AOE blast — damage all enemies within radius
		local blastPos = ball.Position
		for _, obj in ipairs(workspace:GetDescendants()) do
			if obj:IsA("Humanoid") and obj.Health > 0 then
				local rootPart = obj.Parent and obj.Parent:FindFirstChild("HumanoidRootPart")
				if rootPart then
					local dist = (rootPart.Position - blastPos).Magnitude
					if dist <= SPITBALL_CFG.radius then
						-- Don't damage players
						local isPlayer = false
						for _, p in ipairs(Players:GetPlayers()) do
							if p.Character == obj.Parent then
								isPlayer = true
								break
							end
						end
						if not isPlayer then
							obj:TakeDamage(SPITBALL_CFG.damage)
							print(string.format("[SPITBALL] Hit %s for %d damage", obj.Parent.Name, SPITBALL_CFG.damage))
						end
					end
				end
			end
		end

		-- Visual blast effect
		local blast = Instance.new("Part")
		blast.Shape       = Enum.PartType.Ball
		blast.Size        = Vector3.new(SPITBALL_CFG.radius * 2, SPITBALL_CFG.radius * 2, SPITBALL_CFG.radius * 2)
		blast.Anchored    = true
		blast.CanCollide  = false
		blast.Material    = Enum.Material.Neon
		blast.BrickColor  = BrickColor.new("Bright green")
		blast.Transparency = 0.5
		blast.CFrame      = CFrame.new(blastPos)
		blast.Parent      = workspace
		Debris:AddItem(blast, 0.3)
	end)
end)

print("[SPITBALL] Service initialized")
