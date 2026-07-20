-- Runs once at server start.
-- Finds character models from Workspace and ServerStorage/bitebynitecharacters,
-- clones them into ServerStorage/MonsterTemplates for VictimService.

local ENABLE_TEMPLATE_IMPORT_ON_BOOT = false
if not ENABLE_TEMPLATE_IMPORT_ON_BOOT then
	return
end

local ServerStorage = game:GetService("ServerStorage")
local Workspace = game:GetService("Workspace")

task.wait(1) -- let Workspace finish populating

local function ensureFolder(parent, name)
	local f = parent:FindFirstChild(name)
	if f and f:IsA("Folder") then return f end
	f = Instance.new("Folder")
	f.Name = name
	f.Parent = parent
	return f
end

local function looksLikeCharacter(model)
	if not model:IsA("Model") then return false end
	return model:FindFirstChildOfClass("Humanoid") ~= nil
		or model:FindFirstChild("HumanoidRootPart") ~= nil
		or model:FindFirstChild("Head") ~= nil
end

local candidates = {}

local function addCandidate(model)
	if not looksLikeCharacter(model) then
		return
	end
	for _, existing in ipairs(candidates) do
		if existing == model then
			return
		end
	end
	table.insert(candidates, model)
end

-- 1. Pull models from Workspace.
for _, child in ipairs(Workspace:GetChildren()) do
	if child:IsA("Model") and (child.Name == "Model" or child.Name == "Models") then
		addCandidate(child)
	end

	if child:IsA("Folder") and child.Name:lower() == "models" then
		for _, sub in ipairs(child:GetDescendants()) do
			if sub:IsA("Model") then
				addCandidate(sub)
			end
		end
	end
end
print(string.format("[MONSTERS] Found %d workspace model candidate(s).", #candidates))

-- 2. Fallback: pull numbered sub-models from ServerStorage.bitebynitecharacters
if #candidates == 0 then
	local source = ServerStorage:FindFirstChild("bitebynitecharacters")
	if source then
		for _, child in ipairs(source:GetChildren()) do
			addCandidate(child)
		end
	end
	print(string.format("[MONSTERS] Fallback: found %d model(s) in bitebynitecharacters.", #candidates))
end

if #candidates == 0 then
	warn("[MONSTERS] No character models found. Blocky fallback will be used.")
	return
end

-- 3. Populate MonsterTemplates
local templates = ensureFolder(ServerStorage, "MonsterTemplates")
for _, child in ipairs(templates:GetChildren()) do
	child:Destroy()
end

for i, model in ipairs(candidates) do
	local clone = model:Clone()
	clone.Name = "BiteBynite_" .. i
	-- Ensure Humanoid present
	if not clone:FindFirstChildOfClass("Humanoid") then
		local hum = Instance.new("Humanoid")
		hum.MaxHealth = 260
		hum.Health = 260
		hum.Parent = clone
	end
	-- Ensure PrimaryPart is set to HumanoidRootPart if present
	local hrp = clone:FindFirstChild("HumanoidRootPart")
	if hrp then
		clone.PrimaryPart = hrp
	end
	clone.Parent = templates
	print(string.format("[MONSTERS] Template %d loaded from Workspace.", i))
end

print(string.format("[MONSTERS] %d template(s) ready in MonsterTemplates.", #candidates))
