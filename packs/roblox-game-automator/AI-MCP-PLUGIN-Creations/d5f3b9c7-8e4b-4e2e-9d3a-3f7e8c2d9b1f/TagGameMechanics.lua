local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local DashCooldown = 2 -- seconds
local DashDuration = 0.2 -- seconds
local DashSpeed = 100
local TagDistance = 5

local function onPlayerAdded(player)
    local character = player.Character or player.CharacterAdded:Wait()
    local humanoid = character:WaitForChild("Humanoid")
    local rootPart = character:WaitForChild("HumanoidRootPart")

    local canDash = true
    local isDashing = false

    local function dash()
        if not canDash or isDashing then return end
        canDash = false
        isDashing = true

        local dashDirection = rootPart.CFrame.LookVector
        local dashVelocity = dashDirection * DashSpeed

        local originalWalkSpeed = humanoid.WalkSpeed
        humanoid.WalkSpeed = DashSpeed

        local dashEndTime = tick() + DashDuration
        while tick() < dashEndTime do
            rootPart.Velocity = dashVelocity
            RunService.Heartbeat:Wait()
        end

        humanoid.WalkSpeed = originalWalkSpeed
        isDashing = false

        task.wait(DashCooldown)
        canDash = true
    end

    local function onCharacterAdded(newCharacter)
        character = newCharacter
        humanoid = character:WaitForChild("Humanoid")
        rootPart = character:WaitForChild("HumanoidRootPart")
    end

    player.CharacterAdded:Connect(onCharacterAdded)

    -- Input handled client-side via RemoteEvent (server cannot use KeyDown)
end

local function checkTag()
    for _, player in ipairs(Players:GetPlayers()) do
        local character = player.Character
        if character then
            local rootPart = character:FindFirstChild("HumanoidRootPart")
            if rootPart then
                for _, otherPlayer in ipairs(Players:GetPlayers()) do
                    if otherPlayer ~= player then
                        local otherCharacter = otherPlayer.Character
                        if otherCharacter then
                            local otherRootPart = otherCharacter:FindFirstChild("HumanoidRootPart")
                            if otherRootPart then
                                local distance = (rootPart.Position - otherRootPart.Position).Magnitude
                                if distance <= TagDistance then
                                    -- Tag logic here
                                    print(player.Name .. " tagged " .. otherPlayer.Name)
                                end
                            end
                        end
                    end
                end
            end
        end
    end
end

local function Initialize()
    Players.PlayerAdded:Connect(onPlayerAdded)
    RunService.Heartbeat:Connect(checkTag)
end

return { Initialize = Initialize }