local DashAbility = {}

DashAbility.DashCooldown = 3 -- seconds
DashAbility.DashDuration = 0.5 -- seconds
DashAbility.DashSpeedMultiplier = 3
DashAbility.LastDashTime = 0

function DashAbility:CanDash()
    return os.time() - self.LastDashTime >= self.DashCooldown
end

function DashAbility:PerformDash(player)
    if self:CanDash() then
        self.LastDashTime = os.time()
        local character = player.Character
        if character then
            local humanoid = character:FindFirstChildOfClass('Humanoid')
            if humanoid then
                local originalWalkSpeed = humanoid.WalkSpeed
                humanoid.WalkSpeed = originalWalkSpeed * self.DashSpeedMultiplier
                delay(self.DashDuration, function()
                    humanoid.WalkSpeed = originalWalkSpeed
                end)
                print(player.Name .. ' performed a dash!')
            end
        end
    else
        print('Dash is on cooldown.')
    end
end

return DashAbility