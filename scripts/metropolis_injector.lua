-- METROPOLIS SURGICAL INJECTOR (v1.0)
-- This script takes the Surgical Manifest and manifests it in Roblox Studio.

local ServerStorage = game:GetService("ServerStorage")
local HttpService = game:GetService("HttpService")

-- The Manifest (Alpha_001)
local manifest_json = [[
{
  "entities": [
    {
      "name": "RetententionHub_Center",
      "class": "SpawnLocation",
      "cframe": [0, 3, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    },
    {
      "name": "StoreFront_Alpha",
      "class": "Part",
      "cframe": [20, 0, 20, 0.707, 0, 0.707, 0, 1, 0, -0.707, 0, 0.707]
    }
  ]
}
]]

local manifest = HttpService:JSONDecode(manifest_json)

print("🏗️ METROPOLIS: Initiating Surgical Injection...")

for _, entity in ipairs(manifest.entities) do
    local part = Instance.new(entity.class)
    part.Name = entity.name
    -- Converting simple array to CFrame
    local cf = entity.cframe
    part.CFrame = CFrame.new(cf[1], cf[2], cf[3], cf[4], cf[5], cf[6], cf[7], cf[8], cf[9], cf[10], cf[11], cf[12])
    part.Anchored = true
    part.Parent = workspace
    print("💎 Manifested: " .. entity.name)
end

print("✅ METROPOLIS: Surgical Sector Manifestation Complete.")
