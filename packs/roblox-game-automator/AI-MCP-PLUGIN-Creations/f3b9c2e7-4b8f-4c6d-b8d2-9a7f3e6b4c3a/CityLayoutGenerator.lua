local CityLayoutGenerator = {}

function CityLayoutGenerator.Initialize()
    local workspace = game:GetService("Workspace")
    local cityModel = Instance.new("Model")
    cityModel.Name = "GothicCyberMetropolis"
    cityModel.Parent = workspace

    local gridSize = 10
    local cityWidth = 5
    local cityLength = 5

    for x = 0, cityWidth - 1 do
        for z = 0, cityLength - 1 do
            local buildingPosition = Vector3.new(x * gridSize, 0, z * gridSize)
            CityLayoutGenerator.CreateBuilding(cityModel, buildingPosition)
        end
    end
end

function CityLayoutGenerator.CreateBuilding(parent, position)
    local BuildingConstructor = require(script.BuildingConstructor)
    BuildingConstructor.ConstructBuilding(parent, position)
end

return CityLayoutGenerator