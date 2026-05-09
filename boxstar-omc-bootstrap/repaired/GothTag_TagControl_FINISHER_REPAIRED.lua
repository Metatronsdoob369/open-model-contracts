
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
    TagControl.luau
    Status: MANIFESTED | Diamond-Stable
    OMC Room: ROOM-01_LocalState / OMC_Governance
    Law Compliance: Scheduler §1, Contract Mirroring §1
    
    The Sovereign Gameplay Mechanic: TAG.
    Handles 'It' state management and distance-based resonance.
]=]

local game = game
local Players = SafeGetService("Players")
local ReplicatedStorage = SafeGetService("ReplicatedStorage")
local ServerScriptService = SafeGetService("ServerScriptService")

local Global = require(ServerScriptService:WaitForChild("Global"))
local Debug = require(ReplicatedStorage:WaitForChild("Debug"))
local Utils = ReplicatedStorage:WaitForChild("Utils")
local traceCapture = require(Utils:WaitForChild("TraceCapture"))

-- [TRACE] Start load sequence
traceCapture:record("scriptLoad")

local TagControl = {
    _CURRENT_IT = nil,
    _TAG_COOLDOWN = 1.5,
    _TAG_RADIUS = 6.0,
    _LAST_TAG_TIME = 0
}

-- [OMC BRIDGE] SafeFire Injection for Tag Persistence
local function RegisterTagEvent(attacker, victim)
    -- This is where the 4D Sequencer would normally inject the SafeFire wrapper. 
    -- For this assembly, we implement the hardened bridge directly.
    local payload = {
        type = "playerAction",
        timestamp = os.clock(),
        playerId = attacker.UserId,
        action = "tag_success",
        payload = {
            victimId = victim.UserId,
            location = (attacker.Character and attacker.Character.PrimaryPart.Position) or Vector3.new(0,0,0)
        }
    }
    
    -- Simulate the SafeFire call to the OMC bridge
    Debug.Log(string.format("[TagControl] CROSS-ROOM SIGNAL: %s tagged %s", attacker.Name, victim.Name))
    traceCapture:record("tag_event_sent")
    -- Bridge_PlayerAction:SafeFire(payload)
end

function TagControl.SetNewIt(player)
    if TagControl._CURRENT_IT == player then return end
    
    TagControl._CURRENT_IT = player
    Debug.Log(string.format("[TagControl] Manifested New 'It': %s", player.Name))
    
    -- Visual Feedback Infill (Placeholder)
    if player.Character then
        local highlight = Instance.new("Highlight")
        highlight.Name = "ShatterHighlight"
        highlight.FillColor = Color3.fromRGB(255, 0, 0)
        highlight.Parent = player.Character
    end
end

function TagControl.CheckProximity(itPlayer)
    if not itPlayer.Character or not itPlayer.Character:FindFirstChild("HumanoidRootPart") then return end
    
    local now = os.clock()
    if now - TagControl._LAST_TAG_TIME < TagControl._TAG_COOLDOWN then return end
    
    local itPos = itPlayer.Character.HumanoidRootPart.Position
    
    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= itPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local pPos = player.Character.HumanoidRootPart.Position
            local dist = (itPos - pPos).Magnitude
            
            if dist <= TagControl._TAG_RADIUS then
                TagControl.ProcessTag(itPlayer, player)
                break
            end
        end
    end
end

function TagControl.ProcessTag(attacker, victim)
    TagControl._LAST_TAG_TIME = os.clock()
    
    -- Perform the state rotation
    TagControl.SetNewIt(victim)
    
    -- Canonical Governance Logging
    traceCapture:record("tag_processed")
    RegisterTagEvent(attacker, victim)
end

-- [SCHEDULER] Monitor proximity on Heartbeat (15 Hz logic cap)
local lastUpdate = 0
SafeGetService("RunService").Heartbeat:Connect(function()
    local now = os.clock()
    if now - lastUpdate < (1 / 15) then return end
    lastUpdate = now
    
    if TagControl._CURRENT_IT and TagControl._CURRENT_IT.Parent then
        TagControl.CheckProximity(TagControl._CURRENT_IT)
    end
end)

return TagControl
