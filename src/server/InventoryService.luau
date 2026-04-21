--[=[
    InventoryService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: ROOM-04_Inventory
    Law Compliance: Scheduler §1, MemPalace §1, Contract Mirroring §1

    3-slot server-authoritative inventory for Grok_.
    Fast-action design: pickup-only, instant activate, no menus.
    Mobile-first HUD bridge included.

    Co-Op actions are EVENTS, not state — this service fires them and
    CoOpHistoryService handles persistence. Inventory stays decoupled.
]=]

local Players         = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

-- ── Sovereign Anchors ─────────────────────────────────────────────────────────
local OMC       = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

-- ── Constants ─────────────────────────────────────────────────────────────────
local MAX_SLOTS = 3   -- Fast-action cap. Do not raise without design review.

-- ── Item Registry ─────────────────────────────────────────────────────────────
-- All pickupable items must be registered here.
-- 'activate' is called server-side when the player uses the slot.
-- 'coopActionType' (optional) marks this item as co-op eligible.
local ITEM_REGISTRY: { [string]: ItemDef } = {
    Jetpack = {
        id            = "Jetpack",
        displayName   = "JETPACK",
        icon          = "rbxasset://textures/ui/GuiImagePlaceholder.png", -- Guaranteed visible
        duration      = 20,                               
        coopActionType = "jetpack_throw",
        soundId       = "rbxassetid://1840645068",        
    },
    Cloak = {
        id            = "Cloak",
        displayName   = "CLOAK",
        icon          = "rbxasset://textures/ui/GuiImagePlaceholder.png", -- Guaranteed visible
        duration      = 15,
        coopActionType = nil,
        soundId       = "rbxassetid://9061033486",       -- Ethereal Cloak Sound
    },
}

-- ── Type Definitions ──────────────────────────────────────────────────────────
type ItemDef = {
    id: string,
    displayName: string,
    icon: string,
    duration: number,
    coopActionType: string?,
}

type Slot = ItemDef?   -- nil = empty

type PlayerInventory = {
    slots: { [number]: Slot },  -- index 1-3
    activeCooldowns: { [number]: boolean },
}

-- ── Bridge Factory ────────────────────────────────────────────────────────────
local function CreateBridge(name: string)
    local remote = ReplicatedStorage:FindFirstChild(name)
        or Instance.new("RemoteEvent")
    remote.Name   = name
    remote.Parent = ReplicatedStorage
    return {
        FireClient  = function(player, ...) remote:FireClient(player, ...) end,
        FireAll     = function(...) remote:FireAllClients(...) end,
        OnEvent     = remote.OnServerEvent,
    }
end

local function CreateCoOpBridge(name: string)
    -- RemoteFunction for co-op request/response (needs a return value)
    local rf = ReplicatedStorage:FindFirstChild(name)
        or Instance.new("RemoteFunction")
    rf.Name   = name
    rf.Parent = ReplicatedStorage
    return rf
end

-- ── Service Definition ────────────────────────────────────────────────────────
local InventoryService = {}
InventoryService.__index = InventoryService

-- { [Player]: PlayerInventory }
local _inventories: { [Player]: PlayerInventory } = {}

-- Fired when any co-op action resolves — CoOpHistoryService listens to this
-- Signature: (initiator: Player, partner: Player, actionType: string, points: number)
local CoOpActionFired = Instance.new("BindableEvent")
InventoryService.CoOpActionFired = CoOpActionFired.Event

-- Bridges
local InventorySyncBridge  = CreateBridge("OMC_InventorySync")   -- server → client HUD sync
local ActivateBridge       = CreateBridge("OMC_InventoryActivate") -- client → server activate
local CoOpRequestBridge    = CreateBridge("OMC_CoOpRequest")       -- server → client request popup
local CoOpResponseBridge   = CreateBridge("OMC_CoOpResponse")      -- client → server accept/decline
local PickupBridge         = CreateBridge("OMC_InventoryPickup")   -- server → client pickup feedback

-- ── Internal Helpers ─────────────────────────────────────────────────────────

