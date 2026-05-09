function VictimService:_startChaseLoop()
	if self.State.chaseThread then return end
	
	-- [OMC RESONANCE GUARD]
	local function validateTarget(pos)
		if typeof(pos) ~= "Vector3" then return false end
		if pos.Y < -500 or pos.Y > 5000 then return false end -- Void check
		return true
	end

	self.State.chaseThread = task.spawn(function()
		while self.State.active do
			local aliveMonsters = self:GetAliveMonsters()
			for _, monster in ipairs(aliveMonsters) do
				local hum = monster:FindFirstChildOfClass("Humanoid")
				local root = getMonsterRoot(monster)
				
				if hum and root and validateTarget(root.Position) then
					local target, dist = nearestAlivePlayerFrom(root.Position)
					local targetRoot = target and target.Character and target.Character:FindFirstChild("HumanoidRootPart")
					
					if targetRoot and validateTarget(targetRoot.Position) then
						-- 4D Predictive Interception
						local velocity = targetRoot.AssemblyLinearVelocity
						local predictedPos = targetRoot.Position + (velocity * self.Config.PREDICTION_TIME)
						
						-- Lunge Logic (Resonance Threshold Check)
						if dist and dist <= self.Config.LUNGE_DISTANCE then
							predictedPos = predictedPos + (targetRoot.CFrame.LookVector * 3)
							hum.Jump = true
						end

						-- Vertical Resonance
						if (targetRoot.Position.Y - root.Position.Y) > 4 then
							hum.Jump = true
						end

						-- Sovereign Movement Execution
						hum:MoveTo(predictedPos)
					end
				end
			end
			
			-- Resonant Heartbeat (Synced to 3072-D Manifold)
			task.wait(self.Config.RETARGET_RATE)
		end
		self.State.chaseThread = nil
	end)
end

function VictimService:StopRound()
	self.State.active = false
	if self.State.folder and self.State.folder.Parent then
		self.State.folder:Destroy()
	end
	self.State.folder = nil
	self.State.monsters = {}
end

function VictimService:StartRound()
	self:StopRound()
	self.State.active = true

	for i = 1, self.Config.COUNT do
		table.insert(self.State.monsters, self:CreateVictim(i))
	end

	self:_startChaseLoop()
	print(string.format("[VICTIMS] Spawned %d monsters.", #self.State.monsters))
end

function VictimService:Init()