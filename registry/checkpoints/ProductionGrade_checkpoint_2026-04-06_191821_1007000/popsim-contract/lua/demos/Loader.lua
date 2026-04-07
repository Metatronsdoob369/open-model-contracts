--[[
    @popsim/contract — Supreme Dynamic Loader (HYBRID)
    Place this script in ServerScriptService.
--]]

local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterPlayerScripts = game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")

-- === CONFIGURATION ===
local BRIDGE_URL = "http://localhost:8080/v1/contract"
local API_KEY = "development-only-key"
local CONTRACT_ID = "72ff90e9-a3fa-4012-8a07-bbb65e76f16f" -- Chaos Metropolis

-- === THE HYBRID LOADER ===
local function fetchAssets()
    local headers = { ["X-API-Key"] = API_KEY }
    print("📡 [BRIDGE] Fetching Hybrid assets for Contract:", CONTRACT_ID)
    
    local success, result = pcall(function()
        return HttpService:GetAsync(BRIDGE_URL .. "/assets/pull/" .. CONTRACT_ID, true, headers)
    end)

    if not success then
        warn("❌ Bridge Pull Failed:", result)
        return
    end

    local data = HttpService:JSONDecode(result)
    local hub = Instance.new("Folder")
    hub.Name = "GovernedAssets_" .. CONTRACT_ID
    hub.Parent = ReplicatedStorage -- Shared for Client access

    for _, asset in ipairs(data.assets) do
        print("🔨 [INJECTING] ", asset.moduleName)
        
        local codeStore = Instance.new("StringValue")
        codeStore.Name = asset.moduleName
        codeStore.Value = asset.content
        codeStore.Parent = hub

        local lowerName = asset.moduleName:lower()
        local isClient = lowerName:find("client") or lowerName:find("abilities") or lowerName:find("effect") or lowerName:find("visual")

        if not isClient then
            -- SERVER EXECUTION
            task.spawn(function()
                local ok, func = pcall(loadstring, asset.content)
                if ok and func then
                    print("⚡ [EXECUTING SERVER] ", asset.moduleName)
                    local logic = func()
                    if logic and type(logic) == "table" and logic.Initialize then logic:Initialize() end
                else
                    warn("❌ Server Compilation Error (" .. asset.moduleName .. "): " .. tostring(func))
                end
            end)
        else
            print("🚀 [CLIENT_PREP] ", asset.moduleName)
        end
    end

    -- DETACH: Universal Client Bootstrapper
    local bootstrapper = [=[
        local hub = game:GetService("ReplicatedStorage"):WaitForChild("GovernedAssets_]=] .. CONTRACT_ID .. [=[")
        for _, val in ipairs(hub:GetChildren()) do
            local lowerName = val.Name:lower()
            if lowerName:find("client") or lowerName:find("abilities") or lowerName:find("effect") or lowerName:find("visual") then
                task.spawn(function()
                    print("⚡ [EXECUTING CLIENT] ", val.Name)
                    local ok, func = pcall(loadstring, val.Value)
                    if ok and func then
                        local logic = func()
                        if logic and type(logic) == "table" and logic.Initialize then logic:Initialize() end
                    else
                        warn("❌ Client Compilation Error (" .. val.Name .. "): " .. tostring(func))
                    end
                end)
            end
        end
    ]=]

    -- Inject Bootstrapper to all existing players and future players
    local scriptObj = Instance.new("LocalScript")
    scriptObj.Name = "Metropolis_Bootstrapper"
    scriptObj.Source = bootstrapper
    scriptObj.Parent = game:GetService("StarterGui") -- Reliable injection point
end

fetchAssets()
