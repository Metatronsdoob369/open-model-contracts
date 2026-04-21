--[=[
    EnemyService.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: ROOM-05_EnemyAI
    Law Compliance: Phase Resonance §2, Spatio-Temporal Integrity §7

    Handles the manifestation of the "Flying Predator" Drone.
    The Predator only hunts "Flight Risks" (players using Jetpacks at altitude).
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

-- Sovereign Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

local EnemyService = {
	Name = "EnemyService",
	Config = {
		PREDATOR_SPEED = 25,
		DETECTION_ALTITUDE = 30,
		ATTACK_RADIUS = 8,
		COLOR = Color3.fromRGB(255, 0, 50), -- Aggressive Red
	},
	ActiveDrone = nil,
}

-- [[ PRIVATE METHODS ]]

local function CreatePredatorVisual()
	local model = Instance.new("Part")
	model.Name = "OMC_Predator"
	model.Shape = Enum.PartType.Ball
	model.Size = Vector3.new(4, 4, 4)
	model.Color = EnemyService.Config.COLOR
	model.Material = Enum.Material.Neon
	model.Anchored = true
	model.CanCollide = false
	model.Parent = workspace
	
	local glow = Instance.new("PointLight")
	glow.Color = EnemyService.Config.COLOR
	glow.Range = 20
	glow.Brightness = 4
	glow.Parent = model
	
	-- Trail for speed effect
	local attachment = Instance.new("Attachment", model)
	local trail = Instance.new("Trail")
	trail.Attachment0 = attachment
	trail.Attachment1 = Instance.new("Attachment", model)
	trail.Attachment1.Position = Vector3.new(0, 2, 0)
	trail.Color = ColorSequence.new(EnemyService.Config.COLOR)
	trail.Transparency = NumberSequence.new(0.5, 1)
	trail.Lifetime = 0.5
	trail.Parent = model
	
	return model
end

-- [[ PUBLIC INTERFACE ]]

function EnemyService:Init()
	print("🛸 [ENEMY-SERVICE] Predator AI manifest. Watching the skies...")
end

function EnemyService:Start()
	task.spawn(function()
		while true do
			local target = self:FindFlightRisk()
			if target then
				if not self.ActiveDrone then
					self.ActiveDrone = CreatePredatorVisual()
					self.ActiveDrone.Position = target.Character.PrimaryPart.Position + Vector3.new(0, 100, 0) -- Spawn from above
					Telemetry.dispatchPulse({ event = "Predator_Manifest", target = target.Name })
				end
				self:Hunt(target)
			else
				if self.ActiveDrone then
					self.ActiveDrone:Destroy()
					self.ActiveDrone = nil
				end
			end
			task.wait(0.1)
		end
	end)
end

function EnemyService:FindFlightRisk()
	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("Sovereign_FlightRisk") == true then
			local char = player.Character
			if char and char.PrimaryPart then
				return player
			end
		end
	end
	return nil
end

function EnemyService:Hunt(player)
	local drone = self.ActiveDrone
	local char = player.Character
	if not drone or not char or not char.PrimaryPart then return end
	
	local targetPos = char.PrimaryPart.Position + Vector3.new(0, 5, 0) -- Hover slightly above
	local direction = (targetPos - drone.Position).Unit
	local distance = (targetPos - drone.Position).Magnitude
	
	-- Movement
	drone.Position = drone.Position:Lerp(targetPos, 0.1) -- Smooth chase
	
	-- Attack Logic
	if distance < self.Config.ATTACK_RADIUS then
		self:Attack(player)
	end
end

function EnemyService:Attack(player)
	local char = player.Character
	if not char or not char:FindFirstChild("Humanoid") then return end
	
	-- Disrupt Flight
	char.Humanoid.PlatformStand = false
	char.Humanoid.Jump = true
	
	-- Visual Feedback
	Governance.RegisterIssue("PREDATOR_HIT", player.Name .. " struck by Predator!", "LOW")
	
	-- Destroy the drone after a successful hit (requires cooling down)
	if self.ActiveDrone then
		self.ActiveDrone:Destroy()
		self.ActiveDrone = nil
		task.wait(5) -- Cooldown before next hunt
	end
end

return EnemyService
