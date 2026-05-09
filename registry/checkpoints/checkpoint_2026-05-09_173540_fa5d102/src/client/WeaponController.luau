-- WeaponController.luau
-- [[ THE PLAYER'S TRIGGER ]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local WeaponController = {
	SelectedWeapon = "PaperAirplane"
}

local player = Players.LocalPlayer
local mouse = player:GetMouse()

function WeaponController:Fire()
	local targetPos = mouse.Hit.Position
	local remote = ReplicatedStorage:WaitForChild("WeaponFire")
	
	print("🖱️ [CLIENT] Firing " .. self.SelectedWeapon)
	remote:FireServer(self.SelectedWeapon, targetPos)
end

function WeaponController:Init(services)
	UserInputService.InputBegan:Connect(function(input, processed)
		if processed then return end
		
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			self:Fire()
		elseif input.KeyCode == Enum.KeyCode.One then
			self.SelectedWeapon = "PaperAirplane"
			print("✈️ [CLIENT] Selected: Paper Airplane")
		elseif input.KeyCode == Enum.KeyCode.Two then
			self.SelectedWeapon = "Spitball"
			print("⚾ [CLIENT] Selected: Straw Spitball")
		end
	end)
end

function WeaponController:Start()
	print("⚔️ [CLIENT] Weapon Controller online. Press 1/2 to swap.")
end

return WeaponController
