local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local omcRoot = ReplicatedStorage:WaitForChild("OMC")
local generated = omcRoot:WaitForChild("Generated")
local clientRoot = omcRoot:WaitForChild("Client")

local Telemetry = require(generated:WaitForChild("Telemetry"))
local CharacterController = require(clientRoot:WaitForChild("CharacterController"))
local MobilityController = require(clientRoot:WaitForChild("SovereignMobilityController"))
local LobbyController = require(clientRoot:WaitForChild("LobbyController"))

local services = {
	CharacterService = {
		CharacterLoaded = {
			Connect = function(_, _fn)
				-- Stubbed client bridge.
			end,
		},
		GetCharacter = function()
			return player.Character
		end,
	},
}

CharacterController:Init(services)
MobilityController:Init(services)
LobbyController:Init()

CharacterController:Start()
MobilityController:Start()
LobbyController:Start()

pcall(function()
	Telemetry.dispatchPulse({ event = "Client_Bootstrap_Success" })
end)
print("[CLIENT] OMC bootstrap loaded from StarterPlayerScripts.")
