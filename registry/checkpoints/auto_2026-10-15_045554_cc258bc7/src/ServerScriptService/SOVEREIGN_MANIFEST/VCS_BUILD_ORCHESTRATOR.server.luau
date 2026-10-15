--[=[
    VCS_BUILD_ORCHESTRATOR.server.lua
    Purpose:
    Execute a Visual Contract Spec in safe staged order.

    Flow:
    1. Fetch manifest
    2. Validate shape
    3. Reset managed scene
    4. Apply lighting
    5. Build world geometry
    6. Build environment assets
    7. Build interactables
    8. Build server logic containers
    9. Build UI
    10. Audit
    11. Enable gameplay
]=]

local HttpService = game:GetService("HttpService")

local BRIDGE_URL = "http://127.0.0.1:8080/rehydrate/latest"

--========================================================
-- CONFIG
--========================================================

local MANAGED_ROOT_NAME = "OMC_ManifestedWorld"

local STAGE_ORDER = {
	"reset",
	"lighting",
	"world_geometry",
	"environment_assets",
	"interactables",
	"server_logic",
	"replicated_assets",
	"ui",
	"player_spawn",
	"audit",
	"enable_gameplay"
}

local CLASS_MAP = {
	ArenaRoot = "Folder",
	CircularPlatform = "Part",
	NeonRingBorder = "Part",
	SpawnPad = "Model",

	SurvivalTree = "Model",
	Trunk = "Part",
	Leaves = "Part",
	HarvestPrompt = "ProximityPrompt",

	MainSurvivalHUD = "ScreenGui",
	HungerBar = "Frame",

	SurvivalOrchestrator = "Script",
	SystemNode = "Folder"
}

local CASE_MAP = {
	name = "Name",
	position = "Position",
	size = "Size",
	color = "Color",
	anchored = "Anchored",
	material = "Material",
	transparency = "Transparency",
	cancollide = "CanCollide",
	backgroundcolor3 = "BackgroundColor3",
	visible = "Visible",
	text = "Text",
	textcolor3 = "TextColor3",
	textscaled = "TextScaled",
}

local STAGE_SERVICE_ALLOWLIST = {
	lighting = {
		Lighting = true,
	},

	world_geometry = {
		Workspace = true,
	},

	environment_assets = {
		Workspace = true,
	},

	interactables = {
		Workspace = true,
	},

	server_logic = {
		ServerScriptService = true,
	},

	replicated_assets = {
		ReplicatedStorage = true,
	},

	ui = {
		StarterGui = true,
	},

	player_spawn = {
		Workspace = true,
	}
}

--========================================================
-- PARSERS
--========================================================

local function parseColor3(value)
	if typeof(value) == "Color3" then
		return value
	end

	if typeof(value) ~= "string" then
		return nil
	end

	if value:sub(1, 1) ~= "#" or #value ~= 7 then
		return nil
	end

	local r = tonumber(value:sub(2, 3), 16)
	local g = tonumber(value:sub(4, 5), 16)
	local b = tonumber(value:sub(6, 7), 16)

	if not r or not g or not b then
		return nil
	end

	return Color3.fromRGB(r, g, b)
end

local function parseNumbers(value)
	local numbers = {}

	if typeof(value) == "table" then
		for _, item in ipairs(value) do
			table.insert(numbers, tonumber(item))
		end
	else
		for item in tostring(value):gmatch("%-?%d+%.?%d*") do
			table.insert(numbers, tonumber(item))
		end
	end

	return numbers
end

local function parseVector3(value)
	if typeof(value) == "Vector3" then
		return value
	end

	local n = parseNumbers(value)

	if #n >= 3 then
		return Vector3.new(n[1], n[2], n[3])
	end

	return nil
end

local function parseUDim2(value)
	if typeof(value) == "UDim2" then
		return value
	end

	local n = parseNumbers(value)

	if #n >= 4 then
		return UDim2.new(n[1], n[2], n[3], n[4])
	end

	return nil
end

local function normalizeProperties(rawProperties)
	local normalized = {}

	for rawName, value in pairs(rawProperties or {}) do
		local normalizedName = CASE_MAP[string.lower(tostring(rawName))] or rawName
		normalized[normalizedName] = value
	end

	return normalized
