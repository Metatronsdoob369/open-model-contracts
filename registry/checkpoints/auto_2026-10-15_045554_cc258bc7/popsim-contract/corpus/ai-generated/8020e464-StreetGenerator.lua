local StreetGenerator = {}

-- State management for generated assets
StreetGenerator.GeneratedStreets = {}
StreetGenerator.ActiveSegments = 0
StreetGenerator.GothicProps = {}
StreetGenerator.MaxSegments = 50

-- Configuration for gothic city streets
local STREET_WIDTH = 40
local SEGMENT_LENGTH = 120
local SIDEWALK_HEIGHT = 2
local LAMP_SPACING = 30
local CHAOS_PROBABILITY = 0.35

-- Internal helper to create base road segment
local function CreateRoadSegment(position, rotation)
	local road = Instance.new("Part")
	road.Name = "GothicRoadSegment"
	road.Size = Vector3.new(STREET_WIDTH, 1, SEGMENT_LENGTH)
	road.Position = position
	road.Orientation = rotation
	road.Material = Enum.Material.Asphalt
	road.Color = Color3.fromRGB(25, 25, 30)
	road.Anchored = true
	road.CanCollide = true
	road.Parent = workspace
	
	-- Add gothic texture details
	local decal = Instance.new("Decal")
	decal.Texture = "rbxassetid://12345678" -- Placeholder gothic crack texture
	decal.Face = Enum.NormalId.Top
	decal.Parent = road
	
	return road
end

-- Internal helper to spawn gothic lampposts and props
local function SpawnGothicProps(segment, startPos)
	local props = {}
	for i = 1, 4 do
		local lamp = Instance.new("Part")
		lamp.Name = "GothicLampPost"
		lamp.Size = Vector3.new(2, 18, 2)
		lamp.Position = startPos + Vector3.new(
			(i % 2 == 0) and 18 or -18,
			9,
			(i - 2.5) * LAMP_SPACING
		)
		lamp.Material = Enum.Material.Metal
		lamp.Color = Color3.fromRGB(40, 35, 45)
		lamp.Anchored = true
		lamp.Parent = segment
		
		-- Add flickering gothic lantern light
		local light = Instance.new("PointLight")
		light.Color = Color3.fromRGB(180, 120, 60)
		light.Brightness = 2.5
		light.Range = 35
		light.Parent = lamp
		
		table.insert(props, lamp)
	end
	StreetGenerator.GothicProps[segment] = props
end

-- Generate a single street segment with chaos elements for rounds
function StreetGenerator:GenerateStreetSegment(basePosition, chaosRoundActive)
	local segmentId = #self.GeneratedStreets + 1
	local rotation = Vector3.new(0, (segmentId % 4) * 15, 0)
	
	local road = CreateRoadSegment(basePosition, rotation)
	self.GeneratedStreets[segmentId] = road
	self.ActiveSegments += 1
	
	-- Sidewalks with gothic railings
	for _, offset in ipairs({-1, 1}) do
		local sidewalk = Instance.new("Part")
		sidewalk.Size = Vector3.new(8, SIDEWALK_HEIGHT, SEGMENT_LENGTH)
		sidewalk.Position = basePosition + Vector3.new(offset * 24, SIDEWALK_HEIGHT / 2, 0)
		sidewalk.Material = Enum.Material.Slate
		sidewalk.Color = Color3.fromRGB(55, 50, 60)
		sidewalk.Anchored = true
		sidewalk.Parent = road
	end
	
	SpawnGothicProps(road, basePosition)
	
	-- Chaos round modifications (dashing obstacles, broken architecture)
	if chaosRoundActive or math.random() < CHAOS_PROBABILITY then
		local debris = Instance.new("Part")
		debris.Name = "ChaosDebris"
		debris.Size = Vector3.new(12, 6, 12)
		debris.Position = basePosition + Vector3.new(math.random(-15, 15), 4, math.random(-40, 40))
		debris.Material = Enum.Material.Concrete
		debris.Color = Color3.fromRGB(70, 40, 35)
		debris.Anchored = true
		debris.CanCollide = true
		debris.Parent = road
		
		-- Tag game dash point
		local dashPad = Instance.new("Part")
		dashPad.Name = "DashPad"
		dashPad.Size = Vector3.new(6, 1, 6)
		dashPad.Position = basePosition + Vector3.new(0, 2, math.random(-30, 30))
		dashPad.Material = Enum.Material.Neon
		dashPad.Color = Color3.fromRGB(120, 40, 180)
		dashPad.Anchored = true
		dashPad.Parent = road
	end
	
	return road
end

-- Generate full street layout for gothic city
function StreetGenerator:GenerateFullStreetLayout(startPosition, numSegments, chaosRoundsEnabled)
	self:ClearAllStreets()
	
	for i = 1, math.min(numSegments, self.MaxSegments) do
		local pos = startPosition + Vector3.new(0, 0, (i - 1) * SEGMENT_LENGTH)
		self:GenerateStreetSegment(pos, chaosRoundsEnabled)
	end
	
	return self.GeneratedStreets
end

-- State cleanup
function StreetGenerator:ClearAllStreets()
	for _, street in pairs(self.GeneratedStreets) do
		if street and street.Parent then
			street:Destroy()
		end
	end
	
	for _, props in pairs(self.GothicProps) do
		for _, prop in ipairs(props) do
			if prop and prop.Parent then prop:Destroy() end
		end
	end
	
	self.GeneratedStreets = {}
	self.GothicProps = {}
	self.ActiveSegments = 0
end

-- Query current generation state
function StreetGenerator:GetGenerationState()
	return {
		segments = self.ActiveSegments,
		totalProps = #self.GothicProps,
		isChaosReady = self.ActiveSegments > 10
	}
end

return StreetGenerator