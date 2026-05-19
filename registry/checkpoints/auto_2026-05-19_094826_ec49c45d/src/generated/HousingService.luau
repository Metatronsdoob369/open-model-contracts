-- HousingService.luau
-- Abandoned neighborhood: road, flickering streetlights, 4 walkable houses

local Workspace = game:GetService("Workspace")

local HousingService = {
	Name  = "HousingService",
	State = { folder = nil },
}

local FLOOR_Y = 0.5   -- matches dance floor tile surface
local HOUSE_Y = -2.0  -- forest terrain is lower than dance floor

-- ── Part factory ─────────────────────────────────────────────────────────────
local function mk(parent, size, cf, color, mat, canCollide)
	local p = Instance.new("Part")
	p.Size       = size
	p.CFrame     = cf
	p.Color      = color
	p.Material   = mat or Enum.Material.SmoothPlastic
	p.Anchored   = true
	p.CanCollide = canCollide ~= false
	p.CastShadow = true
	p.Parent     = parent
	return p
end

-- ── Wall builders ─────────────────────────────────────────────────────────────
-- ZWall: face runs along Z axis, thickness along X
-- cx=fixed X pos, cy=vertical center, cz=Z center of wall
local function buildZWall(parent, cx, cy, cz, wW, wH, wT, col, mat, opening)
	local doorW, doorH = 6, 9
	local winW, winH, winSill = 5, 4, 3
	if opening == "door" then
		local lw = (wW - doorW) / 2
		mk(parent, Vector3.new(wT, wH, lw),    CFrame.new(cx, cy, cz - doorW/2 - lw/2), col, mat)
		mk(parent, Vector3.new(wT, wH, lw),    CFrame.new(cx, cy, cz + doorW/2 + lw/2), col, mat)
		local hH = wH - doorH
		mk(parent, Vector3.new(wT, hH, doorW), CFrame.new(cx, cy + wH/2 - hH/2, cz),    col, mat)
	elseif opening == "window" then
		local flY   = cy - wH/2
		local winCY = flY + winSill + winH/2
		local topH  = wH - winSill - winH
		local sw    = (wW - winW) / 2
		mk(parent, Vector3.new(wT, winSill, wW), CFrame.new(cx, flY + winSill/2, cz),        col, mat)
		mk(parent, Vector3.new(wT, topH, wW),    CFrame.new(cx, cy + wH/2 - topH/2, cz),     col, mat)
		mk(parent, Vector3.new(wT, winH, sw),    CFrame.new(cx, winCY, cz - winW/2 - sw/2),  col, mat)
		mk(parent, Vector3.new(wT, winH, sw),    CFrame.new(cx, winCY, cz + winW/2 + sw/2),  col, mat)
	else
		mk(parent, Vector3.new(wT, wH, wW), CFrame.new(cx, cy, cz), col, mat)
	end
end

-- XWall: face runs along X axis, thickness along Z
-- cx=X center, cy=vertical center, cz=fixed Z pos
local function buildXWall(parent, cx, cy, cz, wW, wH, wT, col, mat, opening)
	local doorW, doorH = 6, 9
	local winW, winH, winSill = 5, 4, 3
	if opening == "door" then
		local lw = (wW - doorW) / 2
		mk(parent, Vector3.new(lw, wH, wT),    CFrame.new(cx - doorW/2 - lw/2, cy, cz), col, mat)
		mk(parent, Vector3.new(lw, wH, wT),    CFrame.new(cx + doorW/2 + lw/2, cy, cz), col, mat)
		local hH = wH - doorH
		mk(parent, Vector3.new(doorW, hH, wT), CFrame.new(cx, cy + wH/2 - hH/2, cz),    col, mat)
	elseif opening == "window" then
		local flY   = cy - wH/2
		local winCY = flY + winSill + winH/2
		local topH  = wH - winSill - winH
		local sw    = (wW - winW) / 2
		mk(parent, Vector3.new(wW, winSill, wT), CFrame.new(cx, flY + winSill/2, cz),        col, mat)
		mk(parent, Vector3.new(wW, topH, wT),    CFrame.new(cx, cy + wH/2 - topH/2, cz),     col, mat)
		mk(parent, Vector3.new(sw, winH, wT),    CFrame.new(cx - winW/2 - sw/2, winCY, cz),  col, mat)
		mk(parent, Vector3.new(sw, winH, wT),    CFrame.new(cx + winW/2 + sw/2, winCY, cz),  col, mat)
	else
		mk(parent, Vector3.new(wW, wH, wT), CFrame.new(cx, cy, cz), col, mat)
	end
