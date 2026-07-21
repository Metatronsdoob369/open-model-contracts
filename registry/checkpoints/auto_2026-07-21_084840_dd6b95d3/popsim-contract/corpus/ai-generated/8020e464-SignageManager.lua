local SignageManager = {}
SignageManager.__index = SignageManager

-- State
SignageManager.ActiveSigns = {}
SignageManager.DefaultStyle = {
	Font = Enum.Font.GothamBlack,
	TextColor = Color3.fromRGB(200, 180, 220),
	BackgroundColor = Color3.fromRGB(30, 10, 40),
	StrokeColor = Color3.fromRGB(120, 60, 180),
	Size = Vector2.new(12, 6),
}

function SignageManager.new()
	local self = setmetatable({}, SignageManager)
	self.ActiveSigns = {}
	return self
end

-- Creates a gothic-themed sign in the world
function SignageManager:CreateSign(position: Vector3, text: string, styleOverride: table?)
	local style = table.clone(self.DefaultStyle)
	if styleOverride then
		for k, v in pairs(styleOverride) do
			style[k] = v
		end
	end

	local part = Instance.new("Part")
	part.Size = Vector3.new(style.Size.X, style.Size.Y, 0.5)
	part.Position = position
	part.Anchored = true
	part.CanCollide = false
	part.Material = Enum.Material.Metal
	part.Color = style.BackgroundColor
	part.Parent = workspace

	local surfaceGui = Instance.new("SurfaceGui")
	surfaceGui.Face = Enum.NormalId.Front
	surfaceGui.Parent = part

	local textLabel = Instance.new("TextLabel")
	textLabel.Size = UDim2.fromScale(1, 1)
	textLabel.BackgroundTransparency = 0.2
	textLabel.BackgroundColor3 = style.BackgroundColor
	textLabel.TextColor3 = style.TextColor
	textLabel.Text = text
	textLabel.Font = style.Font
	textLabel.TextScaled = true
	textLabel.Parent = surfaceGui

	local stroke = Instance.new("UIStroke")
	stroke.Color = style.StrokeColor
	stroke.Thickness = 3
	stroke.Parent = textLabel

	local signData = {
		Part = part,
		Gui = surfaceGui,
		Label = textLabel,
		Style = style,
		Text = text,
	}
	table.insert(self.ActiveSigns, signData)

	return signData
end

-- Updates text on an existing sign
function SignageManager:UpdateSign(signData, newText: string)
	if signData and signData.Label then
		signData.Label.Text = newText
		signData.Text = newText
	end
end

-- Displays a temporary chaos round announcement
function SignageManager:ShowChaosAlert(duration: number)
	local alertSign = self:CreateSign(
		Vector3.new(0, 60, 0),
		"CHAOS ROUND INITIATED",
		{
			TextColor = Color3.fromRGB(255, 80, 80),
			BackgroundColor = Color3.fromRGB(60, 0, 0),
			StrokeColor = Color3.fromRGB(255, 200, 100),
		}
	)

	task.delay(duration, function()
		if alertSign.Part then
			alertSign.Part:Destroy()
		end
		for i, s in ipairs(self.ActiveSigns) do
			if s == alertSign then
				table.remove(self.ActiveSigns, i)
				break
			end
		end
	end)
end

-- Clears all active signs from the world
function SignageManager:ClearAllSigns()
	for _, sign in ipairs(self.ActiveSigns) do
		if sign.Part then
			sign.Part:Destroy()
		end
	end
	self.ActiveSigns = {}
end

return SignageManager