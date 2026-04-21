-- [[ THE METROPOLIS IGNITION — ABSOULTE SOVEREIGN MODE ]]
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

for _, target in ipairs(scanTargets) do
	if target then
		target:Destroy()
		legacyFound = legacyFound + 1
		print("🏮 [JANITOR] Atomized legacy manifest: " .. target.Name)
	end
end

-- Deep Scan for orphaned scripts
for _, desc in ipairs(game:GetDescendants()) do
	if (desc:IsA("LuaSourceContainer") and (desc.Name:find("Superbullet") or desc.Name:find("Knit"))) then
		-- Don't delete ourselves or our OMC siblings
		if not desc:IsDescendantOf(game:GetService("ServerScriptService").OMC_Ignition) then
			desc:Destroy()
			legacyFound = legacyFound + 1
		end
	end
end

if legacyFound > 0 then
	warn("🏮 [JANITOR] Purged " .. legacyFound .. " legacy frequency leaks. Land is clean.")
else
	print("🏮 [JANITOR] Land is Sovereign. No leaks detected.")
end

-- [[ 2. SOVEREIGN MANIFESTATION ]]

local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

-- Atomic Pathing: Locate siblings
local function getModule(name)
	return script.Parent:FindFirstChild(name) or script.Parent.Parent:FindFirstChild(name, true)
end

local SovereignClientRouter = require(getModule("SovereignClientRouter"))
local CathedralRaveService = require(getModule("CathedralRaveService"))
local CharacterService = require(getModule("CharacterService"))
local TagGameService = require(getModule("TagGameService"))
local DanceFloorService = require(getModule("DanceFloorService"))
local AtmosphereController = require(getModule("AtmosphereController"))
local VictimService = require(getModule("VictimService"))
local InventoryService = require(getModule("InventoryService"))
local CoOpHistoryService = require(getModule("CoOpHistoryService"))
local PickupService = require(getModule("PickupService"))
local EnemyService = require(getModule("EnemyService"))

-- Shared logic
local TagBot = require(Generated:WaitForChild("TagBot"))
local MetropolisLighting = require(Generated:WaitForChild("MetropolisLighting"))
local TagArena = require(Generated:WaitForChild("TagArena"))
local TagLogic = require(Generated:WaitForChild("TagLogic"))

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
	-- [[ GROK_ SOVEREIGN SERVICES ]]
	local grokServices = {
		InventoryService = InventoryService,
		CoOpHistoryService = CoOpHistoryService,
		PickupService = PickupService,
		CharacterService = CharacterService,
	}
	
	InventoryService:Init(grokServices)
	CoOpHistoryService:Init(grokServices)
	PickupService:Init(grokServices)
	EnemyService:Init(grokServices)
	
	CharacterService:Start()
	InventoryService:Start()
	CoOpHistoryService:Start()
	PickupService:Start()
	EnemyService:Start()
	TagGameService:Start()
	DanceFloorService:Start()
	AtmosphereController:Manifest()
	VictimService:Start()
	
	-- Purge ghost manifestations in Workspace
	for _, child in ipairs(game:GetService("Workspace"):GetChildren()) do
		if child.Name == "SectorAlpha_Arena" or child.Name == "Gothic_World" then
			child:Destroy()
			print("🧹 [PURGE] Atomized legacy manifestation: " .. child.Name)
		end
	end

	MetropolisLighting.apply()
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
