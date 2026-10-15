-- ReplicatedStorage.Utils.EscrowHelper
-- Helper for calling Phase 2 Escrow validation from Roblox

local HttpService = game:GetService("HttpService")

-- The actual bridge-server typically runs on 8080 according to AMEM_HONEST_ARCHITECTURE
-- We can set it to 8080 here to ensure it aligns with our real Node infrastructure.
local ESCROW_URL = "http://localhost:8080/v1/escrow"

local EscrowHelper = {}

-- Sends repaired code to Escrow for validation and gets a session_id back
function EscrowHelper:ValidateAndGetSession(repairedCode: string, manifestHash: string, bridgeId: string, contractName: string)
	local payload = {
		repairedCode = repairedCode,
		manifestHash = manifestHash,
		bridgeId = bridgeId,
		contractName = contractName,
		samplePayload = { type = "test" }   -- optional, for contract testing
	}

	local success, response = pcall(function()
		return HttpService:PostAsync(ESCROW_URL, HttpService:JSONEncode(payload), Enum.HttpContentType.ApplicationJson)
	end)

	if not success then
		warn("[EscrowHelper] Failed to contact Escrow server:", response)
		return { success = false, error = "Escrow connection failed" }
	end

	local result = HttpService:JSONDecode(response)

	if result.success then
		return {
			success = true,
			sessionId = result.sessionId
		}
	else
		warn("[EscrowHelper] Escrow validation failed:", result.errors)
		return {
			success = false,
			errors = result.errors
		}
	end
end

return EscrowHelper
