-- WeaponData.luau
-- [[ THE ARSENAL DNA ]]

local WeaponData = {
	["PaperAirplane"] = {
		Name = "Paper Airplane",
		Type = "Loitering",
		Speed = 45,
		Gravity = 0.15, -- Low gravity for gliding
		Drag = 0.05,
		Damage = 1,
		Color = Color3.fromRGB(255, 255, 255), -- Classic white paper
		TrailColor = Color3.fromRGB(200, 230, 255),
	},
	
	["Spitball"] = {
		Name = "Straw Spitball",
		Type = "HighVelocity",
		Speed = 120,
		Gravity = 1.0, -- Normal gravity
		Drag = 0.01,
		Damage = 1,
		Color = Color3.fromRGB(240, 240, 240), -- Wet paper gray
		TrailColor = Color3.fromRGB(255, 255, 255),
	}
}

return WeaponData
