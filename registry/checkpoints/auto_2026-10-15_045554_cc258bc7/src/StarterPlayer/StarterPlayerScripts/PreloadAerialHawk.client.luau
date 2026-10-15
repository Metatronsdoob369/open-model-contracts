-- Preloads the Aerial Hawk mesh assets on the client so the mesh is
-- visible immediately when the hawk spawns in Workspace.
-- Server-side PreloadAsync does nothing for client rendering.

local ContentProvider = game:GetService("ContentProvider")

local MESH_ID    = "http://www.roblox.com/asset/?id=120647529"
local TEXTURE_ID = "http://www.roblox.com/asset/?id=120647378"

ContentProvider:PreloadAsync({ MESH_ID, TEXTURE_ID })
print("[HAWK-CLIENT] Mesh assets preloaded")

-- Also watch for hawk spawning and force-render it
local Workspace = game:GetService("Workspace")

local function onHawkAdded(instance)
	if instance.Name == "AerialHawk" and instance:IsA("Model") then
		local root = instance:FindFirstChild("HumanoidRootPart")
		if root then
			-- Touch the mesh to force client render
			local mesh = root:FindFirstChildOfClass("SpecialMesh")
			if mesh then
				ContentProvider:PreloadAsync({ mesh.MeshId, mesh.TextureId })
			end
		end
	end
end

Workspace.ChildAdded:Connect(onHawkAdded)

-- Catch it if already there
for _, child in ipairs(Workspace:GetChildren()) do
	onHawkAdded(child)
end