end

--========================================================
-- PROPERTY APPLICATION
--========================================================

local function applyProperties(instance, rawProperties, audit)
	local properties = normalizeProperties(rawProperties)

	for name, value in pairs(properties) do
		local ok, err = pcall(function()
			if name == "Source" then
				-- Roblox blocks runtime Source writes from normal scripts.
				table.insert(audit.warnings, "Skipped Source assignment for " .. instance:GetFullName())
				return
			end

			if name == "Position" and instance:IsA("Model") then
				return
			end

			if name == "Color" or name == "BackgroundColor3" or name == "TextColor3" then
				local color = parseColor3(value)
				if color then
					instance[name] = color
				else
					error("Invalid Color3 value: " .. tostring(value))
				end

			elseif name == "Position" or name == "Size" then
				if instance:IsA("GuiObject") then
					local udim = parseUDim2(value)
					if udim then
						instance[name] = udim
					else
						error("Invalid UDim2 value: " .. tostring(value))
					end
				else
					local vector = parseVector3(value)
					if vector then
						instance[name] = vector
					else
						error("Invalid Vector3 value: " .. tostring(value))
					end
				end

			elseif name == "Material" then
				local material = Enum.Material[tostring(value)]
				if material then
					instance.Material = material
				else
					error("Invalid Material: " .. tostring(value))
				end

			else
				local propOk, propErr = pcall(function()
					instance[name] = value
				end)

				if not propOk then
					-- FALLBACK: Attempt to set as Attribute (Diamond-Stable Pattern)
					local attrOk, attrErr = pcall(function()
						instance:SetAttribute(name, value)
					end)

					if attrOk then
						print(string.format("    ✨ [ATTR] %s -> %s (Property fallback)", name, tostring(value)))
					else
						-- Both failed, report as actual failure
						error(propErr)
					end
				end
			end
		end)

		if not ok then
			table.insert(audit.propertyFailures, {
				instance = instance:GetFullName(),
				property = name,
				value = tostring(value),
				error = tostring(err)
			})

			warn("⚠️ [PROP FAIL]", instance:GetFullName(), name, value, err)
		end
	end
end

--========================================================
-- INSTANCE CREATION
--========================================================

local function getRobloxClass(node)
	return CLASS_MAP[node.type] or node.robloxClass or node.type
end

local function rehydrateNode(node, parent, audit)
	local className = getRobloxClass(node)

	print("🔨 [BUILD]", node.name, "| semantic:", node.type, "| class:", className)

	local ok, instanceOrError = pcall(function()
		local instance = Instance.new(className)
		instance.Name = node.name or "UnnamedNode"

		applyProperties(instance, node.properties or {}, audit)

		instance.Parent = parent

		local props = normalizeProperties(node.properties or {})
		if instance:IsA("Model") and props.Position then
			local pos = parseVector3(props.Position)
			if pos then
				instance:PivotTo(CFrame.new(pos))
			end
		end

		return instance
	end)

	if not ok then
		local err = tostring(instanceOrError)

		table.insert(audit.creationFailures, {
			node = node.name or "UnknownNode",
			type = node.type or "UnknownType",
			className = className,
			error = err
		})

		warn("🛑 [CREATE FAIL]", node.name, node.type, className, err)
		return nil
	end

	local instance = instanceOrError
	table.insert(audit.createdInstances, instance:GetFullName())

	for _, child in ipairs(node.children or {}) do
		rehydrateNode(child, instance, audit)
	end

	return instance
end

--========================================================
-- MANIFEST HELPERS
--========================================================

local function fetchManifest()
	local ok, response = pcall(function()
		return HttpService:GetAsync(BRIDGE_URL)
	end)

	if not ok then
		-- FALLBACK: Try to find a local 'vcs.json' or specific file (Agent Skill Pattern)
		warn("📡 [BRIDGE] Fetch failed. Attempting local manifestation...")
		-- Note: In a real 'Agent Skill', we might use a ModuleScript that was synced via Rojo
		-- For now, we return a failure message, but this is where the local swap happens.
		return nil, "Bridge fetch failed: " .. tostring(response)
	end

	local decodeOk, manifest = pcall(function()
		return HttpService:JSONDecode(response)
	end)

	if not decodeOk then
		return nil, "JSON decode failed: " .. tostring(manifest)
	end

	return manifest, nil