local function _sendToClient(player: Player, inventory: PlayerInventory)
    local serialized = {}
    for i = 1, MAX_SLOTS do
        local item = inventory.slots[i]
        if item then
            serialized[i] = {
                id          = item.id,
                displayName = item.displayName,
                icon        = item.icon,
                duration    = item.duration,
            }
        else
            serialized[i] = "EMPTY" -- Use a string signal to avoid table fragmentation
        end
    end
    InventorySyncBridge.FireClient(player, serialized)
end

local function _getFirstEmptySlot(inventory: PlayerInventory): number?
    for i = 1, MAX_SLOTS do
        if inventory.slots[i] == nil then
            return i
        end
    end
    return nil
end

local function _clearSlot(player: Player, slotIndex: number)
    local inv = _inventories[player]
    if not inv then return end
    inv.slots[slotIndex] = nil
    _sendToClient(player, inv)
end

-- ── Co-Op Request Flow ────────────────────────────────────────────────────────
-- When a player activates a co-op-eligible item, they optionally send a
-- co-op request. This is OPTIONAL — they can use the item solo anytime.
-- 'targetPlayer' = nil means PUBLIC (all unpartnered players see it).

local _pendingRequests: { [Player]: { target: Player?, itemId: string, expires: number } } = {}

local function _sendCoOpRequest(initiator: Player, item: ItemDef, targetPlayer: Player?)
    -- Build request payload
    local payload = {
        initiatorId   = initiator.UserId,
        initiatorName = initiator.Name,
        itemId        = item.id,
        actionType    = item.coopActionType,
        isPublic      = targetPlayer == nil,
    }

    if targetPlayer then
        -- Private: notify only the target
        CoOpRequestBridge.FireClient(targetPlayer, payload)
    else
        -- Public: notify all OTHER players who are in the game
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= initiator then
                CoOpRequestBridge.FireClient(p, payload)
            end
        end
    end

    -- Track pending request (expires when item duration ends)
    _pendingRequests[initiator] = {
        target  = targetPlayer,
        itemId  = item.id,
        expires = os.clock() + item.duration,
    }

    Telemetry.dispatchPulse({
        event     = "CoOp_Request_Sent",
        initiator = initiator.Name,
        itemId    = item.id,
        isPublic  = targetPlayer == nil,
    })
end

local function _resolveCoOpAction(initiator: Player, partner: Player, actionType: string)
    -- Award co-op point bonus and fire the event for CoOpHistoryService
    local CO_OP_BONUS_POINTS = 150  -- base — will be scaled per action type later

    CoOpActionFired:Fire(initiator, partner, actionType, CO_OP_BONUS_POINTS)

    Telemetry.dispatchPulse({
        event      = "CoOp_Action_Resolved",
        initiator  = initiator.Name,
        partner    = partner.Name,
        actionType = actionType,
        points     = CO_OP_BONUS_POINTS,
    })

    Governance.RegisterIssue(
        "COOP_ACTION",
        string.format("%s + %s resolved [%s] +%d pts each",
            initiator.Name, partner.Name, actionType, CO_OP_BONUS_POINTS),
        "LOW"
    )
end

-- ── Public API ────────────────────────────────────────────────────────────────

