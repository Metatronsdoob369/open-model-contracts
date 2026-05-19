--[=[
    SovereignClientRouter.luau
    Status: PROTOCOL | Governed-Bridge
    OMC Room: OMC_Governance -> Client_Visual
    Law Compliance: Contract Mirroring §1, Bridge Throttling §4
    
    Hardened 4D-compliant bridge for executing queries on the client.
    Handles player lifecycles, execution contracts, and governance reporting.
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

-- Infrastructure Anchors
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))
local Governance = require(script.Parent:WaitForChild("MetropolisGovernance"))

local PREFIX = "🏮 [SOVEREIGN-BRIDGE]"
local MIN_LEAVE_TIME_MS = 500 -- 4D QuadMap Guard: Enforce minimum hold on disconnect

local SovereignClientRouter = {}
SovereignClientRouter.__index = SovereignClientRouter

function SovereignClientRouter.new(remoteFunction)
	local self = setmetatable({}, SovereignClientRouter)
	
	-- Establish consistent relay identity
	self._remoteFunction = remoteFunction or ReplicatedStorage:FindFirstChild("SovereignRelay")
	if not self._remoteFunction then
		self._remoteFunction = Instance.new("RemoteFunction")
		self._remoteFunction.Name = "SovereignRelay"
		self._remoteFunction.Parent = ReplicatedStorage
	end
	
	self._pendingRequests = {} -- [requestId] = { thread, player }
	self._lastExecutionTime = {} -- [player] = os.clock() temporal anchor
	self._executiveClient = nil
	
	-- Lifecycle Monitoring: Sweep fractures when players disconnect
	Players.PlayerRemoving:Connect(function(player)
		-- 4D Temporal Guard: If player has pending requests, enforce a minimum leave window 
		-- to allow near-simultaneous bridge resolution to land.
		task.spawn(function()
			local hasPending = false
			for _, info in pairs(self._pendingRequests) do
				if info.player == player then
					hasPending = true
					break
				end
			end

			if hasPending then
				task.wait(MIN_LEAVE_TIME_MS / 1000)
			end

			if self._executiveClient == player then
				self._executiveClient = nil
				Governance.RegisterIssue("BRIDGE_FRACTURE", "Executive Client disconnected: " .. player.Name, "MEDIUM")
			end
			
			self:_sweepPlayer(player)
		end)
	end)

	print(PREFIX, "Governed Bridge Established. Room: OMC_Governance -> Client_Visual")
	return self
end

-- Set the authoritative client for governor queries
function SovereignClientRouter:setExecutiveClient(player)
	self._executiveClient = player
	print(PREFIX, "Executive Client anchored to: " .. player.Name)
end

-- internal: sweep requests for a specific player
function SovereignClientRouter:_sweepPlayer(player)
	for requestId, info in pairs(self._pendingRequests) do
		if info.player == player then
			warn(PREFIX, "Force-terminating request " .. requestId .. " (Player Disconnected)")
			self._pendingRequests[requestId] = nil
		end
	end
	self._lastExecutionTime[player] = nil
end

-- Execute a client-side expression via Governed Bridge.
-- Enforces Contract Mirroring §1
function SovereignClientRouter:execute(code, targetPlayer, timeout)
	-- 1. Selection & Validation
	local player = targetPlayer or self._executiveClient or Players:GetPlayers()[1]
	
	if not player then
		Governance.RegisterIssue("BRIDGE_FAILURE", "No connected clients found for bridging", "HIGH")
		return { success = false, error = "NO_CLIENT_CONNECTED" }
	end

	-- 2. Contract Check (Sanity)
	if type(code) ~= "string" or #code == 0 then
		return { success = false, error = "CONTRACT_VIOLATION: Empty or invalid code" }
	end

	-- 2.5 4D Temporal Throttling Guard
	local now = os.clock()
	local lastExec = self._lastExecutionTime[player] or 0
	local THROTTLE_RATE = 0.45 -- 450ms minimum temporal spacing
	
	if (now - lastExec) < THROTTLE_RATE then
		Governance.RegisterIssue("TEMPORAL_FRACTURE", "Bridge rate exceeded for " .. player.Name .. ". AI Hallucination detected (Span < " .. THROTTLE_RATE .. "s)", "HIGH")
		return { success = false, error = "THROTTLE_VIOLATION: Temporal overlap detected. Code rejected." }
	end
	
	self._lastExecutionTime[player] = now

	local requestId = HttpService:GenerateGUID(false)
	timeout = timeout or 10

	-- 3. Pre-flight Telemetry
	Telemetry.dispatchPulse({
		event = "Bridge_Query_Start",
		requestId = requestId,
		sourceRoom = "OMC_Governance",
		targetRoom = "Client_Visual",
		targetPlayer = player.Name
	})

	local finished = false
	local clientResult = nil
	local signal = Instance.new("BindableEvent")
	local currentThread = task.spawn(function()
		local ok, result = pcall(function()
			return self._remoteFunction:InvokeClient(player, {
				requestId = requestId,
				code = code,
			})
		end)

		if finished then return end

		if ok then
			clientResult = result
		else
			clientResult = { success = false, error = "INVOKE_FAILURE: " .. tostring(result) }
		end

		finished = true
		signal:Fire()
	end)

	-- Register for lifecycle tracking
	self._pendingRequests[requestId] = { thread = currentThread, player = player }

	-- 4. Governed Timeout
	task.delay(timeout, function()
		if not finished then
			finished = true
			Governance.RegisterIssue("BRIDGE_TIMEOUT", "Client query timed out for " .. requestId, "MEDIUM")
			clientResult = { success = false, error = "TIMEOUT_EXCEEDED" }
			signal:Fire()
		end
	end)

	-- Wait for resolution
	signal.Event:Wait()
	signal:Destroy()
	
	-- Cleanup
	self._pendingRequests[requestId] = nil

	-- 5. Normalize & Log Result
	local finalResponse = self:_normalizeResult(clientResult)
	
	Telemetry.dispatchPulse({
		event = "Bridge_Query_End",
		requestId = requestId,
		success = finalResponse.success,
		latency = finalResponse.data.executionTime
	})

	if not finalResponse.success then
		Governance.RegisterIssue("CLIENT_ERROR", finalResponse.error, "LOW")
	end

	return finalResponse
end

function SovereignClientRouter:_normalizeResult(res)
	if type(res) ~= "table" then
		return { success = false, error = "MALFORMED_RESPONSE", data = { output = tostring(res), executionTime = 0 } }
	end
	
	return {
		success = res.success == true,
		data = {
			output = res.output or res.data or "",
			executionTime = res.data and res.data.executionTime or res.executionTime or 0,
		},
		error = res.error
	}
end

return SovereignClientRouter
