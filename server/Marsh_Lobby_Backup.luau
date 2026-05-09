-- [[ MARSH'S ORIGINAL LOBBY LOGIC - RECOVERED ]]
-- This file contains the logic that was truncated during the social hub overhaul.
-- Use this as a reference or to restore specific features Marsh built.

-- ── Build stadium seating (Marsh's Version) ──────────────────
local function buildSeating(folder, state)
	local index = 0
	for _, row in ipairs(SEAT_ROWS) do
		for _, cx in ipairs(SEAT_COLS) do
			index += 1

			local seat = Instance.new("Seat")
			seat.Size     = Vector3.new(2, 0.5, 2)
			seat.CFrame   = CFrame.new(cx, row.y, row.z)
			seat.Color    = SEAT_COLOR
			seat.Material = Enum.Material.Slate
			seat.Anchored = true
			seat.Parent   = folder

			-- Seat back panel
			mk(folder, Vector3.new(2, 2, 0.3),
				CFrame.new(cx, row.y + 1.25, row.z + 1.15),
				SEAT_COLOR, Enum.Material.Slate)

			local pp = Instance.new("ProximityPrompt")
			pp.ActionText            = "Join Game"
			pp.ObjectText            = "Seat " .. index
			pp.MaxActivationDistance = 8
			pp.HoldDuration          = 0
			pp.Parent                = seat

			table.insert(state.seats, {
				seat     = seat,
				prompt   = pp,
				origCF   = seat.CFrame,
				index    = index,
				occupant = nil,
			})
		end
	end
end

-- ── Build start button (Marsh's Version) ──────────────────────
local function buildStartButton(folder, state)
	local btn = mk(folder, Vector3.new(4, 4, 0.5),
		CFrame.new(0, LOBBY_Y + 10, LOBBY_D/2 - 0.4),
		Color3.fromRGB(50, 200, 50), Enum.Material.Neon)

	local pl = Instance.new("PointLight")
	pl.Brightness = 2; pl.Range = 15
	pl.Color  = Color3.fromRGB(50, 200, 50)
	pl.Parent = btn

	local pp = Instance.new("ProximityPrompt")
	pp.ActionText            = "Start Session"
	pp.ObjectText            = "Host Game"
	pp.MaxActivationDistance = 10
	pp.Parent                = btn

	state.startButton       = btn
	state.startButtonPrompt = pp
end

-- [[ MARSH'S LAUNCH TWEEN LOGIC ]]
-- Eject players and apply launch velocity
-- (Recovered from the drop-phase logic)
-- hrp.AssemblyLinearVelocity = Vector3.new(
--     math.cos(entry.angle) * 55,
--     95,
--     math.sin(entry.angle) * 55
-- )
