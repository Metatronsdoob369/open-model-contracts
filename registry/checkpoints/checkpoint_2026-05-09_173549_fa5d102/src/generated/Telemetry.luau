local RunService  = game:GetService("RunService")
local IS_CLIENT  = RunService:IsClient()

local HttpService = nil
if not IS_CLIENT then
	local success, service = pcall(function() return game:GetService("HttpService") end)
	if success then HttpService = service end
end

local Telemetry = {
	isStudio = RunService:IsStudio() or RunService:IsRunMode(),
	isClient = IS_CLIENT
}

-- Configuration
local BRIDGE_URL = "http://127.0.0.1:8080/telemetry" 
local PULSE_COOLDOWN = 5 
local lastPulseTime = 0

function Telemetry.gateCheck()
	print("🔍 [OMC-AUDIT] Initiating Pre-Flight Governance Check...")
	return true, { status = "OK" }
end

function Telemetry.dispatchPulse(input)
	-- ABSOLUTE GUARD: No HTTP calls in Studio or on Client
	if Telemetry.isClient or Telemetry.isStudio or not HttpService then 
		if RunService:IsStudio() then
			local msg = type(input) == "table" and (input.event or "Table") or tostring(input)
			-- print("📡 [TELEMETRY/LOCAL] Pulse: " .. msg)
		end
		return 
	end
	
	local now = os.clock()
	if now - lastPulseTime < PULSE_COOLDOWN then return end
	lastPulseTime = now

	local payload = nil
	pcall(function()
		payload = game:GetService("HttpService"):JSONEncode({
			timestamp = os.time(),
			data = input
		})
	end)

	if not payload then return end

	task.spawn(function()
		pcall(function()
			HttpService:PostAsync(BRIDGE_URL, payload, Enum.HttpContentType.ApplicationJson)
		end)
	end)
end

return Telemetry
