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

local CharacterService = {
	Name = "CharacterService",
	Config = {
		APPLY_APPEARANCE = true,
		LOAD_TIMEOUT = 10,
		MANIFEST_Y = 62,   -- Arena floor level (fallback if LobbySpawnCF not ready)
		MANIFEST_X = 1012, -- Arena center X
		MANIFEST_Z = 1007, -- Arena center Z
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

function CharacterService:Start()
	local function handlePlayer(player)
		player.CharacterAdded:Connect(function(char)
			local humanoid = char:WaitForChild("Humanoid", 10)
			local hrp = char:WaitForChild("HumanoidRootPart", 5)
			
			if humanoid then
				humanoid.WalkSpeed = 32 -- Sovereign Speed
				humanoid.JumpPower = 100 -- Cybernetic Jump
				humanoid.UseJumpPower = true
			end
			
			if hrp then
				task.spawn(function()
					if not hrp or not hrp.Parent then return end
					local spawnCF = CFrame.new(self.Config.MANIFEST_X, self.Config.MANIFEST_Y, self.Config.MANIFEST_Z)
					hrp.CFrame = spawnCF
					print(string.format("[CHAR] Spawned %s at (%.0f, %.0f, %.0f)",
						player.Name, spawnCF.Position.X, spawnCF.Position.Y, spawnCF.Position.Z))
				end)
			end

			self:_applyAppearance(player, char)
			self.Bridges.Manifest:FireAll("LOADED", player.Name)
			Telemetry.dispatchPulse({ event = "Character_Manifest", player = player.Name })
		end)

		-- Also handle the current character if it already exists
		if player.Character then
			task.spawn(function()
				local hrp = player.Character:WaitForChild("HumanoidRootPart", 5)
				if hrp then
					local spawnCF = CFrame.new(self.Config.MANIFEST_X, self.Config.MANIFEST_Y, self.Config.MANIFEST_Z)
					hrp.CFrame = spawnCF
					print(string.format("[CHAR] Spawned %s at (%.0f, %.0f, %.0f)",
						player.Name, spawnCF.Position.X, spawnCF.Position.Y, spawnCF.Position.Z))
				end
			end)
		end
	end

	Players.PlayerAdded:Connect(handlePlayer)
	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(handlePlayer, player)
	end
end

function CharacterService:Init()
	print("🏮 [CHAR] 4D Manifest Bridge Fixed.")
end

return CharacterService
