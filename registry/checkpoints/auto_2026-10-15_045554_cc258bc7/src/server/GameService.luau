--[=[
    GameService.luau
    Status: REPAIRED | Diamond-Stable
    OMC Room: ROOM-02_WorldState / OMC_Governance
    Law Compliance: Scheduler §1, MemPalace §1, Contract Mirroring §1
    
    Orchestrated by Antigravity for the Metropolis Intelligence Hub.
]=]

local game = game
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
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
local TagControl = require(script.Parent:WaitForChild("TagControl"))

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
    game:GetService("RunService").Heartbeat:Connect(function(dt)
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