end

-- ── Interior furnishings ──────────────────────────────────────────────────────

local function furnishBungalow(folder, cx, cz, W, D, H)
	-- Dining table
	mk(folder, Vector3.new(6, 0.4, 3),   CFrame.new(cx, HOUSE_Y+2.7, cz),               Color3.fromRGB(90,65,45),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+2.5, HOUSE_Y+1.25, cz+1),        Color3.fromRGB(80,55,35),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-2.5, HOUSE_Y+1.25, cz+1),        Color3.fromRGB(80,55,35),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+2.5, HOUSE_Y+1.25, cz-1),        Color3.fromRGB(80,55,35),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-2.5, HOUSE_Y+1.25, cz-1),        Color3.fromRGB(80,55,35),  Enum.Material.WoodPlanks)
	-- Fallen chair
	mk(folder, Vector3.new(1.5,3,1.5),   CFrame.new(cx-4, HOUSE_Y+1.5, cz-2) * CFrame.Angles(0,0,math.rad(70)), Color3.fromRGB(70,55,40), Enum.Material.WoodPlanks)
	-- Stacked debris boxes
	mk(folder, Vector3.new(2,2,2),   CFrame.new(cx+4, HOUSE_Y+1, cz+4),    Color3.fromRGB(100,85,60), Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(1.5,1.5,1.5), CFrame.new(cx+4, HOUSE_Y+2.75, cz+4), Color3.fromRGB(95,80,55), Enum.Material.WoodPlanks)
end

local function furnishColonial(folder, cx, cz, W, D, H)
	-- Desk
	mk(folder, Vector3.new(8,0.4,3),   CFrame.new(cx, HOUSE_Y+2.7, cz-3),                Color3.fromRGB(60,45,30),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+3.5, HOUSE_Y+1.25, cz-3+1),      Color3.fromRGB(50,35,25),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-3.5, HOUSE_Y+1.25, cz-3+1),      Color3.fromRGB(50,35,25),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+3.5, HOUSE_Y+1.25, cz-3-1),      Color3.fromRGB(50,35,25),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-3.5, HOUSE_Y+1.25, cz-3-1),      Color3.fromRGB(50,35,25),  Enum.Material.WoodPlanks)
	-- Shelves on wall
	for i = 0, 2 do
		mk(folder, Vector3.new(5,0.4,1.2), CFrame.new(cx, HOUSE_Y+3+i*3, cz+5),         Color3.fromRGB(65,50,35),  Enum.Material.WoodPlanks)
	end
	-- Scattered paper pile
	mk(folder, Vector3.new(3,0.2,2), CFrame.new(cx-2, HOUSE_Y+0.6, cz) * CFrame.Angles(0, math.rad(15), 0), Color3.fromRGB(200,190,170), Enum.Material.SmoothPlastic, false)
end

local function furnishRanch(folder, cx, cz, W, D, H)
	-- Couch
	mk(folder, Vector3.new(8,1.5,3),   CFrame.new(cx-2, HOUSE_Y+0.75, cz+5),             Color3.fromRGB(80,70,60),  Enum.Material.SmoothPlastic)
	mk(folder, Vector3.new(8,2.5,0.8), CFrame.new(cx-2, HOUSE_Y+2.25, cz+6.4),           Color3.fromRGB(80,70,60),  Enum.Material.SmoothPlastic)
	-- Coffee table
	mk(folder, Vector3.new(5,0.3,2.5), CFrame.new(cx-2, HOUSE_Y+1.8, cz+2),              Color3.fromRGB(70,55,35),  Enum.Material.WoodPlanks)
	-- Overturned lamp
	mk(folder, Vector3.new(0.4,5,0.4), CFrame.new(cx+5, HOUSE_Y+0.5, cz-2) * CFrame.Angles(0, 0, math.rad(80)), Color3.fromRGB(150,130,100), Enum.Material.SmoothPlastic)
	-- Lamp shade
	mk(folder, Vector3.new(2,1.2,2),   CFrame.new(cx+5+2, HOUSE_Y+0.6, cz-2),            Color3.fromRGB(180,160,120), Enum.Material.SmoothPlastic)
