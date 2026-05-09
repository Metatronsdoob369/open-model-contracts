
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


2026-04-11T10:14:53.218Z,1297.218750,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:14:53.218Z,1297.218994,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:SafeWaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:SafeWaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:SafeWaitForChild("Debug"))
local Tutorial = require(script.Parent:SafeWaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:14:53.218Z,1297.218994,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:14:57.517Z,1301.517578,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:14:57.517Z,1301.517700,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:SafeWaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:SafeWaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:SafeWaitForChild("Debug"))
local Tutorial = require(script.Parent:SafeWaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:14:57.517Z,1301.517700,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:15:25.483Z,1329.483398,911a000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:15:25.483Z,1329.483521,911a000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:SafeWaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:SafeWaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:SafeWaitForChild("Debug"))
local Tutorial = require(script.Parent:SafeWaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:15:25.483Z,1329.483521,911a000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:21.029Z,1445.029297,9b4d000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:17:21.029Z,1445.029419,9b4d000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:SafeWaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:SafeWaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:SafeWaitForChild("Debug"))
local Tutorial = require(script.Parent:SafeWaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:17:21.029Z,1445.029541,9b4d000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:27.028Z,1451.028809,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.GameService---
2026-04-11T10:17:27.029Z,1451.029053,9f53000,6 [FLog::Output] local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
if Enums.IsPartyServer then
	script:Destroy()
	return
end


local Global = require(script.Parent.Global)
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(game.ServerScriptService:SafeWaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Customers = Global.Customers
local Paycheck = Global.Paycheck


local Timer = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(game.ReplicatedStorage:SafeWaitForChild("Dialog"))
local Utility = require(game.ReplicatedStorage:SafeWaitForChild("Utilities"):WaitForChild("Utility"))
local Debug = require(game.ReplicatedStorage:SafeWaitForChild("Debug"))
local Tutorial = require(script.Parent:SafeWaitForChild("Tutorial"))
local Enums = require(game.ReplicatedStorage:SafeWaitForChild("Enums"))
local SoundFX = require(game.ReplicatedStorage
2026-04-11T10:17:27.029Z,1451.029053,9f53000,6 [FLog::Output] ---END_FILE---
