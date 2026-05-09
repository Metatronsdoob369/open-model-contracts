--[=[
    CharacterController.luau
    Status: PROTOCOL | Diamond-Stable | Sovereign-Native
    OMC Room: Client_Visual
    Law Compliance: Dependency Autonomy §8, Signal Integrity §3
    
    REPAIRED VERSION (Consolidated & Framework-Free):
    - Purged legacy Knit/Superbullet requirements.
    - Native OMC Controller pattern.
    - Robust character load handling with telemetry.
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Infrastructure Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
-- local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

local CharacterController = {
	Name = "CharacterController",
	CharacterService = nil, -- Injected via manifest
}

-- [[ PRIVATE METHODS ]]
local function handleCharacterLoaded(success, usedFallback)
	if success then
		print("🏮 [CHAR-CONTROLLER] Character manifest successfully.")
		if usedFallback then
			-- Governance.RegisterIssue("LOAD_FALLBACK", "Using basic character fallback", "LOW")
		end
	else
		-- Governance.RegisterIssue("LOAD_FAIL", "Character manifestation failed in world", "MEDIUM")
	end

	
	Telemetry.dispatchPulse({
		event = "Character_Loaded",
		success = success,
		usedFallback = usedFallback
	})
end

-- [[ PUBLIC INTERFACE ]]
function CharacterController:GetCharacter()
	if not self.CharacterService then
		warn("🏮 [CHAR-CONTROLLER] CharacterService not manifest!")
		return nil
	end
	return self.CharacterService:GetCharacter()
end

-- [[ LIFECYCLE ]]
function CharacterController:Start()
	print("🏮 [CHAR-CONTROLLER] Starting Sovereign Control...")
	
	-- Connect to character manifestation service
	if self.CharacterService and self.CharacterService.CharacterLoaded then
		self.CharacterService.CharacterLoaded:Connect(handleCharacterLoaded)
	else
		-- Governance.RegisterIssue("SERVICE_DESYNC", "CharacterService manifest lacks CharacterLoaded signal", "HIGH")
	end
	
	Telemetry.dispatchPulse({ event = "Controller_Ignition", name = self.Name })
end

function CharacterController:Init(services)
	-- Manual Dependency Injection (Sovereign Pattern)
	self.CharacterService = services.CharacterService
	print("🏮 [CHAR-CONTROLLER] Initialized. Identity locked.")
end

return CharacterController