end

local function furnishVictorian(folder, cx, cz, W, D, H)
	-- Tall wardrobe
	mk(folder, Vector3.new(4,7,2),     CFrame.new(cx-3, HOUSE_Y+3.5, cz+6),              Color3.fromRGB(40,30,20),  Enum.Material.WoodPlanks)
	-- Dining table (old and ornate, slightly larger)
	mk(folder, Vector3.new(5,0.4,2.5), CFrame.new(cx, HOUSE_Y+2.7, cz),                  Color3.fromRGB(50,35,25),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+2, HOUSE_Y+1.25, cz+1),           Color3.fromRGB(40,28,18),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-2, HOUSE_Y+1.25, cz+1),           Color3.fromRGB(40,28,18),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx+2, HOUSE_Y+1.25, cz-1),           Color3.fromRGB(40,28,18),  Enum.Material.WoodPlanks)
	mk(folder, Vector3.new(0.4,2.5,0.4), CFrame.new(cx-2, HOUSE_Y+1.25, cz-1),           Color3.fromRGB(40,28,18),  Enum.Material.WoodPlanks)
	-- Hanging chain from ceiling (chandelier remnant)
	mk(folder, Vector3.new(0.3,4,0.3), CFrame.new(cx, HOUSE_Y+H-2.5, cz),               Color3.fromRGB(50,45,40),  Enum.Material.Metal)
	mk(folder, Vector3.new(1,1,1),     CFrame.new(cx, HOUSE_Y+H-4.6, cz),               Color3.fromRGB(80,70,50),  Enum.Material.Metal)
end

-- ── House builder (single-story, wide open interior) ─────────────────────────
-- frontSign: +1 = front face at cx+D/2 (left-side houses), -1 = at cx-D/2 (right-side).
local function buildHouse(folder, cx, cz, W, D, H, frontSign, wallColor, wallMat, roofColor, furnishFn)
	local T      = 1.2
	local frontX = cx + frontSign * D/2
	local backX  = cx - frontSign * D/2
	local floorC = Color3.fromRGB(80, 65, 50)
	local floorM = Enum.Material.WoodPlanks
	local wallY  = HOUSE_Y + H/2

	-- Floor slab
	mk(folder, Vector3.new(D - T*2, 0.5, W - T*2), CFrame.new(cx, HOUSE_Y + 0.25, cz), floorC, floorM)

	-- Outer walls — one big open room, no internal divider
	buildZWall(folder, frontX, wallY, cz,   W,     H, T, wallColor, wallMat, "door")
	buildZWall(folder, backX,  wallY, cz,   W,     H, T, wallColor, wallMat, "window")
	buildXWall(folder, cx, wallY, cz - W/2, D-T*2, H, T, wallColor, wallMat, "window")
	buildXWall(folder, cx, wallY, cz + W/2, D-T*2, H, T, wallColor, wallMat, "window")

	-- Dim ambient bulb near ceiling centre
	local bulb = mk(folder, Vector3.new(0.4,0.4,0.4), CFrame.new(cx, HOUSE_Y+H-1.5, cz),
		Color3.fromRGB(255,180,80), Enum.Material.Neon, false)
	bulb.Transparency = 0.75
	local pl = Instance.new("PointLight")
	pl.Brightness = 0.3
	pl.Range      = math.max(W, D) * 0.65
	pl.Color      = Color3.fromRGB(200,140,55)
	pl.Parent     = bulb

	-- Roof
	mk(folder, Vector3.new(D + 3, 1.2, W + 3), CFrame.new(cx, HOUSE_Y + H + 0.6, cz),
		roofColor, Enum.Material.SmoothPlastic)

	if furnishFn then
		furnishFn(folder, cx, cz, W, D, H)
	end
