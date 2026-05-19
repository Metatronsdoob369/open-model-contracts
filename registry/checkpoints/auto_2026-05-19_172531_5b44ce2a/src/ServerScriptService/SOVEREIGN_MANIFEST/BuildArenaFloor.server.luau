-- BuildArenaFloor.server.luau
-- Creates the arena floor if it doesn't already exist.
-- Runs first — no dependencies, no waits.
-- Floor top surface = Y=59, spawn scripts target Y=64 (5 studs above).

local FLOOR_NAME   = "ArenaFloor"
local FLOOR_CX     = 1012
local FLOOR_Y      = 58   -- center Y; top surface = 59
local FLOOR_CZ     = 1007
local FLOOR_SIZE_X = 140
local FLOOR_SIZE_Z = 140
local FLOOR_THICK  = 2

-- Idempotent: skip if already present (e.g. placed in Studio edit mode)
if workspace:FindFirstChild(FLOOR_NAME) then
	print("[ARENA-FLOOR] Already present — skipping")
	return
end

-- Base pillar: fills void from Y=0 to Y=57 under the floor
local base = Instance.new("Part")
base.Name           = "ArenaBase"
base.Size           = Vector3.new(FLOOR_SIZE_X, FLOOR_Y - 1, FLOOR_SIZE_Z)
base.CFrame         = CFrame.new(FLOOR_CX, (FLOOR_Y - 1) / 2, FLOOR_CZ)
base.Anchored       = true
base.CanCollide     = true
base.Locked         = true
base.Material       = Enum.Material.Slate
base.Color          = Color3.fromRGB(60, 55, 50)
base.TopSurface     = Enum.SurfaceType.Smooth
base.BottomSurface  = Enum.SurfaceType.Smooth
base.Parent         = workspace

-- Floor surface
local floor = Instance.new("Part")
floor.Name         = FLOOR_NAME
floor.Size         = Vector3.new(FLOOR_SIZE_X, FLOOR_THICK, FLOOR_SIZE_Z)
floor.CFrame       = CFrame.new(FLOOR_CX, FLOOR_Y, FLOOR_CZ)
floor.Anchored     = true
floor.CanCollide   = true
floor.Locked       = true
floor.Material     = Enum.Material.SmoothPlastic
floor.BrickColor   = BrickColor.new("Dark grey metallic")
floor.TopSurface   = Enum.SurfaceType.Smooth
floor.BottomSurface = Enum.SurfaceType.Smooth
floor.Parent       = workspace

print(string.format("[ARENA-FLOOR] Created — top surface Y=%d, size %dx%d, base pillar to Y=0",
	FLOOR_Y + FLOOR_THICK/2, FLOOR_SIZE_X, FLOOR_SIZE_Z))
