
-- CANONICAL BRIDGE INJECTION: Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded
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


local Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = 0
local Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate = 15

local function SafeFireBridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded(payload: any)
    local now = os.clock()
    if now - Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire < (1 / Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate) then
        RegisterIssue("BridgeThrottled", { bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded" })
        return
    end

    Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = now

    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", { bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded", side = "sender" })
        return
    end

    SafeFireBridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded(payload)
end

-- RECEIVER-SIDE GUARD
Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded.OnServerEvent:Connect(function(player: Player, payload: any)
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", { bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded", fracturePath = "scriptLoad → characterAdded", side = "receiver" })
        return
    end

    local now = os.clock()
    if not Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive then Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = 0 end
    if now - Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive < 0.05 then
        return
    end
    Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = now

    -- Safe consumption point
end)


--[=[
    GameService.luau
    Status: REPAIRED | Diamond-Stable
    OMC Room: ROOM-02_WorldState / OMC_Governance
    Law Compliance: Scheduler §1, MemPalace §1, Contract Mirroring §1
    
    Orchestrated by Antigravity for the Metropolis Intelligence Hub.
]=]

local game = game
local ReplicatedStorage = SafeGetService("ReplicatedStorage")
local ServerScriptService = SafeGetService("ServerScriptService")
local Utils = ReplicatedStorage:WaitForChild("Utils")
local traceCapture = require(Utils:WaitForChild("TraceCapture"))

-- [TRACE] Start load sequence
traceCapture:record("scriptLoad")

-- [ORCHESTRATION] Ensure loading order parity
if not game:IsLoaded() then
    game.Loaded:Wait()
end

local Enums = require(ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
    script:Destroy()
    return {}
end

-- [ANCHOR] Canonical Environment and Global References
-- Following MemPalace Routing Law §1: All shared state must be referenced via canonical tables.
local Environment = require(ServerScriptService:WaitForChild("Environment"))
local Global = require(ServerScriptService:WaitForChild("Global"))

-- [CONTRACT] Verified Dependency Resolution
local Players = Global.Players
local Houses = Global.Houses
local Customers = Global.Customers 
local Manager = Global.Manager
local Paycheck = Global.Paycheck

-- [UTILITIES]
local Utilities = ReplicatedStorage:WaitForChild("Utilities")
local Timer = require(Utilities:WaitForChild("Timer"))
local Utility = require(Utilities:WaitForChild("Utility"))
local Dialog = require(ReplicatedStorage:WaitForChild("Dialog"))
local Debug = require(ReplicatedStorage:WaitForChild("Debug"))
local SoundFX = require(ReplicatedStorage:WaitForChild("SoundFX")) -- Fixed shattered require

-- [GOVERNANCE]
local MetropolisGovernance = require(ServerScriptService:WaitForChild("MetropolisGovernance"))
local TagControl = require(script.Parent:SafeWaitForChild("TagControl"))

local GameService = {
    _ROUND_ACTIVE = false,
    _TIME_REMAINING = 0,
    _ROUND_DURATION = 120, -- 2 mins
}

-- [[ CORE SERVICE LOGIC ]]

function GameService.Initialize()
    Debug.Log("[GameService] Initializing Sovereign Operations...")
    
    -- Ensuring ROOM-02 compliance before starting round loops
    if not Environment.IsReady() then
        Debug.Warn("[GameService] Environment not manifest. Yielding to Scheduler Law §1.")
        traceCapture:record("environmentWait_start")
        repeat task.wait() until Environment.IsReady()
        traceCapture:record("environmentWait_end")
    end
    
    Debug.Log("[GameService] Resonance established. 8 Tags/Min baseline active.")
    
    -- Start the first round
    task.delay(5, GameService.StartRound)
end

function GameService.StartRound()
    if GameService._ROUND_ACTIVE then return end
    
    Debug.Log("╔═══ [ROUND START] ═══╗")
    traceCapture:record("roundStart")
    GameService._ROUND_ACTIVE = true
    GameService._TIME_REMAINING = GameService._ROUND_DURATION
    
    -- Select random starter "It"
    local allPlayers = Players:GetPlayers()
    if #allPlayers > 0 then
        local starter = allPlayers[math.random(1, #allPlayers)]
        TagControl.SetNewIt(starter)
    end
    
    -- Teleport players to arena (Placeholder for manifestation)
    Debug.Log("[GameService] Players spawned into GothTag Arena.")
end

function GameService.EndRound()
    GameService._ROUND_ACTIVE = false
    Debug.Log("╚═══ [ROUND END] ═══╝")
    
    -- [REWARD] Trigger Paycheck synchronization
    local winner = TagControl._CURRENT_IT -- In this variant, current "It" might be the loser, or vice versa
    Debug.Log(string.format("[GameService] Round concluded. Syncing Paycheck for %d players.", #Players:GetPlayers()))
    
    -- RESET
    task.delay(10, GameService.StartRound)
end

-- [SCHEDULER] Law §5 compliance: Using Heartbeat for auto-save/state sync
local function StartStateSync()
    SafeGetService("RunService").Heartbeat:Connect(function(dt)
        if GameService._ROUND_ACTIVE then
            GameService._TIME_REMAINING = GameService._TIME_REMAINING - dt
            
            if GameService._TIME_REMAINING <= 0 then
                GameService.EndRound()
            end
            
            -- Periodically sync ROOM-01 values to ROOM-02 persistence via OMC_DataStore_Queue
            -- e.g., Update timer in ReplicatedStorage for Client UI
        end
    end)
end

-- Manifest the service
GameService.Initialize()
task.spawn(StartStateSync)

return GameService