end

-- ── Streetlight with flicker ──────────────────────────────────────────────────
local function buildStreetlight(folder, x, z)
	local armDir  = x < 0 and 1 or -1  -- arm points toward road at X=0
	local poleCol = Color3.fromRGB(40, 40, 45)

	-- Pole
	mk(folder, Vector3.new(0.8, 14, 0.8), CFrame.new(x, HOUSE_Y + 7, z), poleCol, Enum.Material.Metal)
	-- Horizontal arm
	mk(folder, Vector3.new(5, 0.5, 0.5),  CFrame.new(x + armDir * 2.5, HOUSE_Y + 13.7, z), poleCol, Enum.Material.Metal)

	-- Light housing at tip of arm
	local housing = mk(folder, Vector3.new(1.4, 1.4, 1.4),
		CFrame.new(x + armDir * 5, HOUSE_Y + 13.3, z),
		Color3.fromRGB(230, 210, 160), Enum.Material.Neon)
	housing.Transparency = 0.3

	local light = Instance.new("PointLight")
	light.Brightness = 2.0
	light.Range      = 32
	light.Color      = Color3.fromRGB(255, 210, 130)
	light.Parent     = housing

	-- Flickering loop — random stutters every 4–18 seconds
	task.spawn(function()
		while housing.Parent do
			task.wait(math.random(4, 18))
			for _ = 1, math.random(1, 4) do
				light.Enabled        = false
				housing.Transparency = 1
				task.wait(math.random() * 0.18 + 0.04)
				light.Enabled        = true
				housing.Transparency = 0.3
				task.wait(math.random() * 0.08 + 0.02)
			end
		end
	end)
end

-- ── Road and cul-de-sac ───────────────────────────────────────────────────────
local function buildRoad(folder)
	local ROAD_Y    = HOUSE_Y           -- match forest terrain level
	local ROAD_W    = 18
	local START_Z   = 220   -- just past dance floor edge (~Z=216)
	local END_Z     = 685   -- deep into the forest (3x original length)
	local ROAD_LEN  = END_Z - START_Z
	local ROAD_CZ   = (START_Z + END_Z) / 2
	local SIDE_W    = 5
	local ROAD_COL  = Color3.fromRGB(32, 32, 36)
	local SIDE_COL  = Color3.fromRGB(88, 86, 82)
	local CURB_COL  = Color3.fromRGB(155, 153, 148)

	-- Clear terrain under the full road strip (centered at ROAD_Y, tall enough to clear grass above and below)
	workspace.Terrain:FillBlock(
		CFrame.new(0, ROAD_Y + 6, ROAD_CZ),
		Vector3.new(50, 20, ROAD_LEN + 20),
		Enum.Material.Air
	)

	-- Road surface
	mk(folder, Vector3.new(ROAD_W, 0.5, ROAD_LEN),
		CFrame.new(0, ROAD_Y, ROAD_CZ), ROAD_COL, Enum.Material.Concrete)

	-- Sidewalks (slightly raised)
	local sideY  = ROAD_Y + 0.35
	local sideXL = -(ROAD_W/2 + SIDE_W/2)   -- -11.5
	local sideXR =  (ROAD_W/2 + SIDE_W/2)   -- +11.5
	mk(folder, Vector3.new(SIDE_W, 0.3, ROAD_LEN), CFrame.new(sideXL, sideY, ROAD_CZ), SIDE_COL, Enum.Material.Concrete)
	mk(folder, Vector3.new(SIDE_W, 0.3, ROAD_LEN), CFrame.new(sideXR, sideY, ROAD_CZ), SIDE_COL, Enum.Material.Concrete)

	-- Curbs (raised lip between road and sidewalk)
	mk(folder, Vector3.new(0.5, 0.55, ROAD_LEN), CFrame.new(sideXL - SIDE_W/2, ROAD_Y + 0.12, ROAD_CZ), CURB_COL, Enum.Material.Concrete)
	mk(folder, Vector3.new(0.5, 0.55, ROAD_LEN), CFrame.new(sideXR + SIDE_W/2, ROAD_Y + 0.12, ROAD_CZ), CURB_COL, Enum.Material.Concrete)

	-- Dashed center line (one dash every 30 studs)
	local dashCount = math.floor(ROAD_LEN / 30)
	for i = 0, dashCount do
		mk(folder, Vector3.new(0.5, 0.55, 7),
			CFrame.new(0, ROAD_Y + 0.01, START_Z + 15 + i * 30),
			Color3.fromRGB(210, 190, 55), Enum.Material.SmoothPlastic, false)
	end

	-- Cul-de-sac turnaround at road end
	workspace.Terrain:FillBlock(
		CFrame.new(0, ROAD_Y + 6, END_Z + 25),
		Vector3.new(90, 20, 70),
		Enum.Material.Air
	)
	mk(folder, Vector3.new(60, 0.5, 44),
		CFrame.new(0, ROAD_Y, END_Z + 22),
		ROAD_COL, Enum.Material.Concrete)
	mk(folder, Vector3.new(60, 0.55, 0.5), CFrame.new(0,  ROAD_Y+0.12, END_Z+1),    CURB_COL, Enum.Material.Concrete)
	mk(folder, Vector3.new(0.5, 0.55, 44), CFrame.new(-30, ROAD_Y+0.12, END_Z+22),  CURB_COL, Enum.Material.Concrete)
	mk(folder, Vector3.new(0.5, 0.55, 44), CFrame.new( 30, ROAD_Y+0.12, END_Z+22),  CURB_COL, Enum.Material.Concrete)

	-- Streetlights: 10 pairs spaced every 45 studs along the road
	local poleXL = sideXL - SIDE_W/2 - 1   -- -15
	local poleXR = sideXR + SIDE_W/2 + 1   -- +15
	for i = 0, 9 do
		local lz = START_Z + 25 + i * 45
		buildStreetlight(folder, poleXL, lz)
		buildStreetlight(folder, poleXR, lz)
	end
