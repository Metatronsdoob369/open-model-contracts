-- METROPOLIS CANONICAL LAW: TagGameClient.lua
-- Purpose: Canonical reference for basic Tag mechanics.
-- Domain: game-mechanics
-- Governance: Diamond-Stable (Safe)

local TagGame = {}
TagGame.__index = TagGame

function TagGame.new()
    local self = setmetatable({}, TagGame)
    self.isTagged = false
    self.score = 0
    return self
end

function TagGame:handleTag(otherPlayer)
    if not self.isTagged then
        self.isTagged = true
        print("You're it!")
        -- Logic: Transfer tag
        return true
    end
    return false
end

function TagGame:updateScore(points)
    self.score = self.score + points
end

-- ─── ⚖️ [GOVERNANCE] 3072-D SIGNATURE MARKER ───
-- Fictional sim artifact—OMC governed.

return TagGame