-- Called by init.server.luau during ignition
function InventoryService:Init()

    -- Player lifecycle
    Players.PlayerAdded:Connect(function(player)
        _inventories[player] = {
            slots          = { [1] = nil, [2] = nil, [3] = nil },
            activeCooldowns = {},
        }
        _sendToClient(player, _inventories[player])
    end)

    Players.PlayerRemoving:Connect(function(player)
        _inventories[player]    = nil
        _pendingRequests[player] = nil
    end)

    -- ── Client: Activate slot ─────────────────────────────────────────────────
    -- Payload: { slotIndex: number, coopMode: "solo"|"private"|"public", targetUserId: number? }
    ActivateBridge.OnEvent:Connect(function(player: Player, payload)
        local inv = _inventories[player]
        if not inv then return end

        -- Debounce activation
        if player:GetAttribute("Activating") then return end
        player:SetAttribute("Activating", true)
        task.delay(0.5, function() player:SetAttribute("Activating", nil) end)

        local slotIndex = payload and payload.slotIndex
        if type(slotIndex) ~= "number"
            or slotIndex < 1
            or slotIndex > MAX_SLOTS then
            Governance.RegisterIssue("INVENTORY_FAULT",
                player.Name .. " sent invalid slotIndex: " .. tostring(slotIndex), "MEDIUM")
            return
        end

        local item = inv.slots[slotIndex]
        if not item then return end  -- empty slot, ignore

        -- Cooldown guard (prevent double-fire)
        if inv.activeCooldowns[slotIndex] then return end
        inv.activeCooldowns[slotIndex] = true

        -- Consume the slot immediately (item is used on activation)
        _clearSlot(player, slotIndex)

        -- ── POWER MANIFESTATION ──
        local char = player.Character
        if char then
            if item.id == "Jetpack" then
                -- Apply Steerable Flight Impulse
                local hrp = char:FindFirstChild("HumanoidRootPart")
                local humanoid = char:FindFirstChild("Humanoid")
                if hrp and humanoid then
                    local attachment = Instance.new("Attachment", hrp)
                    attachment.Name = "JetpackAttachment"
                    local force = Instance.new("LinearVelocity")
                    force.MaxForce = 99999
                    force.VelocityConstraintMode = Enum.VelocityConstraintMode.Vector
                    force.Attachment0 = attachment
                    force.RelativeTo = Enum.ActuatorRelativeTo.World
                    force.Parent = hrp
                    
                    -- SONIC MANIFEST (Fixed Public Sound)
                    local sound = Instance.new("Sound")
                    sound.SoundId = "rbxassetid://131102685"
                    sound.Volume = 0.5
                    sound.Looped = true
                    sound.Parent = hrp
                    sound:Play()
                    
                    humanoid.PlatformStand = true -- Aerial mode
                    
                    -- STEERING LOOP (Commander Edition)
                    local startTime = os.clock()
                    task.spawn(function()
                        pcall(function() 
                            humanoid:ChangeState(Enum.HumanoidStateType.Physics)
                            while os.clock() - startTime < item.duration and player.Parent and force.Parent do
                                local moveDir = humanoid.MoveDirection
                                -- Upgraded Steering: Follow camera/movement direction
                                local velocity = Vector3.new(moveDir.X * 55, 35, moveDir.Z * 55) 
                                
                                if hrp.Position.Y > 30 then
                                    player:SetAttribute("Sovereign_FlightRisk", true)
                                else
                                    player:SetAttribute("Sovereign_FlightRisk", false)
                                end

                                if moveDir.Magnitude < 0.1 then
                                    velocity = Vector3.new(0, 5, 0) -- Hover
                                end
                                
                                if force and force.Parent then
                                    force.VectorVelocity = velocity
                                end
                                task.wait(0.05) -- Faster response
                            end
                        end)
                        -- Shutdown Cleanup & Fall Safety
                        player:SetAttribute("Sovereign_FlightRisk", false)
                        if force and force.Parent then force:Destroy() end
                        if attachment and attachment.Parent then attachment:Destroy() end
                        if sound and sound.Parent then sound:Stop() sound:Destroy() end
                        
                        -- Grant Fall Invincibility
                        local ff = Instance.new("ForceField", char)
                        task.delay(5, function() if ff.Parent then ff:Destroy() end end)
                        
                        if humanoid then 
                            humanoid:ChangeState(Enum.HumanoidStateType.Landed)
                            humanoid.PlatformStand = false 
                        end
                    end)
                end
            elseif item.id == "Cloak" or item.id == "InvisCloak" then
                -- Apply Transparency
                for _, part in ipairs(char:GetDescendants()) do
                    if part:IsA("BasePart") or part:IsA("Decal") then
                        TweenService:Create(part, TweenInfo.new(0.5), { Transparency = 0.8 }):Play()
                    end
                end
                task.delay(item.duration, function()
                    if player.Parent then
                        for _, part in ipairs(char:GetDescendants()) do
                            if part:IsA("BasePart") or part:IsA("Decal") then
                                TweenService:Create(part, TweenInfo.new(0.5), { Transparency = 0 }):Play()
                            end
                        end
                    end
                end)
            end
        end

        -- Handle co-op request if applicable
        local coopMode = payload.coopMode   -- "solo" | "public" | "private"
        if item.coopActionType and coopMode ~= "solo" then
            local targetPlayer: Player? = nil
            if coopMode == "private" and payload.targetUserId then
                targetPlayer = Players:GetPlayerByUserId(payload.targetUserId)
            end
            _sendCoOpRequest(player, item, targetPlayer)
        end

        -- Dispatch item-specific activation event for the item's own service to handle
        -- (JetpackService, SirenService, etc. listen for this)
        local activationEvent = Instance.new("BindableEvent")
        -- Item services connect to OMC_ItemActivated RemoteEvent
        local activateSignal = ReplicatedStorage:FindFirstChild("OMC_ItemActivated")
            or Instance.new("RemoteEvent")
        activateSignal.Name   = "OMC_ItemActivated"
        activateSignal.Parent = ReplicatedStorage
        activateSignal:FireAllClients()  -- item services handle their own filtering

        -- Broadcast to all for item-service routing
        local itemActivatedBE = ReplicatedStorage:FindFirstChild("OMC_ItemActivatedServer")
            or Instance.new("BindableEvent")
        itemActivatedBE.Name   = "OMC_ItemActivatedServer"
        itemActivatedBE.Parent = ReplicatedStorage
        itemActivatedBE:Fire(player, item.id, item.duration)

        -- Release cooldown after item duration
        task.delay(item.duration + 0.5, function()
            if inv then
                inv.activeCooldowns[slotIndex] = nil
            end
        end)

        Telemetry.dispatchPulse({
            event    = "Inventory_Activate",
            player   = player.Name,
            item     = item.id,
            coopMode = coopMode or "solo",
        })
    end)

    -- ── Client: Co-Op response ────────────────────────────────────────────────
    -- Payload: { initiatorUserId: number, accepted: boolean }
    CoOpResponseBridge.OnEvent:Connect(function(partner: Player, payload)
        if not payload or type(payload.initiatorUserId) ~= "number" then return end

        local initiator = Players:GetPlayerByUserId(payload.initiatorUserId)
        if not initiator then return end

        local pending = _pendingRequests[initiator]
        if not pending then return end -- expired or already resolved

        -- Validate the request hasn't expired
        if os.clock() > pending.expires then
            _pendingRequests[initiator] = nil
            return
        end

        if payload.accepted then
            -- Resolve the co-op action
            local item = ITEM_REGISTRY[pending.itemId]
            if item and item.coopActionType then
                _resolveCoOpAction(initiator, partner, item.coopActionType)
            end
        end

        _pendingRequests[initiator] = nil
    end)

    print("🎒 [INVENTORY] ROOM-04_Inventory manifest. 3-slot sovereign store active.")