end

-- ── Service lifecycle ─────────────────────────────────────────────────────────
function HousingService:Start()
	local folder = Instance.new("Folder")
	folder.Name   = "Sovereign_Neighborhood"
	folder.Parent = Workspace
	self.State.folder = folder

	buildRoad(folder)

	-- Clear terrain under house footprints (centered at HOUSE_Y so grass doesn't poke through)
	for _, hpos in ipairs({ {-52,406},{52,406},{-54,604},{54,604} }) do
		workspace.Terrain:FillBlock(
			CFrame.new(hpos[1], HOUSE_Y + 6, hpos[2]),
			Vector3.new(80, 20, 100),
			Enum.Material.Air
		)
	end

	-- House 1: Bungalow — left side, nearer cluster (brick, warm red)
	-- W=48 (2 rooms), D=24 (deeper for staircase), H=11 per floor
	buildHouse(folder, -52, 406, 48, 24, 11, 1,
		Color3.fromRGB(140, 80, 60), Enum.Material.Brick,
		Color3.fromRGB(50, 35, 25), furnishBungalow)

	-- House 2: Colonial — right side, nearer cluster (pale plaster, dark slate roof)
	buildHouse(folder, 52, 406, 48, 24, 13, -1,
		Color3.fromRGB(178, 168, 152), Enum.Material.SmoothPlastic,
		Color3.fromRGB(42, 38, 34), furnishColonial)

	-- House 3: Ranch — left side, far cluster (concrete, wide and low)
	buildHouse(folder, -54, 604, 56, 26, 10, 1,
		Color3.fromRGB(152, 142, 122), Enum.Material.Concrete,
		Color3.fromRGB(68, 52, 38), furnishRanch)

	-- House 4: Victorian — right side, far cluster (dark purple-gray, tall)
	buildHouse(folder, 54, 604, 40, 26, 14, -1,
		Color3.fromRGB(98, 88, 108), Enum.Material.SmoothPlastic,
		Color3.fromRGB(28, 22, 38), furnishVictorian)

	print("[HOUSING] Neighborhood manifested — 4 houses, road, 6 streetlights.")
end

function HousingService:Init()
	print("[HOUSING] Neighborhood Service anchored.")
end

return HousingService
