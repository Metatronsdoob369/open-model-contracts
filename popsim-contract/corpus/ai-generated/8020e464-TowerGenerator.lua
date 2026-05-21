local TowerGenerator = {}
TowerGenerator.__index = TowerGenerator

function TowerGenerator.new(seed)
	local self = setmetatable({}, TowerGenerator)
	self.Seed = seed or math.random(1, 999999)
	self.ActiveTowers = {}
	self.GeneratedCount = 0
	self.IsChaosRound = false
	self.DashPoints = {}
	return self
end

function TowerGenerator:_createBase(position, width, depth, material)
	local base = Instance.new("Part")
	base.Size = Vector3.new(width, 8, depth)
	base.Position = position + Vector3.new(0, 4, 0)
	base.Anchored = true
	base.Material = material or Enum.Material.Slate
	base.BrickColor = BrickColor.new("Really black")
	base.Parent = workspace
	return base
end

function TowerGenerator:_createBody(base, height, width, depth)
	local body = Instance.new("Part")
	body.Size = Vector3.new(width, height, depth)
	body.Position = base.Position + Vector3.new(0, height / 2 + 4, 0)
	body.Anchored = true
	body.Material = Enum.Material.Slate
	body.BrickColor = BrickColor.new("Dark stone grey")
	body.Parent = workspace
	return body
end

function TowerGenerator:_createSpire(body, height)
	local spire = Instance.new("Part")
	spire.Size = Vector3.new(4, height, 4)
	spire.Position = body.Position + Vector3.new(0, body.Size.Y / 2 + height / 2, 0)
	spire.Anchored = true
	spire.Shape = Enum.PartType.Cylinder
	spire.Material = Enum.Material.Marble
	spire.BrickColor = BrickColor.new("Really black")
	spire.Parent = workspace

	local attachment = Instance.new("Attachment")
	attachment.Position = Vector3.new(0, height / 2, 0)
	attachment.Parent = spire

	if self.IsChaosRound then
		local light = Instance.new("PointLight")
		light.Color = Color3.fromRGB(170, 0, 0)
		light.Brightness = 2
		light.Range = 30
		light.Parent = spire
	end

	return spire
end

function TowerGenerator:GenerateGothicTower(position, height, style)
	height = math.clamp(height or 60, 30, 120)
	local width = 18 + (self.GeneratedCount % 3) * 4
	local depth = width

	local base = self:_createBase(position, width, depth)
	local body = self:_createBody(base, height * 0.7, width, depth)
	local spire = self:_createSpire(body, height * 0.3)

	local towerModel = Instance.new("Model")
	towerModel.Name = "GothicTower_" .. self.GeneratedCount
	base.Parent = towerModel
	body.Parent = towerModel
	spire.Parent = towerModel
	towerModel.Parent = workspace

	local dashAttachment = Instance.new("Attachment")
	dashAttachment.Position = Vector3.new(0, height * 0.5, width / 2 + 3)
	dashAttachment.Parent = body

	table.insert(self.DashPoints, dashAttachment)
	table.insert(self.ActiveTowers, towerModel)
	self.GeneratedCount += 1

	return towerModel
end

function TowerGenerator:GenerateCityBlock(centerPosition, count, chaosMode)
	self.IsChaosRound = chaosMode or false
	self:ClearAllTowers()

	local rng = Random.new(self.Seed)
	for i = 1, count do
		local offset = Vector3.new(
			rng:NextInteger(-80, 80),
			0,
			rng:NextInteger(-80, 80)
		)
		local height = rng:NextInteger(45, 95)
		self:GenerateGothicTower(centerPosition + offset, height, "gothic")
	end
end

function TowerGenerator:ClearAllTowers()
	for _, tower in ipairs(self.ActiveTowers) do
		if tower and tower.Parent then
			tower:Destroy()
		end
	end
	self.ActiveTowers = {}
	self.DashPoints = {}
	self.GeneratedCount = 0
end

function TowerGenerator:GetDashPoints()
	return self.DashPoints
end

function TowerGenerator:SetChaosMode(enabled)
	self.IsChaosRound = enabled
end

return TowerGenerator