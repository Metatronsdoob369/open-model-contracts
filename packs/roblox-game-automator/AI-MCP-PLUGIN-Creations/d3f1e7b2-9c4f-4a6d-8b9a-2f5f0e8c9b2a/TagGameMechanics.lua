local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local SoundService = game:GetService("SoundService")

local TAG_COOLDOWN = 5
local DASH_COOLDOWN = 3
local DASH_SPEED = 100
local DASH_DURATION = 0.2

local taggedPlayer = nil
local lastTagTime = 0
local lastDashTimes = {}

local function createBuilding(position, size)
    local building = Instance.new("Part")
    building.Size = size
    building.Position = position
    building.Anchored = true
    building.BrickColor = BrickColor.new("Really black")
    building.Parent = Workspace
    return building
end

local function createMetropolis()
    local gridSize = 50
    local buildingHeightVariations = {50, 100, 150, 200}
    for x = -250, 250, gridSize do
        for z = -250, 250, gridSize do
            local height = buildingHeightVariations[math.random(1, #buildingHeightVariations)]
            createBuilding(Vector3.new(x, height / 2, z), Vector3.new(gridSize, height, gridSize))
        end
    end
end

local function playTagSound()
    local sound = Instance.new("Sound")
    sound.SoundId = ""
    sound.Volume = 0.5
    sound.PlaybackSpeed = 1
    sound.Looped = false
    sound.Parent = SoundService
    sound:Play()
end

local function tagPlayer(player)
    if taggedPlayer ~= player and (os.time() - lastTagTime) >= TAG_COOLDOWN then
        taggedPlayer = player
        lastTagTime = os.time()
        playTagSound()
        print(player.Name .. " is now tagged!")
    end
end

local function dash(player)
    local character = player.Character
    if character and (os.time() - (lastDashTimes[player] or 0)) >= DASH_COOLDOWN then
        local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
        if humanoidRootPart then
            local dashDirection = humanoidRootPart.CFrame.LookVector
            humanoidRootPart.Velocity = dashDirection * DASH_SPEED
            lastDashTimes[player] = os.time()
            task.delay(DASH_DURATION, function()
                humanoidRootPart.Velocity = Vector3.new(0, 0, 0)
            end)
        end
    end
end

local function onPlayerAdded(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        humanoid.Touched:Connect(function(hit)
            local otherPlayer = Players:GetPlayerFromCharacter(hit.Parent)
            if otherPlayer then
                tagPlayer(otherPlayer)
            end
        end)
    end)
end

local function Initialize()
    createMetropolis()
    Players.PlayerAdded:Connect(onPlayerAdded)
end

return {
    Initialize = Initialize,
    Dash = dash
}