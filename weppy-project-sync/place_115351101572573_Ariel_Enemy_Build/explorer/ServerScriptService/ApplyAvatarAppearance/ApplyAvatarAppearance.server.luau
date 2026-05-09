-- Simple script to apply player avatar appearance to characters
local Players = game:GetService("Players")

local function applyAppearanceToCharacter(player, character)
	if not character or not player then return end
	
	-- Wait for Humanoid
	local humanoid = character:WaitForChild("Humanoid", 5)
	if not humanoid then
		warn("Failed to find Humanoid for:", player.Name)
		return
	end
	
	-- Get player's avatar appearance
	local description = Players:GetHumanoidDescriptionFromUserId(player.UserId)
	if not description then
		warn("Failed to get appearance for:", player.Name)
		return
	end
	
	-- Apply appearance
	humanoid:ApplyDescription(description)
	print("Applied appearance to:", player.Name)
end

-- Handle new players
Players.PlayerAdded:Connect(function(player)
	-- Apply appearance to initial character
	if player.Character then
		applyAppearanceToCharacter(player, player.Character)
	end
	
	-- Apply appearance to respawned characters
	player.CharacterAdded:Connect(function(character)
		applyAppearanceToCharacter(player, character)
	end)
end)

-- Handle existing players (in case script loads after players joined)
for _, player in pairs(Players:GetPlayers()) do
	if player.Character then
		applyAppearanceToCharacter(player, player.Character)
	end
	
	player.CharacterAdded:Connect(function(character)
		applyAppearanceToCharacter(player, character)
	end)
end
