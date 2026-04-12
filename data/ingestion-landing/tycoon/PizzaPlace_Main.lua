2026-04-11T10:14:53.244Z,1297.244263,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Main---
2026-04-11T10:14:53.244Z,1297.244385,9f53000,6 [FLog::Output] 


local ServerScriptService = script.Parent

if game.ReplicatedFirst:FindFirstChild("ReplicatedFirst") then
	if not game.ReplicatedFirst.ReplicatedFirst.Disable then
		error("ReplicatedFirst script must be disabled")
	end
	game.ReplicatedFirst.ReplicatedFirst.Disabled = false
end


--china stuff
spawn(function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	print("China Policy Active : ",active)
	_G.IsChina = active--ChinaPolicyService:IsActive()
end)

workspace.Main.IsChineseServer.OnServerInvoke = function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	wait(1)
	return _G.IsChina
end




local Customers = require(ServerScriptService:WaitForChild("Customers"))
print
2026-04-11T10:14:53.244Z,1297.244385,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:14:57.546Z,1301.546265,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Main---
2026-04-11T10:14:57.546Z,1301.546387,9f53000,6 [FLog::Output] 


local ServerScriptService = script.Parent

if game.ReplicatedFirst:FindFirstChild("ReplicatedFirst") then
	if not game.ReplicatedFirst.ReplicatedFirst.Disable then
		error("ReplicatedFirst script must be disabled")
	end
	game.ReplicatedFirst.ReplicatedFirst.Disabled = false
end


--china stuff
spawn(function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	print("China Policy Active : ",active)
	_G.IsChina = active--ChinaPolicyService:IsActive()
end)

workspace.Main.IsChineseServer.OnServerInvoke = function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	wait(1)
	return _G.IsChina
end




local Customers = require(ServerScriptService:WaitForChild("Customers"))
print
2026-04-11T10:14:57.546Z,1301.546387,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:15:25.511Z,1329.511230,911a000,6 [FLog::Output] ---START_FILE:ServerScriptService.Main---
2026-04-11T10:15:25.511Z,1329.511353,911a000,6 [FLog::Output] 


local ServerScriptService = script.Parent

if game.ReplicatedFirst:FindFirstChild("ReplicatedFirst") then
	if not game.ReplicatedFirst.ReplicatedFirst.Disable then
		error("ReplicatedFirst script must be disabled")
	end
	game.ReplicatedFirst.ReplicatedFirst.Disabled = false
end


--china stuff
spawn(function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	print("China Policy Active : ",active)
	_G.IsChina = active--ChinaPolicyService:IsActive()
end)

workspace.Main.IsChineseServer.OnServerInvoke = function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	wait(1)
	return _G.IsChina
end




local Customers = require(ServerScriptService:WaitForChild("Customers"))
print
2026-04-11T10:15:25.511Z,1329.511353,911a000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:21.053Z,1445.053467,9b4d000,6 [FLog::Output] ---START_FILE:ServerScriptService.Main---
2026-04-11T10:17:21.053Z,1445.053589,9b4d000,6 [FLog::Output] 


local ServerScriptService = script.Parent

if game.ReplicatedFirst:FindFirstChild("ReplicatedFirst") then
	if not game.ReplicatedFirst.ReplicatedFirst.Disable then
		error("ReplicatedFirst script must be disabled")
	end
	game.ReplicatedFirst.ReplicatedFirst.Disabled = false
end


--china stuff
spawn(function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	print("China Policy Active : ",active)
	_G.IsChina = active--ChinaPolicyService:IsActive()
end)

workspace.Main.IsChineseServer.OnServerInvoke = function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	wait(1)
	return _G.IsChina
end




local Customers = require(ServerScriptService:WaitForChild("Customers"))
print
2026-04-11T10:17:21.053Z,1445.053711,9b4d000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:27.055Z,1451.055908,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Main---
2026-04-11T10:17:27.056Z,1451.056030,9f53000,6 [FLog::Output] 


local ServerScriptService = script.Parent

if game.ReplicatedFirst:FindFirstChild("ReplicatedFirst") then
	if not game.ReplicatedFirst.ReplicatedFirst.Disable then
		error("ReplicatedFirst script must be disabled")
	end
	game.ReplicatedFirst.ReplicatedFirst.Disabled = false
end


--china stuff
spawn(function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	print("China Policy Active : ",active)
	_G.IsChina = active--ChinaPolicyService:IsActive()
end)

workspace.Main.IsChineseServer.OnServerInvoke = function()
	local ChinaPolicyService = require(game.ServerScriptService:WaitForChild("ChinaPolicyService"))
	ChinaPolicyService:WaitForReady()
	local active, default = ChinaPolicyService:IsActive()
	wait(1)
	return _G.IsChina
end




local Customers = require(ServerScriptService:WaitForChild("Customers"))
print
2026-04-11T10:17:27.056Z,1451.056030,9f53000,6 [FLog::Output] ---END_FILE---
