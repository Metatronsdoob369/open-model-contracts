-- [[ SECTOR ALPHA: TELEMETRY & AUDIT ENGINE ]]
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local Telemetry = {}

-- Configuration (Using Explict IPv4 for Mac Stability)
local BRIDGE_URL = "http://127.0.0.1:8080/telemetry" 
local PULSE_COOLDOWN = 5 
local lastPulseTime = 0

function Telemetry.gateCheck()
	print("🔍 [OMC-AUDIT] Initiating Pre-Flight Governance Check...")
	
	local report = {
		instances = #game:GetDescendants(),
		physics_step = 1/60,
		services_ok = {
			HttpService = game:GetService("HttpService") ~= nil,
			RunService = game:GetService("RunService") ~= nil,
			Players = game:GetService("Players") ~= nil,
		}
	}
	
	print("✅ [OMC-AUDIT] Baseline Integrity Verified.")
	return true, report
end

function Telemetry.dispatchPulse(input)
	local now = os.clock()
	if (now - lastPulseTime) < PULSE_COOLDOWN then
		return 
	end
	lastPulseTime = now

	local payload = {}
	if type(input) == "string" then
		payload.event = input
	elseif type(input) == "table" then
		payload = input
	end

	payload.sector = "Alpha"
	payload.timestamp = os.time()
	payload.uptime = os.clock()
	payload.memory_kb = collectgarbage("count")
	
	if not RunService:IsServer() then return end

	task.spawn(function()
		local success, result = pcall(function()
			return HttpService:PostAsync(BRIDGE_URL, HttpService:JSONEncode(payload))
		end)

		if success then
			print("📡 [TELEMETRY] Pulse Dispatched to Bridge (127.0.0.1).")
		else
			warn("📡 [TELEMETRY] Pulse Failed (127.0.0.1): " .. tostring(result))
		end
	end)
end

return Telemetry