end

local function validateManifest(vcs)
	if typeof(vcs) ~= "table" then
		return false, "Manifest is not a table"
	end

	if not vcs.metadata then
		return false, "Missing metadata"
	end

	if not vcs.structuralSpec then
		return false, "Missing structuralSpec"
	end

	if not vcs.structuralSpec.root then
		return false, "Missing structuralSpec.root"
	end

	if not vcs.structuralSpec.root.children then
		return false, "Missing structuralSpec.root.children"
	end

	return true, nil
end

local function getManagedRoot()
	local existing = workspace:FindFirstChild(MANAGED_ROOT_NAME)

	if existing then
		existing:Destroy()
	end

	local folder = Instance.new("Folder")
	folder.Name = MANAGED_ROOT_NAME
	folder.Parent = workspace

	return folder
end

local function getServiceNodeMap(vcs)
	local map = {}

	for _, serviceNode in ipairs(vcs.structuralSpec.root.children or {}) do
		map[serviceNode.name] = serviceNode
	end

	return map
end

local function safeGetService(serviceName)
	local ok, service = pcall(function()
		return game:GetService(serviceName)
	end)

	if ok then
		return service
	end

	return nil
end

--========================================================
-- STAGE FILTERING
--========================================================

local function nodeStage(node)
	local props = node.properties or {}

	if node.stage then
		return node.stage
	end

	if props.stage then
		return props.stage
	end

	-- Fallback inference for older manifests.
	if node.type == "LightingConfig" or node.type == "Sky" or node.type == "Atmosphere" then
		return "lighting"
	end

	if node.type == "CircularPlatform" or node.type == "ArenaRoot" or node.type == "NeonRingBorder" then
		return "world_geometry"
	end

	if node.type == "SurvivalTree" or node.type == "Trunk" or node.type == "Leaves" then
		return "environment_assets"
	end

	if node.type == "HarvestPrompt" or node.type == "SpawnPad" then
		return "interactables"
	end

	if node.type == "Script" or node.type == "SurvivalOrchestrator" then
		return "server_logic"
	end

	if node.type == "ScreenGui" or node.type == "MainSurvivalHUD" or node.type == "Frame" or node.type == "HungerBar" then
		return "ui"
	end

	return "environment_assets"
end

local function collectNodesForStage(serviceNode, stage)
	local collected = {}

	local function walk(node)
		local currentStage = nodeStage(node)

		if currentStage == stage then
			table.insert(collected, node)
			return
		end

		for _, child in ipairs(node.children or {}) do
			walk(child)
		end
	end

	for _, child in ipairs(serviceNode.children or {}) do
		walk(child)
	end

	return collected
end

--========================================================
-- STAGE EXECUTION
--========================================================

local function executeResetStage(context)
	print("🧹 [STAGE reset] Clearing managed world")
	context.worldRoot = getManagedRoot()
	return true
end

local function executeServiceStage(context, stage)
	print("📦 [STAGE " .. stage .. "] Starting")

	local allowlist = STAGE_SERVICE_ALLOWLIST[stage]
	if not allowlist then
		print("ℹ️ [STAGE " .. stage .. "] No service allowlist. Skipping.")
		return true
	end

	local builtCount = 0

	for serviceName, allowed in pairs(allowlist) do
		if allowed then
			local serviceNode = context.serviceNodeMap[serviceName]
			local service = safeGetService(serviceName)

			if serviceNode and service then
				local parent = service

				if serviceName == "Workspace" then
					parent = context.worldRoot
				end

				local nodes = collectNodesForStage(serviceNode, stage)

				for _, node in ipairs(nodes) do
					local instance = rehydrateNode(node, parent, context.audit)
					if instance then
						builtCount += 1
					end
				end
			end
		end
	end

	print("✅ [STAGE " .. stage .. "] Built root nodes:", builtCount)

	return true
end

