
-- CANONICAL BRIDGE INJECTION: Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded
-- Fracture Path: scriptLoad → characterAdded
-- Contract: OMC_Bridge_StateSync
-- Throttle Rate: 15 calls/sec


-- ROBUST EARLY-LOAD GUARD (injected by Architect for temporal fracture)
local function SafeWaitForChild(parent: Instance, childName: string, timeout: number = 8): Instance?
    local start = os.clock()
    while os.clock() - start < timeout do
        local child = parent:FindFirstChild(childName)
        if child then return child end
        task.wait(0.2)  -- longer yield for early load
    end
    RegisterIssue("WaitForChildTimeout", { parent = parent.Name, child = childName, timeout = timeout })
    return nil
end

-- Additional safety for service access
local function SafeGetService(serviceName: string): any?
    local success, service = pcall(function()
        return game:GetService(serviceName)
    end)
    if not success then
        RegisterIssue("GetServiceFailed", { serviceName = serviceName })
        return nil
    end
    return service
end


local Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = 0
local Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate = 15

local function SafeFireBridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded(payload: any)
    local now = os.clock()
    if now - Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire < (1 / Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate) then
        RegisterIssue("BridgeThrottled", { bridge = "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded" })
        return
    end

    Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = now

    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", { bridge = "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded", side = "sender" })
        return
    end

    SafeFireBridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded(payload)
end

-- RECEIVER-SIDE GUARD
Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded.OnServerEvent:Connect(function(player: Player, payload: any)
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", { bridge = "Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded", side = "receiver" })
        return
    end

    local now = os.clock()
    if not Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive then Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = 0 end
    if now - Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive < 0.05 then
        return
    end
    Bridge_ROOM-02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = now

    -- Safe consumption point
end)



-- METROPOLIS CANONICAL LAW: Metropolis_PizzaService.lua
-- Final Manifestation post-Heuristic Repair Cycle.
-- Derived from: PizzaPlace_GameService Scrape
-- Status: DIAMOND-STABLE

local PizzaService = {}
PizzaService.__index = PizzaService

-- GSI-Validated Dependencies
local ReplicatedStorage = SafeGetService("ReplicatedStorage")
local ServerScriptService = SafeGetService("ServerScriptService")

local Enums = require(ReplicatedStorage:WaitForChild("Enums"))
local Global = require(ServerScriptService:WaitForChild("Global"))
local Timer = require(ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local SoundFX = require(ReplicatedStorage:WaitForChild("SoundFX"))

-- Core Management References
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Paycheck = Global.Paycheck

function PizzaService.Init()
    if Enums.IsPartyServer then
        return false
    end
    
    print("🍕 Metropolis Pizza Service Initialized [OMC-STABLE]")
    return true
end

function PizzaService:StartRound()
    -- Heuristic Reconstruction of Manager/Customer Flow
    Manager:InitializeRound()
    Customers:SpawnInitialBatch()
    print("🚀 Pizza Round Started.")
end

function PizzaService:ProcessPaychecks()
    Paycheck:Distribute(Players:GetPlayers())
end

return PizzaService
  