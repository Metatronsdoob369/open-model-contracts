--[=[
    {{name}} - GameRoundController
    Sovereign Intelligence — Logic Primitive
    
    Round Length: {{roundLengthSeconds}}s
    Max Players: {{playerCountMax}}
]=]

local GameRoundController = {}
GameRoundController.Config = {
	ROUND_LENGTH = {{roundLengthSeconds}},
	INTERMISSION_TIME = 15
}

function GameRoundController:Init(services)
	self.Services = services
	self.active = false
	self.timer = self.Config.ROUND_LENGTH
end

function GameRoundController:Start()
	print("🏮 [ROUND-CONTROLLER] Ignition Sequence Active.")
	-- Initialize round logic here
end

function GameRoundController:ResetRound()
	self.timer = self.Config.ROUND_LENGTH
	self.active = false
end

return GameRoundController