end

-- Pickup: called by world pickup scripts (part touched handler)
-- Returns true if item was added, false if inventory is full
function InventoryService:PickupItem(player: Player, itemId: string): boolean
    local inv = _inventories[player]
    if not inv then return false end

    -- Collection Debounce (Stop the Triple-Fill)
    if player:GetAttribute("Collecting") then return false end
    player:SetAttribute("Collecting", true)
    task.delay(0.5, function() player:SetAttribute("Collecting", nil) end)

    local itemDef = ITEM_REGISTRY[itemId]
    if not itemDef then
        Governance.RegisterIssue("INVENTORY_FAULT",
            "Unknown itemId for pickup: " .. tostring(itemId), "MEDIUM")
        return false
    end

    local slot = _getFirstEmptySlot(inv)
    if not slot then
        -- Inventory full — send feedback to client
        PickupBridge.FireClient(player, { success = false, reason = "FULL" })
        return false
    end

    inv.slots[slot] = itemDef
    _sendToClient(player, inv)
    PickupBridge.FireClient(player, { success = true, itemId = itemId, slot = slot })

    Telemetry.dispatchPulse({
        event  = "Inventory_Pickup",
        player = player.Name,
        item   = itemId,
        slot   = slot,
    })

    return true
end

-- Clear a player's inventory (on round reset)
function InventoryService:ClearInventory(player: Player)
    local inv = _inventories[player]
    if not inv then return end
    for i = 1, MAX_SLOTS do
        inv.slots[i] = nil
    end
    inv.activeCooldowns = {}
    _sendToClient(player, inv)
end

-- Read-only slot check (for other services)
function InventoryService:GetSlots(player: Player): { [number]: Slot }
    local inv = _inventories[player]
    if not inv then return {} end
    return inv.slots
end

function InventoryService:Start()
	-- Persistent inventory logic if needed
end

return InventoryService
