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
-- NOTE: Uses FindFirstChild ONLY — no infinite WaitForChild.
local function getClientModule(name)
	local found = script:FindFirstChild(name) or script.Parent:FindFirstChild(name)
	if not found then
		warn("⚠️ [CLIENT-IGNITION] Module not found: '" .. name .. "' — check Rojo sync.")
	end
	return found
end

local CharacterControllerMod = getClientModule("CharacterController")
local MobilityControllerMod  = getClientModule("SovereignMobilityController")
local LobbyControllerMod     = getClientModule("LobbyController")
local InventoryControllerMod = getClientModule("InventoryController")

local CharacterController = CharacterControllerMod and require(CharacterControllerMod)
local MobilityController  = MobilityControllerMod and require(MobilityControllerMod)
local LobbyController     = LobbyControllerMod and require(LobbyControllerMod)
local InventoryController = InventoryControllerMod and require(InventoryControllerMod)

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
	},
	InventoryController = InventoryController
}

if CharacterController then CharacterController:Init(services) end
if MobilityController then MobilityController:Init(services) end
if LobbyController then LobbyController:Init() end
if InventoryController then InventoryController:Init(services) end

if CharacterController then CharacterController:Start() end
if MobilityController then MobilityController:Start() end
if LobbyController then LobbyController:Start() end
if InventoryController then InventoryController:Start() end

Telemetry.dispatchPulse({ event = "Client_Manifest_Success" })
print("🏮 [CLIENT-IGNITION] Sovereign Frequency Locked.")

-- [[ RESONANCE EARS ]]
local RS = game:GetService("ReplicatedStorage")
local ResonanceEvent = RS:WaitForChild("OMC_ResonanceUpdate")

ResonanceEvent.OnClientEvent:Connect(function(mode)
	-- Ready for high-fidelity tile lerping if manifestation requires it
end)
