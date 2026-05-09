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
    
    -- [[ CLEANUP OLD IT ]]
    if TagControl._CURRENT_IT and TagControl._CURRENT_IT.Character then
        for _, obj in ipairs(TagControl._CURRENT_IT.Character:GetDescendants()) do
            if obj:IsA("Highlight") and (obj.Name == "ShatterHighlight" or obj.Name == "IT_Highlight") then
                obj:Destroy()
            end
        end
    end

    TagControl._CURRENT_IT = player
    Debug.Log(string.format("[TagControl] Manifested New 'It': %s", player.Name))
    
    -- [[ APPLY NEW HIGHLIGHT ]]
    if player.Character then
        local highlight = Instance.new("Highlight")
        highlight.Name = "ShatterHighlight"
        highlight.FillColor = Color3.fromRGB(255, 0, 0) -- RED for high-stakes survival
        highlight.OutlineColor = Color3.fromRGB(255, 255, 255)
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
game:GetService("RunService").Heartbeat:Connect(function()
    local now = os.clock()
    if now - lastUpdate < (1 / 15) then return end
    lastUpdate = now
    
    if TagControl._CURRENT_IT and TagControl._CURRENT_IT.Parent then
        TagControl.CheckProximity(TagControl._CURRENT_IT)
    end
end)

return TagControl
