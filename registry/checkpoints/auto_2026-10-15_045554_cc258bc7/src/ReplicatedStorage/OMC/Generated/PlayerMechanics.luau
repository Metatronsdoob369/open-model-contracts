--[=[
    🏮 PlayerMechanics.luau
    Author: system-01 (Systems Pilot)
    Part of the Roblox Game Automator Pack
    OMC Manifestation v1.0
]=]

local PlayerMechanics = {}

-- Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

-- Metropolis Aesthetic Config (Obsidian Resonance)
local WALK_SPEED = 24
local DASH_POWER = 60
local DASH_COOLDOWN = 1.2

-- State
local lastDashTime = 0

function PlayerMechanics.Initialize(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        humanoid.WalkSpeed = WALK_SPEED
        
        -- High-Fidelity Dash Logic
        UserInputService.InputBegan:Connect(function(input, processed)
            if processed then return end
            if input.KeyCode == Enum.KeyCode.Q then
                local now = tick()
                if now - lastDashTime >= DASH_COOLDOWN then
                    lastDashTime = now
                    character.PrimaryPart:ApplyImpulse(character.PrimaryPart.CFrame.LookVector * character.PrimaryPart.AssemblyMass * DASH_POWER)
                    
                    -- Visual Feedback: Radiant Blue Trail
                    -- (To be manifested by Architect-01 later)
                    print("[SYSTEM] Radiant Dash executed by " .. player.Name)
                end
            end
        end)
    end)
end

return PlayerMechanics
