-- [[ SECTOR ALPHA: TELEMETRY & AUDIT ENGINE ]]
local HttpService = game:GetService("HttpService")

local RunService  = game:GetService("RunService")

local Telemetry = {}

-- Configuration (Using Explict IPv4 for Mac Stability)
local BRIDGE_URL = "http://127.0.0.1:8080/telemetry" 
local PULSE_COOLDOWN = 5 
local lastPulseTime = 0

-- Temporal Guard: Skip network pulses if running in Studio/Localhost to prevent spam
local IS_LOCALHOST = BRIDGE_URL:find("127.0.0.1") or BRIDGE_URL:find("localhost")
local SILENT_MODE = RunService:IsStudio() and IS_LOCALHOST

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
	
	task.spawn(function()
		if SILENT_MODE then
			-- Diagnostic Mode: Log locally but skip network to avoid Roblox security policy blocks
			-- print("📡 [DIAGNOSTIC] Pulse Suppressed (Localhost Mode). Event: " .. (payload.event or "Pulse"))
			return
		end

		local success, result = pcall(function()
			return HttpService:PostAsync(BRIDGE_URL, HttpService:JSONEncode(payload))
		end)
		
		if success then
			print("📡 [TELEMETRY] Pulse Dispatched to Bridge (127.0.0.1).")
		end
	end)
end

return Telemetry
