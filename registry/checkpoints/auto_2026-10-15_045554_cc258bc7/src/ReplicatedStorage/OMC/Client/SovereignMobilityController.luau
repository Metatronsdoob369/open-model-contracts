--[=[
    SovereignMobilityController.luau
    Status: ARCHITECT MANIFEST
    Role: Client-side mobility enhancement (Double-Jump)
]=]

local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local MobilityController = {
	Config = {
		MAX_JUMPS = 2,
		JUMP_IMPULSE = 100,
	},
	State = {
		jumpCount = 0,
	},
}

function MobilityController:Init()
	local player = Players.LocalPlayer
	local character = player.Character or player.CharacterAdded:Wait()
	player.CharacterAdded:Connect(function(newCharacter)
		character = newCharacter
		self.State.jumpCount = 0
	end)
	
	UserInputService.JumpRequest:Connect(function()
		local humanoid = character:FindFirstChild("Humanoid")
		if not humanoid then return end
		
		local state = humanoid:GetState()
		
		if state == Enum.HumanoidStateType.Landed then
			self.State.jumpCount = 0
		elseif state == Enum.HumanoidStateType.Freefall or state == Enum.HumanoidStateType.Jumping then
			if self.State.jumpCount < self.Config.MAX_JUMPS - 1 then
				self.State.jumpCount += 1
				
				-- Apply Kinetic Impulse
				humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
				local hrp = character:FindFirstChild("HumanoidRootPart")
				if hrp then
					hrp.AssemblyLinearVelocity = Vector3.new(
						hrp.AssemblyLinearVelocity.X,
						self.Config.JUMP_IMPULSE,
						hrp.AssemblyLinearVelocity.Z
					)
				end
			end
		end
	end)
end

function MobilityController:Start()
	print("🏮 [MOBILITY] Double-Jump Active.")
end

return MobilityController
