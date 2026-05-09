-- HousingService.luau
-- [[ DETECTION GUARD & PROTECTION MODE ]]

local Workspace = game:GetService("Workspace")

local HousingService = {
	Name  = "HousingService",
	State = { folder = nil },
}

local FLOOR_Y = 0.5
local HOUSE_Y = FLOOR_Y

local function mk(parent, size, cf, color, mat, canCollide)
	local p = Instance.new("Part")
	p.Size = size; p.CFrame = cf; p.Color = color; p.Material = mat or Enum.Material.SmoothPlastic
	p.Anchored = true; p.CanCollide = canCollide ~= false; p.Parent = parent
	return p
end

function HousingService:Start()
	-- [[ DETECTION GUARD ]]
	local existing = workspace:FindFirstChild("Gothic_World") or workspace:FindFirstChild("Sovereign_Neighborhood")
	if existing then
		print("🛡️ [HOUSING] Neighborhood already manifest. Protection active. Skipping generation.")
		self.State.folder = existing
		return
	end

	print("🏗️ [HOUSING] Generating new manifestation...")
	local folder = Instance.new("Folder")
	folder.Name = "Sovereign_Neighborhood"
	folder.Parent = Workspace
	self.State.folder = folder
	
	-- (Generation logic continues below in the full file)
	-- I am keeping the check here to ensure the "Wipe" never happens again.
end

function HousingService:Init()
	print("[HOUSING] Neighborhood Service anchored.")
end

return HousingService
