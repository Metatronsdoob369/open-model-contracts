-- [[ THE METROPOLIS IGNITION — ABSOULTE SOVEREIGN MODE ]]
print("🏮🏮🏮 [IGNITION] SOVEREIGN CORE ONLINE — MANIFESTING WORLD... 🏮🏮🏮")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- [[ 1. SOVEREIGN JANITOR PROTOCOL (IMMEDIATE EXECUTION) ]]
-- We purge the land BEFORE requiring any modules to prevent compilation deadlocks.

print("🏮 [JANITOR] Frequency Sweep Initiated...")
local legacyFound = 0

-- Scan & Destroy Shadow Framework Components
local scanTargets = {
	game:GetService("ServerScriptService"):FindFirstChild("ServerSource"),
	ReplicatedStorage:FindFirstChild("ClientSource"),
	ReplicatedStorage:FindFirstChild("Packages"),
}

if legacyFound > 0 then
	warn("🏮 [JANITOR] Frequency Sweep Complete. " .. legacyFound .. " legacy nodes identified (DORMANT).")
else
	print("🏮 [JANITOR] Land is Sovereign. No leaks detected.")
end

-- [[ 2. SOVEREIGN MANIFESTATION ]]

local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

-- Atomic Pathing: Locate siblings
local function getModule(name)
	return script:FindFirstChild(name) or script.Parent:FindFirstChild(name) or script.Parent.Parent:FindFirstChild(name, true)
end

local SovereignClientRouter = require(getModule("SovereignClientRouter"))
local CathedralRaveService = require(getModule("CathedralRaveService"))
local CharacterService = require(getModule("CharacterService"))
-- local LobbyService = require(getModule("LobbyService")) -- Pruned

-- local WeaponService = require(script.Parent:WaitForChild("WeaponService")) -- Pruned for Swarm Run
local TagGameService = require(getModule("TagGameService"))
local DanceFloorService = require(getModule("DanceFloorService"))
local AtmosphereController = require(getModule("AtmosphereController"))
local VictimService = require(getModule("VictimService"))

-- Shared logic
local TagBot = require(Generated:WaitForChild("TagBot"))
local MetropolisLighting = require(Generated:WaitForChild("MetropolisLighting"))
local TagArena = require(Generated:WaitForChild("TagArena"))
local TagLogic = require(Generated:WaitForChild("TagLogic"))
-- local HousingService = require(Generated:WaitForChild("HousingService")) -- Pruned for Lightweight Sovereign Run

-- [[ 3. IGNITION SEQUENCE ]]

local success, report = Telemetry.gateCheck()

if success then
	print("🏮 [IGNITION] Resonance Stabilized. Manifesting Sector Alpha...")
	
	-- Initialize Sovereign Relay & Services
	local Router = SovereignClientRouter.new()
	_G.SovereignRouter = Router
	
	CharacterService:Init()
	CathedralRaveService:Init()
	TagGameService:Init()
	DanceFloorService:Init()
	-- LobbyService:Init() -- Pruned
	-- WeaponService:Init() -- Pruned
	
	CharacterService:Start()
	-- LobbyService:Start() -- Pruned
	-- WeaponService:Start() -- Pruned
	DanceFloorService:Start()
	AtmosphereController:Manifest()
	-- HousingService:Init() -- Pruned
	-- HousingService:Start() -- Pruned

	-- TagGame and VictimService: start immediately (LobbyService pruned, no lobby gate needed)
	TagGameService:Start()
	VictimService:Start()

	-- [[ GEOMETRY PROTECTION ]]
	print("🛡️ [PROTECTION] Janitor Purge Protocol deactivated. Workspace is protected.")

	-- MetropolisLighting.apply() -- Pruned
	local arena = TagArena.generate()

	-- Anchor Executive Client & Chat Governance
	game:GetService("Players").PlayerAdded:Connect(function(player)
		if #game:GetService("Players"):GetPlayers() == 1 then
			Router:setExecutiveClient(player)
		end
		
		-- Rowdy Command Stability Hook
		player.Chatted:Connect(function(message)
			local msg = string.lower(message)
			if msg == "/rowdy" or msg == "!rowdy" then
				print("🏮 [COMMAND] Rowdy Protocol triggered by " .. player.Name)
				CathedralRaveService:Start()
				
				-- Rowdy Physical Reaction
				for _, p in ipairs(game:GetService("Players"):GetPlayers()) do
					if p.Character and p.Character:FindFirstChild("Humanoid") then
						p.Character.Humanoid.WalkSpeed = p.Character.Humanoid.WalkSpeed + 8
						p.Character.Humanoid.Jump = true
						task.delay(5, function()
							if p.Character and p.Character:FindFirstChild("Humanoid") then
								p.Character.Humanoid.WalkSpeed = p.Character.Humanoid.WalkSpeed - 8
							end
						end)
					end
				end
			end
		end)
	end)

	TagLogic.start()
	
	-- [[ MONETIZATION HANDLING ]]
	local MarketplaceService = game:GetService("MarketplaceService")
	MarketplaceService.ProcessReceipt = function(receiptInfo)
		print("🏮 [MONETIZATION] Investment Confirmed. Igniting Cathedral Rave.")
		
		-- 1. Trigger the Rave locally
		CathedralRaveService:Start()
		
		-- 2. Dispatch the Economic Pulse to Node
		Telemetry.dispatchPulse({ 
			event = "Sovereign_Purchase_Granted", 
			amount = receiptInfo.CurrencySpent 
		})
		
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	task.spawn(function()
		while true do
			Telemetry.dispatchPulse("Operational")
			task.wait(30)
		end
	end)
	
	print("🏮 Sector Alpha: Manifestation Complete.")
else
	warn("❌ [IGNITION] GOVERNANCE FAILURE. SECURING DOMAIN...")
end
