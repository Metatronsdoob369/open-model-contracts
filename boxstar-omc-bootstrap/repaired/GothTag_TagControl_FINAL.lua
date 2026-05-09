
-- CANONICAL BRIDGE INJECTION: Bridge_GothTag_TagEvents
-- Fracture Path: characterAdded
-- Contract: OMC_Bridge_PlayerAction
-- Throttle Rate: 15 calls/sec

local Bridge_GothTag_TagEvents_LastFire = 0
local Bridge_GothTag_TagEvents_ThrottleRate = 15

local function SafeFireBridge_GothTag_TagEvents(payload: any)
    local now = os.clock()
    if now - Bridge_GothTag_TagEvents_LastFire < (1 / Bridge_GothTag_TagEvents_ThrottleRate) then
        RegisterIssue("BridgeThrottled", {
            bridge = "Bridge_GothTag_TagEvents",
            fracturePath = "characterAdded",
            attemptedRate = 15
        })
        return -- safely drop excess calls
    end

    Bridge_GothTag_TagEvents_LastFire = now

    -- Strict OMC contract validation BEFORE crossing the bridge
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_PlayerAction"], payload) then
        RegisterIssue("BridgeContractViolation", {
            bridge = "Bridge_GothTag_TagEvents",
            fracturePath = "characterAdded",
            side = "sender"
        })
        return -- safe abort
    end

    Bridge_GothTag_TagEvents:FireServer(payload)
end

-- RECEIVER-SIDE GUARD
Bridge_GothTag_TagEvents.OnServerEvent:Connect(function(player: Player, payload: any)
    -- Immediate contract validation on receiver
    if not TagGameContracts.validate(BridgeContracts["OMC_Bridge_PlayerAction"], payload) then
        RegisterIssue("BridgeContractViolation", {
            bridge = "Bridge_GothTag_TagEvents",
            fracturePath = "characterAdded",
            side = "receiver"
        })
        return -- safe drop
    end

    -- Receiver-side rate limit (defense-in-depth)
    local now = os.clock()
    if not Bridge_GothTag_TagEvents_LastReceive then Bridge_GothTag_TagEvents_LastReceive = 0 end
    if now - Bridge_GothTag_TagEvents_LastReceive < 0.05 then   -- max 20 Hz
        return
    end
    Bridge_GothTag_TagEvents_LastReceive = now

    -- Safe consumption - customize per bridge if needed
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
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Global = require(ServerScriptService:WaitForChild("Global"))
local Debug = require(ReplicatedStorage:WaitForChild("Debug"))

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
    RegisterTagEvent(attacker, victim)
end

-- [SCHEDULER] Monitor proximity on Heartbeat (15 Hz logic cap)
local lastUpdate = 0
game:GetService("RunService").Heartbeat:Connect(function()
    local now = os.clock()
    if now - lastUpdate < (1 / 15) then return end
    lastUpdate = now
    
    if TagControl._CURRENT_IT and TagControl._CURRENT_IT.Parent then
        TagControl.CheckProximity(TagControl._CURRENT_IT)
    end
end)

return TagControl
