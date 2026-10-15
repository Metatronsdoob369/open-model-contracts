-- =============================================================================
-- JetpackThrowService
-- Jetpack teammate throw mechanic.
-- Thrower selects a teammate (private select OR broadcast offer).
-- First responder to broadcast is selected.
-- Thrown player becomes a projectile — 1-shot kills AerialHawk on contact.
-- =============================================================================

local Players    = game:GetService("Players")
local Debris     = game:GetService("Debris")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local THROW_CFG = {
	speed         = 120,   -- studs/s throw speed
	hawkKillRange = 8,     -- studs — contact range to 1-shot hawk
	offerTimeout  = 5,     -- seconds broadcast offer stays open
}

-- Wait for events folder
local eventsFolder
local attempts = 0
repeat
	task.wait(0.5)
	attempts += 1
	local omc = ReplicatedStorage:FindFirstChild("OMC")
	eventsFolder = omc and omc:FindFirstChild("Events")
until eventsFolder or attempts > 20

if not eventsFolder then
	warn("[JETPACK-THROW] Events folder not found")
	return
end

-- RemoteEvents
local function makeRemote(name)
	local r = eventsFolder:FindFirstChild(name)
	if r then return r end
	r = Instance.new("RemoteEvent")
	r.Name = name; r.Parent = eventsFolder
	return r
end

local ThrowOffer    = makeRemote("JetpackThrowOffer")     -- server→all: broadcast offer
local ThrowAccept   = makeRemote("JetpackThrowAccept")    -- client→server: teammate accepts
local ThrowExecute  = makeRemote("JetpackThrowExecute")   -- server→client: you are being thrown
local ThrowRequest  = makeRemote("JetpackThrowRequest")   -- client→server: thrower initiates

-- Pending offers: thrower → { target=player|nil, timer }
local pendingOffers = {}

ThrowRequest.OnServerEvent:Connect(function(thrower, targetPlayer)
	-- targetPlayer = specific player (private) or nil (broadcast)
	local throwerChar = thrower.Character
	local throwerHRP  = throwerChar and throwerChar:FindFirstChild("HumanoidRootPart")
	if not throwerHRP then return end

	if pendingOffers[thrower] then return end  -- already has active offer

	local offer = {
		thrower  = thrower,
		target   = targetPlayer,
		accepted = false,
	}
	pendingOffers[thrower] = offer

	if targetPlayer then
		-- Private offer — send only to target
		ThrowOffer:FireClient(targetPlayer, thrower.Name, false)
	else
		-- Broadcast offer — send to all other players
		for _, p in ipairs(Players:GetPlayers()) do
			if p ~= thrower then
				ThrowOffer:FireClient(p, thrower.Name, true)
			end
		end
	end

	-- Timeout
	task.delay(THROW_CFG.offerTimeout, function()
		if pendingOffers[thrower] and not pendingOffers[thrower].accepted then
			pendingOffers[thrower] = nil
			print(string.format("[JETPACK-THROW] %s offer timed out", thrower.Name))
		end
	end)
end)

ThrowAccept.OnServerEvent:Connect(function(accepter)
	-- Find which thrower offered to this player
	local offer = nil
	local offerThrower = nil
	for thrower, o in pairs(pendingOffers) do
		if o.accepted then continue end
		if o.target == accepter or o.target == nil then
			offer = o
			offerThrower = thrower
			break
		end
	end
	if not offer then return end
	offer.accepted = true
	pendingOffers[offerThrower] = nil

	local throwerChar = offerThrower.Character
	local throwerHRP  = throwerChar and throwerChar:FindFirstChild("HumanoidRootPart")
	local accepterChar = accepter.Character
	local accepterHRP  = accepterChar and accepterChar:FindFirstChild("HumanoidRootPart")
	local accepterHum  = accepterChar and accepterChar:FindFirstChildOfClass("Humanoid")

	if not (throwerHRP and accepterHRP and accepterHum) then return end

	-- Direction: thrower → nearest aerial enemy, fallback to thrower LookVector
	local throwDir = throwerChar.HumanoidRootPart.CFrame.LookVector
	local nearest, nearestDist = nil, math.huge
	for _, obj in ipairs(workspace:GetDescendants()) do
		if obj.Name == "AerialHawk" and obj:IsA("Model") then
			local hr = obj:FindFirstChild("HumanoidRootPart")
			if hr then
				local d = (hr.Position - throwerHRP.Position).Magnitude
				if d < nearestDist then nearest = obj; nearestDist = d end
			end
		end
	end
	if nearest then
		local hawkHRP = nearest:FindFirstChild("HumanoidRootPart")
		throwDir = (hawkHRP.Position - throwerHRP.Position).Unit
	end

	print(string.format("[JETPACK-THROW] %s throwing %s", offerThrower.Name, accepter.Name))
	ThrowExecute:FireClient(accepter, throwDir)

	-- Apply throw velocity server-side
	local bv = Instance.new("BodyVelocity")
	bv.Velocity  = throwDir * THROW_CFG.speed
	bv.MaxForce  = Vector3.new(1e5, 1e5, 1e5)
	bv.Parent    = accepterHRP
	Debris:AddItem(bv, 0.8)

	-- Collision check: did we hit the hawk?
	local checkStart = tick()
	task.spawn(function()
		while tick() - checkStart < 3 do
			task.wait(0.05)
			if not accepterHRP or not accepterHRP.Parent then break end
			for _, obj in ipairs(workspace:GetDescendants()) do
				if obj.Name == "AerialHawk" and obj:IsA("Model") then
					local hr = obj:FindFirstChild("HumanoidRootPart")
					local hum = obj:FindFirstChildOfClass("Humanoid")
					if hr and hum then
						local dist = (hr.Position - accepterHRP.Position).Magnitude
						if dist < THROW_CFG.hawkKillRange then
							hum.Health = 0  -- 1-shot kill
							print(string.format("[JETPACK-THROW] HAWK KILLED by %s throw!", accepter.Name))
							break
						end
					end
				end
			end
		end
	end)
end)

print("[JETPACK-THROW] Service initialized — private + broadcast throw, 1-shot hawk kill")
