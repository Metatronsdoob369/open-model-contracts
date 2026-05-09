
-- CANONICAL BRIDGE INJECTION: Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded
-- Fracture Path: scriptLoad → characterAdded
-- Contract: OMC_Bridge_StateSync
-- Throttle Rate: 15 calls/sec

local Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = 0
local Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate = 15

local function SafeFireBridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded(payload: any)
    local now = os.clock()
    if now - Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire < (1 / Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_ThrottleRate) then
        RegisterIssue("BridgeThrottled", {
            bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
            fracturePath = "scriptLoad → characterAdded",
            attemptedRate = 15
        })
        return -- safely drop excess calls
    end

    Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastFire = now

    -- Strict OMC contract validation BEFORE crossing the bridge
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", {
            bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
            fracturePath = "scriptLoad → characterAdded",
            side = "sender"
        })
        return -- safe abort
    end

    Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded:FireServer(payload)
end

-- RECEIVER-SIDE GUARD
Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded.OnServerEvent:Connect(function(player: Player, payload: any)
    -- Immediate contract validation on receiver
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_StateSync"], payload) then
        RegisterIssue("BridgeContractViolation", {
            bridge = "Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded",
            fracturePath = "scriptLoad → characterAdded",
            side = "receiver"
        })
        return -- safe drop
    end

    -- Receiver-side rate limit (defense-in-depth)
    local now = os.clock()
    if not Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive then Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = 0 end
    if now - Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive < 0.05 then   -- max 20 Hz
        return
    end
    Bridge_ROOM_02_WorldState_to_Client_Visual_scriptLoadcharacterAdded_LastReceive = now

    -- Safe consumption - customize per bridge if needed
end)


2026-04-11T10:14:53.218Z,1297.218750,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:14:53.218Z,1297.218994,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:WaitForChild("Debug"))
local Tutorial = require(script.Parent:WaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:14:53.218Z,1297.218994,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:14:57.517Z,1301.517578,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:14:57.517Z,1301.517700,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:WaitForChild("Debug"))
local Tutorial = require(script.Parent:WaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:14:57.517Z,1301.517700,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:15:25.483Z,1329.483398,911a000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:15:25.483Z,1329.483521,911a000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:WaitForChild("Debug"))
local Tutorial = require(script.Parent:WaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:15:25.483Z,1329.483521,911a000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:21.029Z,1445.029297,9b4d000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:17:21.029Z,1445.029419,9b4d000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:WaitForChild("Debug"))
local Tutorial = require(script.Parent:WaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:17:21.029Z,1445.029541,9b4d000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:27.028Z,1451.028809,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:17:27.029Z,1451.029053,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:WaitForChild("Debug"))
local Tutorial = require(script.Parent:WaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:WaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:17:27.029Z,1451.029053,9f53000,6 [FLog::Output] ---END_FILE---
