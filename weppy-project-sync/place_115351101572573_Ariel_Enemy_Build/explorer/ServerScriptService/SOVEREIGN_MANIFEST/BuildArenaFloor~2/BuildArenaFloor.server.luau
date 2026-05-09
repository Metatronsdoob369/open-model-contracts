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

print(string.format("[ARENA-FLOOR] Created — top surface Y=%d, size %dx%d",
	FLOOR_Y + FLOOR_THICK/2, FLOOR_SIZE_X, FLOOR_SIZE_Z))
