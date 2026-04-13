
-- METROPOLIS CANONICAL LAW: Metropolis_PizzaService.lua
-- Final Manifestation post-Heuristic Repair Cycle.
-- Derived from: PizzaPlace_GameService Scrape
-- Status: DIAMOND-STABLE

local PizzaService = {}
PizzaService.__index = PizzaService

-- GSI-Validated Dependencies
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Enums = require(ReplicatedStorage:WaitForChild("Enums"))
local Global = require(ServerScriptService:WaitForChild("Global"))
local Timer = require(ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Timer"))
local Dialog = require(ReplicatedStorage:WaitForChild("Dialog"))
local Utility = require(ReplicatedStorage:WaitForChild("Utilities"):WaitForChild("Utility"))
local SoundFX = require(ReplicatedStorage:WaitForChild("SoundFX"))

-- Core Management References
local Players = Global.Players
local Houses = Global.Houses
local Environment = require(ServerScriptService:WaitForChild("Environment"))
local Customers = Global.Customers
local Manager = Global.Manager
local Paycheck = Global.Paycheck

function PizzaService.Init()
    if Enums.IsPartyServer then
        return false
    end
    
    print("🍕 Metropolis Pizza Service Initialized [OMC-STABLE]")
    return true
end

function PizzaService:StartRound()
    -- Heuristic Reconstruction of Manager/Customer Flow
    Manager:InitializeRound()
    Customers:SpawnInitialBatch()
    print("🚀 Pizza Round Started.")
end

function PizzaService:ProcessPaychecks()
    Paycheck:Distribute(Players:GetPlayers())
end

return PizzaService
  