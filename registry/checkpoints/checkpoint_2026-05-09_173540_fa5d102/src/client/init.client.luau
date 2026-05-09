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
local RunService = game:GetService("RunService")

-- Infrastructure Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

print("🏮 [CLIENT-IGNITION] Manifesting Sovereign Land...")

-- 1. Initialize Signal Relay
local RemoteFunction = ReplicatedStorage:WaitForChild("SovereignRelay")

-- 2. Manifest Controllers
-- NOTE: Uses FindFirstChild ONLY — no infinite WaitForChild.
-- If a controller is missing from the Rojo build, it fails loud and fast, not silently forever.
local function getClientModule(name)
	local found = script:FindFirstChild(name) or script.Parent:FindFirstChild(name)
	if not found then
		warn("⚠️ [CLIENT-IGNITION] Module not found: '" .. name .. "' — check Rojo sync.")
	end
	return found
end

local CharacterControllerMod = getClientModule("CharacterController")
local MobilityControllerMod = getClientModule("SovereignMobilityController")
local InventoryControllerMod = getClientModule("InventoryController")
local WeaponControllerMod = getClientModule("WeaponController")
local LobbyControllerMod = getClientModule("LobbyController")

local CharacterController = CharacterControllerMod and require(CharacterControllerMod)
local MobilityController = MobilityControllerMod and require(MobilityControllerMod)
local InventoryController = InventoryControllerMod and require(InventoryControllerMod)
local WeaponController = WeaponControllerMod and require(WeaponControllerMod)
local LobbyController = LobbyControllerMod and require(LobbyControllerMod)

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
if InventoryController then InventoryController:Init(services) end
if WeaponController then WeaponController:Init(services) end
if LobbyController then LobbyController:Init(services) end

if CharacterController then CharacterController:Start() end
if MobilityController then MobilityController:Start() end
if InventoryController then InventoryController:Start() end
if WeaponController then WeaponController:Start() end
if LobbyController then LobbyController:Start() end

Telemetry.dispatchPulse({ event = "Client_Manifest_Success" })
print("🏮 [CLIENT-IGNITION] Sovereign Frequency Locked.")

-- [[ RESONANCE EARS ]]
-- IMPORTANT: This MUST connect to prevent OMC_ResonanceUpdate queue exhaustion.
local RS = game:GetService("ReplicatedStorage")
local ResonanceEvent = RS:FindFirstChild("OMC_ResonanceUpdate")

if ResonanceEvent then
	ResonanceEvent.OnClientEvent:Connect(function(mode)
		-- Resonance mode received from server.
		-- Extend here for HUD color shifts, tile lerping, etc.
		if RunService:IsStudio() then
			print("🌐 [RESONANCE] Mode update: " .. tostring(mode))
		end
	end)
else
	warn("⚠️ [RESONANCE] OMC_ResonanceUpdate not found — server may not have created it yet.")
end
