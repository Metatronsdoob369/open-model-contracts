-- PopSim Delivery Agent v2.1
-- Purpose: Pull generated assets from the Delivery Hub and install them in your Roblox game.
-- Instructions: 
-- 1. Create a Script in ServerScriptService.
-- 2. Paste this code into it.
-- 3. In the Explorer, rename it to "DeliveryAgent".
-- 4. Set 'DELIVERY_HUB_URL' in the CONFIG below.

local HttpService = game:GetService("HttpService")
local ServerScriptService = game:GetService("ServerScriptService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterPlayer = game:GetService("StarterPlayer")

-- === CONFIGURATION ===
local CONFIG = {
    DELIVERY_HUB_URL = "http://localhost:8080", -- Set to your hub address
    AUTO_UNPACK = true, -- If true, it installs scripts and assets automatically
    POLL_INTERVAL = 2, -- Seconds to wait between status checks during generation
}

-- === HELPERS ===

local function log(msg, level)
    local prefix = "[PopSim 🚀] "
    if level == "error" then
        warn(prefix .. "❌ " .. msg)
    else
        print(prefix .. "✨ " .. msg)
    end
end

-- Create folder if not exists
local function ensureFolder(parent, name)
    local folder = parent:FindFirstChild(name)
    if not folder then
        folder = Instance.new("Folder")
        folder.Name = name
        folder.Parent = parent
    end
    return folder
end

-- === CORE LOGIC ===

local DeliveryAgent = {}

-- Step 1: Submit NL Request
function DeliveryAgent.RequestGame(prompt)
    log(`Submitting game ideas: "${prompt.sub(prompt, 1, 30)}..."`)
    
    local url = CONFIG.DELIVERY_HUB_URL .. "/v1/delivery/nl-to-game"
    local payload = HttpService:JSONEncode({
        prompt = prompt,
        options = {
            gate = "SAFE",
            provider = "openai", -- Change if testing different LLMs
            model = "gpt-4o"
        }
    })
    
    local success, response = pcall(function()
        return HttpService:PostAsync(url, payload, Enum.HttpContentType.ApplicationJson)
    end)
    
    if not success then
        log(`Failed to reach Delivery Hub: {response}`, "error")
        return nil
    end

    local data = HttpService:JSONDecode(response)
    if not data.success then
        log(`Hub rejected request: {data.error}`, "error")
        return nil
    end

    log(`✅ Request accepted! Contract ID: {data.contractId}`)
    return data.contractId
end

-- Step 2: Poll for status
function DeliveryAgent.WaitForReady(contractId)
    log(`Waiting for swarm to complete...`)
    
    local url = CONFIG.DELIVERY_HUB_URL .. "/v1/delivery/status/" .. contractId
    local status = "generating"
    
    while status == "generating" do
        task.wait(CONFIG.POLL_INTERVAL)
        local success, response = pcall(function()
            return HttpService:GetAsync(url)
        end)
        
        if success then
            local data = HttpService:JSONDecode(response)
            status = data.status
            if status == "ready" then
                log(`✅ Assets are ready for delivery!`)
                return true
            elseif status == "failed" then
                log(`❌ Generation failed on the hub side.`, "error")
                return false
            end
        else
            log(`Status check failed: {response}`, "error")
            return false
        end
    end
    
    return false
end

-- Step 3: Install
-- Note: ZIP download is handled by the hub. 
-- In a real studio environment, you might need a plugin to unpack ZIPs.
-- This helper script provides the "Manual Download" link for convenience.
function DeliveryAgent.Deploy(contractId)
    local downloadUrl = CONFIG.DELIVERY_HUB_URL .. "/v1/delivery/download/" .. contractId
    log(`--------------------------------------------------`)
    log(`📦 DELIVERY READY!`)
    log(`Download your ZIP package here: {downloadUrl}`)
    log(`--------------------------------------------------`)
    log(`(Run the /v1/delivery/download script to inject automatically in a later update)`)
end

-- === RUN COMMAND ===
-- Usage in Command Bar or console:
-- require(game.ServerScriptService.DeliveryAgent).RequestGame("Build a tag game")

return DeliveryAgent