local function executeAuditStage(context)
	print("🔍 [STAGE audit] Auditing constructed world")

	local instanceCount = 0

	if context.worldRoot then
		for _, descendant in ipairs(context.worldRoot:GetDescendants()) do
			instanceCount += 1
		end
	end

	context.audit.summary = {
		manifestName = context.vcs.metadata.name,
		manifestHash = context.vcs.metadata.hash,
		createdCount = #context.audit.createdInstances,
		workspaceDescendantCount = instanceCount,
		creationFailureCount = #context.audit.creationFailures,
		propertyFailureCount = #context.audit.propertyFailures,
		warningCount = #context.audit.warnings
	}

	print("📊 [AUDIT] Created:", context.audit.summary.createdCount)
	print("📊 [AUDIT] Workspace descendants:", context.audit.summary.workspaceDescendantCount)
	print("📊 [AUDIT] Create failures:", context.audit.summary.creationFailureCount)
	print("📊 [AUDIT] Property failures:", context.audit.summary.propertyFailureCount)
	print("📊 [AUDIT] Warnings:", context.audit.summary.warningCount)

	if context.audit.summary.creationFailureCount > 0 then
		warn("🛑 [AUDIT] Creation failures detected")
	end

	if context.audit.summary.propertyFailureCount > 0 then
		warn("⚠️ [AUDIT] Property failures detected")
	end

	return context.audit.summary.creationFailureCount == 0
end

local function executeEnableGameplayStage(context)
	print("🎮 [STAGE enable_gameplay] Igniting Sovereign World Logic...")

	-- Set Global Manifestation Flag
	workspace:SetAttribute("OMC_WorldManifested", true)
	workspace:SetAttribute("OMC_ManifestHash", context.vcs.metadata.hash)

	-- Fire Signal for Game Systems (if present)
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local buildSignal = ReplicatedStorage:FindFirstChild("OMC_BuildComplete")
	if buildSignal and buildSignal:IsA("BindableEvent") then
		buildSignal:Fire(context.audit.summary)
	end

	print("🔥 [IGNITION] Gameplay systems enabled. World is live.")
	return true
end

local STAGE_EXECUTORS = {
	reset = executeResetStage,
	lighting = function(context) return executeServiceStage(context, "lighting") end,
	world_geometry = function(context) return executeServiceStage(context, "world_geometry") end,
	environment_assets = function(context) return executeServiceStage(context, "environment_assets") end,
	interactables = function(context) return executeServiceStage(context, "interactables") end,
	server_logic = function(context) return executeServiceStage(context, "server_logic") end,
	replicated_assets = function(context) return executeServiceStage(context, "replicated_assets") end,
	ui = function(context) return executeServiceStage(context, "ui") end,
	player_spawn = function(context) return executeServiceStage(context, "player_spawn") end,
	audit = executeAuditStage,
	enable_gameplay = executeEnableGameplayStage
}

--========================================================
-- MAIN
--========================================================

local function runBuildPlan()
	print("🏮 [ORCHESTRATOR] Fetching VCS manifest")

	local vcs, fetchError = fetchManifest()

	if not vcs then
		warn("🛑 [ORCHESTRATOR] " .. fetchError)
		return
	end

	local valid, validationError = validateManifest(vcs)

	if not valid then
		warn("🛑 [ORCHESTRATOR] Invalid manifest: " .. validationError)
		return
	end

	print("💎 [ORCHESTRATOR] Manifest:", vcs.metadata.name or "Unnamed")
	print("🔐 [ORCHESTRATOR] Hash:", vcs.metadata.hash or "No Hash")

	local context = {
		vcs = vcs,
		serviceNodeMap = getServiceNodeMap(vcs),
		worldRoot = nil,
		audit = {
			createdInstances = {},
			creationFailures = {},
			propertyFailures = {},
			warnings = {},
			summary = {}
		}
	}

	for _, stageName in ipairs(STAGE_ORDER) do
		local executor = STAGE_EXECUTORS[stageName]

		if executor then
			print("────────────────────────────────")
			print("🏗️ [ORCHESTRATOR] Running stage:", stageName)

			local ok = executor(context)

			if not ok then
				warn("🛑 [ORCHESTRATOR] Stage failed:", stageName)
				break
			end
		else
			warn("⚠️ [ORCHESTRATOR] No executor for stage:", stageName)
		end
	end

	print("🏁 [ORCHESTRATOR] Build plan complete")
end

task.wait(1)
runBuildPlan()
