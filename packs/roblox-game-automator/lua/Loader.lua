--[[
    OMC Auto-Loader — Open Model Contracts
    Place in ServerScriptService. Runs forever.
    Polls the bridge for the latest contract and hot-loads it automatically.
    No CONTRACT_ID needed. Just run it and submit prompts to the bridge.
--]]

local HttpService       = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BRIDGE_URL   = "http://127.0.0.1:3099"
local POLL_INTERVAL = 8  -- seconds between checks

local function log(msg) print("[OMC] " .. msg) end
local function err(msg) warn("[OMC] ❌ " .. msg) end

local loadedContractId = nil

-- Clean up the previous contract's hub folder
local function clearHub()
    local existing = ReplicatedStorage:FindFirstChild("OMC_Hub")
    if existing then existing:Destroy() end
end

-- Load and execute a single asset server-side
local function execModule(asset)
    local name = asset.moduleName:lower()
    local isClient = name:find("client") or name:find("gui") or name:find("visual")
    if isClient then
        log("Queued for client: " .. asset.moduleName)
        return
    end

    local compiled, compileErr = loadstring(asset.content)
    if not compiled then
        err("Compile failed (" .. asset.moduleName .. "): " .. tostring(compileErr))
        return
    end

    local ok, module = pcall(compiled)
    if not ok then
        err("Runtime error (" .. asset.moduleName .. "): " .. tostring(module))
        return
    end

    if type(module) == "table" and type(module.Initialize) == "function" then
        local initOk, initErr = pcall(function() module:Initialize() end)
        if not initOk then
            err("Initialize failed (" .. asset.moduleName .. "): " .. tostring(initErr))
            return
        end
    end

    log("Loaded: " .. asset.moduleName)
end

-- Pull and execute a full contract
local function loadContract(contractId)
    log("Loading contract: " .. contractId)

    local ok, raw = pcall(function()
        return HttpService:GetAsync(BRIDGE_URL .. "/v1/contract/assets/pull/" .. contractId)
    end)

    if not ok then
        err("Pull failed: " .. tostring(raw))
        return false
    end

    local data = HttpService:JSONDecode(raw)
    if not data.success then
        err("Bridge rejected pull: " .. tostring(data.error))
        return false
    end

    clearHub()

    -- Store source in ReplicatedStorage for client access
    local hub = Instance.new("Folder")
    hub.Name = "OMC_Hub"
    hub.Parent = ReplicatedStorage

    for _, asset in ipairs(data.assets) do
        local store = Instance.new("StringValue")
        store.Name = asset.moduleName
        store.Value = asset.content
        store.Parent = hub

        task.spawn(execModule, asset)
    end

    log("Contract " .. contractId:sub(1, 8) .. " is live — " .. #data.assets .. " module(s)")
    return true
end

-- Poll loop
log("Auto-Loader started. Polling every " .. POLL_INTERVAL .. "s...")

while true do
    local ok, raw = pcall(function()
        return HttpService:GetAsync(BRIDGE_URL .. "/v1/delivery/latest")
    end)

    if ok then
        local data = HttpService:JSONDecode(raw)
        if data.ready and data.contractId ~= loadedContractId then
            log("New contract detected: " .. data.contractId:sub(1, 8))
            local success = loadContract(data.contractId)
            if success then
                loadedContractId = data.contractId
            end
        end
    else
        err("Bridge unreachable: " .. tostring(raw))
    end

    task.wait(POLL_INTERVAL)
end
