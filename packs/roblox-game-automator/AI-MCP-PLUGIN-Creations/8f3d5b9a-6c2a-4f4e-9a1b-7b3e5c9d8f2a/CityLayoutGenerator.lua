local CityLayoutGenerator = {}

local BuildingConstructor = require(script.Parent.BuildingConstructor)

function CityLayoutGenerator:Initialize()
    local workspace = game:GetService("Workspace")
    
    -- Define city grid parameters
    local gridSize = 10
    local blockSpacing = 50
    
    -- Generate city blocks
    for x = 1, gridSize do
        for z = 1, gridSize do
            local position = Vector3.new(x * blockSpacing, 0, z * blockSpacing)
            BuildingConstructor:CreateBuilding(position)
        end
    end
end

return CityLayoutGenerator