--[[
    OMC Auto-Loader — Escrow API (Drop-In)
    Place in ServerScriptService as a Script.

    Safety goals:
    - Pull newest escrow session and hot-load modules.
    - Decode Base64 even when HttpService:Base64Decode is unavailable.
    - Keep player control stable by forcing a safe spawn zone that is not inside generated geometry.
    - Recover stuck/anchored characters after each load.
--]]

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local BRIDGE_URL = "http://127.0.0.1:3099"
local POLL_INTERVAL = 4

local BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
local SAFE_SPAWN_OFFSET = Vector3.new(0, 6, 120)
local SAFE_ZONE_RADIUS = 24
local SAFE_ZONE_HALF_HEIGHT = 30

local loadedSessionId = nil

local function log(msg)
    print("[OMC] " .. msg)
end

local function err(msg)
    warn("[OMC] ERROR: " .. msg)
end

local function sanitizeName(value)
    local text = tostring(value or "module")
    text = text:gsub("[^%w_%.-]", "_")
    if text == "" then
        return "module"
    end
    return text
end

local function clearHub()
    local existing = ReplicatedStorage:FindFirstChild("OMC_Hub")
    if existing then
        existing:Destroy()
    end
end

local function decodeBase64Fallback(input)
    local cleaned = tostring(input or ""):gsub("[^" .. BASE64_ALPHABET .. "=]", "")
    local bits = {}

    for i = 1, #cleaned do
        local ch = cleaned:sub(i, i)
        if ch ~= "=" then
            local idx = BASE64_ALPHABET:find(ch, 1, true)
            if not idx then
                return nil, "Invalid Base64 character: " .. ch
            end
            local n = idx - 1
            for j = 5, 0, -1 do
                bits[#bits + 1] = math.floor(n / (2 ^ j)) % 2
            end
        end
    end

    local out = table.create(math.floor(#bits / 8))
    for i = 1, #bits, 8 do
        if i + 7 > #bits then
            break
        end
        local n = 0
        for j = 0, 7 do
            n = n * 2 + bits[i + j]
        end
        out[#out + 1] = string.char(n)
    end

    return table.concat(out), nil
end

local function decodeBase64(value)
    local ok, decoded = pcall(function()
        return HttpService:Base64Decode(value)
    end)
    if ok then
        return true, decoded
    end

    local fallbackDecoded, decodeErr = decodeBase64Fallback(value)
    if not fallbackDecoded then
        return false, decodeErr
    end
    return true, fallbackDecoded
end

local function getJson(path)
    local ok, raw = pcall(function()
        return HttpService:GetAsync(BRIDGE_URL .. path)
    end)
    if not ok then
        return false, tostring(raw)
    end

    local decodeOk, payload = pcall(function()
        return HttpService:JSONDecode(raw)
    end)
    if not decodeOk then
        return false, "JSON decode failed: " .. tostring(payload)
    end

    return true, payload
end

local function postJson(path, body)
    local ok, raw = pcall(function()
        return HttpService:PostAsync(
            BRIDGE_URL .. path,
            HttpService:JSONEncode(body),
            Enum.HttpContentType.ApplicationJson
        )
    end)

    if not ok then
        return false, tostring(raw)
    end

    local decodeOk, payload = pcall(function()
        return HttpService:JSONDecode(raw)
    end)
    if not decodeOk then
        return false, "JSON decode failed: " .. tostring(payload)
    end

    return true, payload
end

local function shouldSkipServerExec(moduleEntry)
    local name = string.lower(tostring(moduleEntry.name or moduleEntry.module_id or ""))
    return name:find("client") or name:find("gui") or name:find("visual")
end

local function execServerModule(moduleEntry, decoded)
    if shouldSkipServerExec(moduleEntry) then
        log("Queued for client: " .. tostring(moduleEntry.name or moduleEntry.module_id))
        return true
    end

    if type(loadstring) ~= "function" then
        err("loadstring() unavailable; cannot execute " .. tostring(moduleEntry.name or moduleEntry.module_id))
        return false
    end

    local compiled, compileErr = loadstring(decoded)
    if not compiled then
        err("Compile failed (" .. tostring(moduleEntry.name) .. "): " .. tostring(compileErr))
        return false
    end

    local runOk, moduleResult = pcall(compiled)
    if not runOk then
        err("Runtime error (" .. tostring(moduleEntry.name) .. "): " .. tostring(moduleResult))
        return false
    end

    if type(moduleResult) == "table" and type(moduleResult.Initialize) == "function" then
        local initOk, initErr = pcall(function()
            moduleResult.Initialize(moduleResult)
        end)
        if not initOk then
            err("Initialize failed (" .. tostring(moduleEntry.name) .. "): " .. tostring(initErr))
            return false
        end
    end

    log("Loaded: " .. tostring(moduleEntry.name or moduleEntry.module_id))
    return true
end

local function isPlayerCharacterPart(part)
    local model = part:FindFirstAncestorOfClass("Model")
    if not model then
        return false
    end
    return Players:GetPlayerFromCharacter(model) ~= nil
end

local function inferWorldAnchor()
    local spawn = Workspace:FindFirstChild("SpawnLocation", true)
    if spawn and spawn:IsA("SpawnLocation") then
        return spawn.Position
    end

    local hints = {
        "ArenaFloor", "TagArena", "Lobby", "Cathedral", "BoundaryWalls",
    }

    for _, name in ipairs(hints) do
        local inst = Workspace:FindFirstChild(name, true)
        if inst and inst:IsA("BasePart") then
            return inst.Position
        end
        if inst and inst:IsA("Model") and inst.PrimaryPart then
            return inst.PrimaryPart.Position
        end
    end

    return Vector3.new(0, 6, 0)
end

local function ensurePart(name, size, cframe, color, material)
    local part = Workspace:FindFirstChild(name)
    if not (part and part:IsA("BasePart")) then
        part = Instance.new("Part")
        part.Name = name
        part.TopSurface = Enum.SurfaceType.Smooth
        part.BottomSurface = Enum.SurfaceType.Smooth
        part.Parent = Workspace
    end

    part.Size = size
    part.CFrame = cframe
    part.Anchored = true
    part.CanCollide = true
    part.Color = color
    part.Material = material or Enum.Material.Slate
    return part
end

local function ensureSafeSpawn(anchor)
    local spawnPos = anchor + SAFE_SPAWN_OFFSET
    local safeSpawn = Workspace:FindFirstChild("OMC_SafeSpawn")

    if not (safeSpawn and safeSpawn:IsA("SpawnLocation")) then
        safeSpawn = Instance.new("SpawnLocation")
        safeSpawn.Name = "OMC_SafeSpawn"
        safeSpawn.Parent = Workspace
    end

    safeSpawn.Size = Vector3.new(8, 1, 8)
    safeSpawn.CFrame = CFrame.new(spawnPos)
    safeSpawn.Anchored = true
    safeSpawn.Neutral = true
    safeSpawn.CanCollide = true
    safeSpawn.AllowTeamChangeOnTouch = false

    return safeSpawn
end

local function ensureSafeZone(safeSpawn)
    local spawnPos = safeSpawn.Position

    ensurePart(
        "OMC_SafeFloor",
        Vector3.new(220, 8, 220),
        CFrame.new(spawnPos.X, spawnPos.Y - 6, spawnPos.Z),
        Color3.fromRGB(30, 30, 45),
        Enum.Material.Slate
    )

    local wallY = spawnPos.Y + 20
    local half = 110
    ensurePart("OMC_SafeWall_N", Vector3.new(220, 40, 4), CFrame.new(spawnPos.X, wallY, spawnPos.Z - half), Color3.fromRGB(45, 45, 70))
    ensurePart("OMC_SafeWall_S", Vector3.new(220, 40, 4), CFrame.new(spawnPos.X, wallY, spawnPos.Z + half), Color3.fromRGB(45, 45, 70))
    ensurePart("OMC_SafeWall_E", Vector3.new(4, 40, 220), CFrame.new(spawnPos.X + half, wallY, spawnPos.Z), Color3.fromRGB(45, 45, 70))
    ensurePart("OMC_SafeWall_W", Vector3.new(4, 40, 220), CFrame.new(spawnPos.X - half, wallY, spawnPos.Z), Color3.fromRGB(45, 45, 70))
end

local function clearSpawnBlockers(safeSpawn)
    local center = safeSpawn.Position
    local removed = 0

    for _, inst in ipairs(Workspace:GetDescendants()) do
        if inst:IsA("BasePart") then
            if inst == safeSpawn then
                continue
            end
            if string.sub(inst.Name, 1, 8) == "OMC_Safe" then
                continue
            end
            if isPlayerCharacterPart(inst) then
                continue
            end

            local d = inst.Position - center
            if math.abs(d.X) <= SAFE_ZONE_RADIUS
                and math.abs(d.Z) <= SAFE_ZONE_RADIUS
                and math.abs(d.Y) <= SAFE_ZONE_HALF_HEIGHT then
                inst:Destroy()
                removed = removed + 1
            end
        end
    end

    if removed > 0 then
        log("Cleared " .. tostring(removed) .. " blocker part(s) in safe spawn zone")
    end
end

local function recoverPlayerMobility(player, safeSpawn)
    if not player.Character then
        player:LoadCharacter()
        return
    end

    local character = player.Character
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local hrp = character:FindFirstChild("HumanoidRootPart")

    if not humanoid or not hrp then
        player:LoadCharacter()
        return
    end

    if humanoid.Health <= 0 then
        player:LoadCharacter()
        return
    end

    humanoid.PlatformStand = false
    humanoid.Sit = false
    humanoid.AutoRotate = true
    humanoid.WalkSpeed = math.max(humanoid.WalkSpeed, 16)
    humanoid.JumpPower = math.max(humanoid.JumpPower, 50)

    for _, part in ipairs(character:GetDescendants()) do
        if part:IsA("BasePart") then
            part.Anchored = false
        end
    end

    hrp.AssemblyLinearVelocity = Vector3.new(0, 0, 0)
    hrp.AssemblyAngularVelocity = Vector3.new(0, 0, 0)
    hrp.CFrame = CFrame.new(safeSpawn.Position + Vector3.new(0, 4, 0))
end

local function enforceWorldSanity()
    local anchor = inferWorldAnchor()
    local safeSpawn = ensureSafeSpawn(anchor)

    clearSpawnBlockers(safeSpawn)
    ensureSafeZone(safeSpawn)

    for _, player in ipairs(Players:GetPlayers()) do
        recoverPlayerMobility(player, safeSpawn)
    end

    log("World sanity enforced around safe spawn: (" .. math.floor(safeSpawn.Position.X) .. ", " .. math.floor(safeSpawn.Position.Y) .. ", " .. math.floor(safeSpawn.Position.Z) .. ")")
end

local function hookPlayerRecovery()
    local function onCharacterAdded(player, _character)
        task.wait(0.2)
        local safeSpawn = Workspace:FindFirstChild("OMC_SafeSpawn")
        if safeSpawn and safeSpawn:IsA("SpawnLocation") then
            recoverPlayerMobility(player, safeSpawn)
        end
    end

    local function onPlayerAdded(player)
        player.CharacterAdded:Connect(function(character)
            onCharacterAdded(player, character)
        end)
    end

    Players.PlayerAdded:Connect(onPlayerAdded)
    for _, player in ipairs(Players:GetPlayers()) do
        onPlayerAdded(player)
    end
end

local function loadSession(sessionId, token)
    log("Loading escrow session: " .. string.sub(sessionId, 1, 8))
    local ok, payload = getJson("/escrow/" .. sessionId .. "/modules?token=" .. token)
    if not ok then
        err("Module pull failed: " .. tostring(payload))
        return false
    end

    if type(payload.modules) ~= "table" then
        err("Invalid module payload")
        return false
    end

    clearHub()
    local hub = Instance.new("Folder")
    hub.Name = "OMC_Hub"
    hub.Parent = ReplicatedStorage

    local loadedCount = 0
    for _, moduleEntry in ipairs(payload.modules) do
        local decodeOk, decoded = decodeBase64(moduleEntry.content)
        if not decodeOk then
            err("Base64 decode failed (" .. tostring(moduleEntry.name) .. "): " .. tostring(decoded))
            return false
        end

        local store = Instance.new("StringValue")
        store.Name = sanitizeName(moduleEntry.name or moduleEntry.module_id)
        store.Value = decoded
        store.Parent = hub

        if not execServerModule(moduleEntry, decoded) then
            return false
        end

        loadedCount = loadedCount + 1
    end

    enforceWorldSanity()

    local consumeOk, consumePayload = postJson("/escrow/" .. sessionId .. "/consume", { token = token })
    if not consumeOk then
        err("Consume failed: " .. tostring(consumePayload))
        return false
    end

    if consumePayload.consumed ~= true then
        err("Consume rejected for session " .. sessionId)
        return false
    end

    log("Session " .. string.sub(sessionId, 1, 8) .. " live — " .. tostring(loadedCount) .. " module(s)")
    return true
end

log("Auto-Loader started (escrow mode). Polling every " .. tostring(POLL_INTERVAL) .. "s...")
hookPlayerRecovery()

while true do
    local ok, latest = getJson("/escrow/latest")
    if not ok then
        err("Bridge unreachable: " .. tostring(latest))
    else
        if latest.ready and latest.session_id and latest.token then
            if latest.session_id ~= loadedSessionId then
                log("New session detected: " .. string.sub(latest.session_id, 1, 8))
                local success = loadSession(latest.session_id, latest.token)
                if success then
                    loadedSessionId = latest.session_id
                end
            end
        end
    end

    task.wait(POLL_INTERVAL)
end
lso, 