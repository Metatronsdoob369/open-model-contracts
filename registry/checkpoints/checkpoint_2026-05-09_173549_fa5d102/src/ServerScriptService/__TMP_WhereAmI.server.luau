local Players = game:GetService("Players")
task.wait(4)
for _, p in ipairs(Players:GetPlayers()) do
	local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
	if hrp then
		print(string.format("[POS] %s at (%.0f, %.0f, %.0f)", p.Name, hrp.Position.X, hrp.Position.Y, hrp.Position.Z))
	end
end
for _, obj in ipairs(workspace:GetDescendants()) do
	if obj:IsA("Model") and (obj.Name == "AerialHawk" or obj.Name == "Crawler" or obj.Name == "Titan") then
		local hrp = obj:FindFirstChild("HumanoidRootPart")
		if hrp then
			print(string.format("[ENEMY] %s at (%.0f, %.0f, %.0f)", obj.Name, hrp.Position.X, hrp.Position.Y, hrp.Position.Z))
		end
	end
	if obj:IsA("Part") and string.sub(obj.Name, 1, 7) == "Pickup_" then
		print(string.format("[PICKUP] %s at (%.0f, %.0f, %.0f)", obj.Name, obj.Position.X, obj.Position.Y, obj.Position.Z))
	end
end
