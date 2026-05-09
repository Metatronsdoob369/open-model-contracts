--[=[
    LobbyController.luau
    Sovereign Intelligence — Manifestation Layer
    
    Handles client-side lobby interactions, catapult launches, and seat synchronization.
]=]

local LobbyController = {}
LobbyController.State = {
	inLobby = false,
	countdown = 0
}

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local OMC = ReplicatedStorage:WaitForChild("OMC")
local LobbyRemote = OMC:WaitForChild("LobbyRemote")

function LobbyController:Init(services)
	self.Services = services
end

function LobbyController:Start()
	print("🏮 [LOBBY-CONTROLLER] Sovereign Ears Online.")
	
	LobbyRemote.OnClientEvent:Connect(function(action, data)
		if action == "UpdateCountdown" then
			self.State.countdown = data.time
			-- Extend here for HUD countdown visualization
		elseif action == "Launch" then
			print("🚀 [LOBBY-CONTROLLER] Launch Sequence Initiated!")
		end
	end)
end

return LobbyController
