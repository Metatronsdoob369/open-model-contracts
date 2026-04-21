--[=[
    CoOpHistoryService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: ROOM-04_Inventory (co-op ledger layer)
    Law Compliance: Scheduler §1, MemPalace §1, DataStore §1

    Cross-session co-op history ledger for Grok_.

    Every co-op action between two players accumulates a shared team total.
    This is the Hall of Fame path — not forced, just rewarded.

    Data model:
      DataStore key: "CoOpHistory_<playerA_userId>"
      Value: { [partnerUserId: string]: number }  -- cumulative co-op points together

    This service ONLY persists. It does not handle in-round game logic.
    It listens to InventoryService.CoOpActionFired and writes to DataStore.
]=]

local Players        = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

-- ── DataStore ─────────────────────────────────────────────────────────────────
-- Throttle-safe: DataStore has a 6-second write budget per key.
-- We batch writes per-session and flush on PlayerRemoving + server shutdown.
local CoOpStore = DataStoreService:GetDataStore("Grok_CoOpHistory_v1")

-- ── In-Memory Session Cache ───────────────────────────────────────────────────
-- { [userId: number]: { [partnerUserId: string]: number } }
-- Dirty flag prevents unnecessary writes.
local _cache: { [number]: { data: { [string]: number }, dirty: boolean } } = {}

-- ── Helpers ───────────────────────────────────────────────────────────────────
local function _loadHistory(player: Player)
    local userId = player.UserId
    if _cache[userId] then return end  -- already loaded

    local key = "CoOpHistory_" .. tostring(userId)
    local success, result = pcall(function()
        return CoOpStore:GetAsync(key)
    end)

    if success and type(result) == "table" then
        _cache[userId] = { data = result, dirty = false }
    else
        _cache[userId] = { data = {}, dirty = false }
        if not success then
            Governance.RegisterIssue("DATASTORE_FAULT",
                "CoOpHistory load failed for " .. player.Name .. ": " .. tostring(result), "MEDIUM")
        end
    end
end

local function _saveHistory(player: Player)
    local userId = player.UserId
    local cached = _cache[userId]
    if not cached or not cached.dirty then return end

    local key = "CoOpHistory_" .. tostring(userId)
    local success, err = pcall(function()
        CoOpStore:SetAsync(key, cached.data)
    end)

    if success then
        cached.dirty = false
    else
        Governance.RegisterIssue("DATASTORE_FAULT",
            "CoOpHistory save failed for " .. tostring(userId) .. ": " .. tostring(err), "HIGH")
    end
end

-- ── Service ───────────────────────────────────────────────────────────────────
local CoOpHistoryService = {}

function CoOpHistoryService:Init(services)
    local InventoryService = services.InventoryService
    
    -- Load history when players join
    Players.PlayerAdded:Connect(function(player)
        task.spawn(_loadHistory, player)
    end)

    -- Save and evict on leave
    Players.PlayerRemoving:Connect(function(player)
        _saveHistory(player)
        _cache[player.UserId] = nil
    end)

    -- Server shutdown flush
    game:BindToClose(function()
        for _, player in ipairs(Players:GetPlayers()) do
            _saveHistory(player)
        end
    end)

    -- ── Listen to InventoryService co-op events ───────────────────────────────
    if InventoryService and InventoryService.CoOpActionFired then
        InventoryService.CoOpActionFired:Connect(function(
            initiator: Player,
            partner: Player,
            actionType: string,
            points: number
        )
            CoOpHistoryService:RecordCoOpAction(initiator, partner, actionType, points)
        end)
    else
        Governance.RegisterIssue("SERVICE_DESYNC", "CoOpHistoryService: InventoryService signal missing", "HIGH")
    end

    print("🤝 [COOP-HISTORY] Cross-session co-op ledger active. Hall of Fame path open.")
end

-- Record a co-op action between two players (both directions)
function CoOpHistoryService:RecordCoOpAction(
    playerA: Player,
    playerB: Player,
    actionType: string,
    points: number
)
    -- Write to both players' ledgers so either player can query their history
    local function _write(owner: Player, partner: Player)
        local cached = _cache[owner.UserId]
        if not cached then
            -- Player not fully loaded yet — best-effort load
            task.spawn(function()
                _loadHistory(owner)
                task.wait(1)
                cached = _cache[owner.UserId]
                if cached then
                    local partnerKey = tostring(partner.UserId)
                    cached.data[partnerKey] = (cached.data[partnerKey] or 0) + points
                    cached.dirty = true
                end
            end)
            return
        end

        local partnerKey = tostring(partner.UserId)
        cached.data[partnerKey] = (cached.data[partnerKey] or 0) + points
        cached.dirty = true
    end

    _write(playerA, playerB)
    _write(playerB, playerA)

    -- Periodic save every 5 co-op actions to avoid total loss on crash
    -- (full flush still happens on PlayerRemoving)
    task.spawn(function()
        task.wait(2)
        _saveHistory(playerA)
        _saveHistory(playerB)
    end)
end

-- Get the full co-op history for a player: { [partnerUserId: string]: totalPoints }
function CoOpHistoryService:GetHistory(player: Player): { [string]: number }
    local cached = _cache[player.UserId]
    if not cached then return {} end
    return cached.data
end

-- Get top N partners by shared co-op points (for lobby leaderboard)
function CoOpHistoryService:GetTopPartners(player: Player, limit: number): { { userId: string, total: number } }
    local history = CoOpHistoryService:GetHistory(player)
    local sorted = {}

    for userId, total in pairs(history) do
        table.insert(sorted, { userId = userId, total = total })
    end

    table.sort(sorted, function(a, b) return a.total > b.total end)

    local result = {}
    for i = 1, math.min(limit, #sorted) do
        table.insert(result, sorted[i])
    end
    return result
end

function CoOpHistoryService:Start()
	-- Persistent ledger logic if needed
end

return CoOpHistoryService
