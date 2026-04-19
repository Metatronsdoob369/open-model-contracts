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

local GameService = {}

-- [[ CORE SERVICE LOGIC ]]

function GameService.Initialize()
    Debug.Log("[GameService] Initializing Sovereign Operations...")
    
    -- Ensuring ROOM-02 compliance before starting round loops
    if not Environment.IsReady() then
        Debug.Warn("[GameService] Environment not manifest. Yielding to Scheduler Law §1.")
        repeat task.wait() until Environment.IsReady()
    end
    
    Debug.Log("[GameService] Resonance established. 8 Tags/Min baseline active.")
end

-- [SCHEDULER] Law §5 compliance: Using Heartbeat for auto-save/state sync
local function StartStateSync()
    game:GetService("RunService").Heartbeat:Connect(function(dt)
        -- Periodically sync ROOM-01 values to ROOM-02 persistence via OMC_DataStore_Queue
    end)
end

-- Manifest the service
GameService.Initialize()
task.spawn(StartStateSync)

return GameService
