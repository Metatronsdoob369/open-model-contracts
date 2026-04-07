local TagMechanics = {}

TagMechanics.TaggedPlayer = nil
TagMechanics.TagCooldown = 5 -- seconds
TagMechanics.LastTagTime = 0

function TagMechanics:TagPlayer(player)
    if os.time() - self.LastTagTime >= self.TagCooldown then
        self.TaggedPlayer = player
        self.LastTagTime = os.time()
        print(player.Name .. ' is now tagged!')
    else
        print('Tag is on cooldown.')
    end
end

function TagMechanics:IsPlayerTagged(player)
    return self.TaggedPlayer == player
end

function TagMechanics:ResetTag()
    self.TaggedPlayer = nil
    self.LastTagTime = 0
end

return TagMechanics