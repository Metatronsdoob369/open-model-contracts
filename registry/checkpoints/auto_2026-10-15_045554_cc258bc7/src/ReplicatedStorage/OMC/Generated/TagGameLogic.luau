--[=[
    🏮 TagGameLogic.luau
    Author: system-01 (Systems Pilot)
    Part of the Roblox Game Automator Pack
    Competitive Sector: Metropolis
]=]

local TagGameLogic = {}

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Config
local TAG_COOLDOWN = 3
local AURA_COLOR = Color3.fromHex("#FF006E") -- Radiant Magenta

-- State
local currentTagger = nil
local lastTagTime = 0

function TagGameLogic.OnTouch(part, tagger)
    local character = part.Parent
    local player = Players:GetPlayerFromCharacter(character)
    
    if player and player ~= tagger then
        local now = tick()
        if now - lastTagTime >= TAG_COOLDOWN then
            TagGameLogic.SetTagger(player)
            print("[TAG] " .. tagger.Name .. " tagged " .. player.Name)
        end
    end
end

function TagGameLogic.SetTagger(player)
    currentTagger = player
    lastTagTime = tick()
    
    -- In a real manifestation, we would send a RemoteEvent here
    -- ReplicatedStorage.Events.TagUpdate:FireAllClients(player)
    
    local character = player.Character
    if character then
        local highlight = character:FindFirstChild("TagHighlight") or Instance.new("Highlight")
        highlight.Name = "TagHighlight"
        highlight.FillColor = AURA_COLOR
        highlight.OutlineColor = Color3.new(1, 1, 1)
        highlight.Parent = character
    end
end

return TagGameLogic
