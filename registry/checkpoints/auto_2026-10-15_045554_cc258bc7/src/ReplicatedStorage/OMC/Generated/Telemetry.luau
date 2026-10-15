local Telemetry = {}

-- Central kill-switch: keep call sites intact, but disable all outbound telemetry.
local ENABLED = false

function Telemetry.gateCheck()
	return true, {
		telemetry_enabled = ENABLED,
		reason = "disabled",
	}
end

function Telemetry.dispatchPulse(_input)
	if not ENABLED then
		return
	end
end

return Telemetry
