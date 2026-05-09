--[=[
    CharacterService.luau
    Status: VAULT-READY | 4D-Hardened | Sovereign Blueprint
    Governance: State Stewardship §4, Spatio-Temporal Anchoring §3
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Sovereign Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

-- Native Bridge Factory (SafeFire)
local function CreateBridge(name)
	local remote = ReplicatedStorage:FindFirstChild(name) or Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = ReplicatedStorage
	return {
		FireAll = function(...) remote:FireAllClients(...) end,
		_remote = remote
	}
end

-- Find actual floor Y at arena XZ via raycast
local function findArenaFloorY(x, z)
	local origin    = Vector3.new(x, 500, z)
	local direction = Vector3.new(0, -600, 0)
	local result    = workspace:Raycast(origin, direction)
	if result then
		return result.Position.Y + 5  -- 5 studs above floor
	end
	return 65  -- last-resort fallback
end

local CharacterService = {
	Name = "CharacterService",
	Config = {
		APPLY_APPEARANCE = true,
		LOAD_TIMEOUT = 10,
		ARENA_X = 1012,
		ARENA_Z = 1007,
	},
	Bridges = {
		Manifest = CreateBridge("OMC_CharacterManifest"),
	},
	State = { players = {} },
}

-- [[ MANIFESTATION LOGIC ]]

function CharacterService:_applyAppearance(player, character)
	if not self.Config.APPLY_APPEARANCE then return end
	local humanoid = character:WaitForChild("Humanoid", self.Config.LOAD_TIMEOUT)
	if not humanoid then return end
	
	local success, description = pcall(function()
		return Players:GetHumanoidDescriptionFromUserId(player.UserId)
	end)
	
	if success and description then
		pcall(function() humanoid:ApplyDescription(description) end)
	end
end

-- [[ LIFECYCLE IGNITION ]]

-- Full character setup: stats + teleport + appearance
function CharacterService:_setupCharacter(player, char)
	local humanoid = char:WaitForChild("Humanoid", 10)
	local hrp = char:WaitForChild("HumanoidRootPart", 5)

	if humanoid then
		humanoid.WalkSpeed = 32
		humanoid.JumpPower = 100
		humanoid.UseJumpPower = true
	end

	if hrp then
		local function doTeleport()
			if not hrp or not hrp.Parent then return end
			local spawnCF = _G.LobbySpawnCF
			local targetX = spawnCF and spawnCF.Position.X or self.Config.ARENA_X
			local targetZ = spawnCF and spawnCF.Position.Z or self.Config.ARENA_Z
			local floorY  = findArenaFloorY(targetX, targetZ)
			hrp.CFrame = CFrame.new(targetX, floorY, targetZ)
			return targetX, floorY, targetZ
		end

		task.delay(0.1, doTeleport)
		task.delay(1.5, function()
			local x, y, z = doTeleport()
			if x then
				print(string.format("[CHAR] Confirmed spawn %s at (%.0f, %.1f, %.0f)",
					player.Name, x, y, z))
			end
		end)
	end

	self:_applyAppearance(player, char)
	self.Bridges.Manifest:FireAll("LOADED", player.Name)
	Telemetry.dispatchPulse({ event = "Character_Manifest", player = player.Name })
end

function CharacterService:Start()
	-- Wire future joins
	Players.PlayerAdded:Connect(function(player)
		player.CharacterAdded:Connect(function(char)
			self:_setupCharacter(player, char)
		end)
	end)

	-- Late-join guard: players already in server when Start() runs
	for _, player in ipairs(Players:GetPlayers()) do
		local char = player.Character
		if char then
			self:_setupCharacter(player, char)
		end
		player.CharacterAdded:Connect(function(char)
			self:_setupCharacter(player, char)
		end)
	end
end

function CharacterService:Init()
	print("🏮 [CHAR] 4D Manifest Bridge Fixed.")
end

return CharacterService
