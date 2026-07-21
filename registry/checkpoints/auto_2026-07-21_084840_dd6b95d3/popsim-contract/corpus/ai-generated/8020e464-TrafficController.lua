local TrafficController = {}

TrafficController.__index = TrafficController

type TrafficState = "Red" | "Yellow" | "Green" | "Chaos"
type TrafficSignal = {
	Id: number,
	State: TrafficState,
	Duration: number,
	Position: Vector3,
	ConnectedRoads: {string}
}

local SIGNALS: {[number]: TrafficSignal} = {}
local CHAOS_MULTIPLIER = 0.3
local DEFAULT_DURATIONS = {Red = 8, Yellow = 3, Green = 12}

function TrafficController.new(): TrafficController
	local self = setmetatable({}, TrafficController)
	self.ActiveSignals = 0
	self.IsChaosRound = false
	self._signalConnections = {}
	return self
end

function TrafficController:Initialize(cityLayout: Folder)
	for _, road in ipairs(cityLayout:GetChildren()) do
		if road:IsA("Model") and road.Name:match("GothicRoad") then
			local signalId = #SIGNALS + 1
			SIGNALS[signalId] = {
				Id = signalId,
				State = "Red",
				Duration = DEFAULT_DURATIONS.Red,
				Position = road:GetPivot().Position,
				ConnectedRoads = {road.Name}
			}
			self.ActiveSignals += 1
		end
	end
end

function TrafficController:UpdateSignal(signalId: number, newState: TrafficState)
	local signal = SIGNALS[signalId]
	if not signal then return end
	
	local duration = DEFAULT_DURATIONS[newState] or DEFAULT_DURATIONS.Green
	if self.IsChaosRound then
		duration *= CHAOS_MULTIPLIER
	end
	
	signal.State = newState
	signal.Duration = duration
	
	-- Broadcast state change for client visuals and dashing interactions
	game:GetService("ReplicatedStorage"):WaitForChild("TrafficSignalChanged"):FireAllClients(signalId, newState, duration)
end

function TrafficController:CycleSignals()
	for id, signal in pairs(SIGNALS) do
		if signal.State == "Red" then
			self:UpdateSignal(id, "Green")
		elseif signal.State == "Green" then
			self:UpdateSignal(id, "Yellow")
		elseif signal.State == "Yellow" then
			self:UpdateSignal(id, "Red")
		end
	end
end

function TrafficController:StartChaosRound()
	self.IsChaosRound = true
	for id, _ in pairs(SIGNALS) do
		self:UpdateSignal(id, "Chaos")
	end
end

function TrafficController:EndChaosRound()
	self.IsChaosRound = false
	for id, signal in pairs(SIGNALS) do
		self:UpdateSignal(id, "Red")
	end
end

function TrafficController:GetSignalState(signalId: number): TrafficState?
	return SIGNALS[signalId] and SIGNALS[signalId].State
end

function TrafficController:Cleanup()
	table.clear(SIGNALS)
	self.ActiveSignals = 0
	self.IsChaosRound = false
end

return TrafficController