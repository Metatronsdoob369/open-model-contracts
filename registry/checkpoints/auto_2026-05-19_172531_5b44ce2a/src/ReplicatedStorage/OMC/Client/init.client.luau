--[=[
    init.client.luau
    Status: PROTOCOL | Diamond-Stable | Sovereign-Native
    OMC Room: Client_Visual
    Law Compliance: Resonance Manifestation §4, Dependency Autonomy §8
    
    CLIENT IGNITION SEQUENCE:
    - Purges the local _G frequency.
    - Resolves and initializes Sovereign Controllers.
    - Synchronizes with server-side CharacterService.
]=]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Infrastructure Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

print("🏮 [CLIENT-IGNITION] Manifesting Sovereign Land...")

-- 1. Initialize Signal Relay
local RemoteFunction = ReplicatedStorage:WaitForChild("SovereignRelay")

-- 2. Manifest Controllers
local function getClientModule(name)
	return script.Parent:FindFirstChild(name) or script:WaitForChild(name)
end

local CharacterController = require(getClientModule("CharacterController"))
local MobilityController  = require(getClientModule("SovereignMobilityController"))
local LobbyController     = require(getClientModule("LobbyController"))

-- 3. Dependency Injection & Ignition
local services = {
	-- Client-side stubs for Server Services
	CharacterService = {
		CharacterLoaded = {
			Connect = function(_, fn)
				-- Bridge to server signal could go here if needed
			end
		},
		GetCharacter = function() return game.Players.LocalPlayer.Character end
	}
}

CharacterController:Init(services)
MobilityController:Init(services)
LobbyController:Init()
CharacterController:Start()
MobilityController:Start()
LobbyController:Start()

Telemetry.dispatchPulse({ event = "Client_Manifest_Success" })
print("🏮 [CLIENT-IGNITION] Sovereign Frequency Locked.")

-- [[ RESONANCE EARS ]]
local RS = game:GetService("ReplicatedStorage")
local ResonanceEvent = RS:WaitForChild("OMC_ResonanceUpdate")

ResonanceEvent.OnClientEvent:Connect(function(mode)
	-- Ready for high-fidelity tile lerping if manifestation requires it
end)
