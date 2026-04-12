2026-04-11T10:14:53.243Z,1297.243042,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Global---
2026-04-11T10:14:53.243Z,1297.243042,9f53000,6 [FLog::Output] local Global = {}
Global.Houses = {} 
Global.Players = {}
Global.AssetLibraryManager = {}
Global.Manager = {}
Global.Vehicles={}
Global.Environment={}
Global.Customers={}
Global.Door = {}
Global.Paycheck = {}
Global.NPCs = {}
Global.ShopDisplays = {}

function Global:FireClient(player,action,...)
	workspace.GameService.GlobalConnector:FireClient(player,action,...)
end

function Global:FireAllClients(action,...)
	workspace.GameService.GlobalConnector:FireAllClients(action,...)
end

workspace.GameService.GlobalConnector.OnServerEvent:connect(function(player,className,action,...)
	local tuple = ...
	pcall(function()
		if typeof(action) == "string" then
			Global[className]:Receive(player,action,tuple)
		end
	end)
end)

function Global:WaitForClassToLoad(className)
--[[function Global:SyncMemberWithClient(object,memberName,value,player)
	if player then
		game.ReplicatedStorage.PublicMembers.SyncMember:FireClient(player,object,memberName,value)
	else

2026-04-11T10:14:53.243Z,1297.243042,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:14:57.544Z,1301.544800,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Global---
2026-04-11T10:14:57.544Z,1301.544800,9f53000,6 [FLog::Output] local Global = {}
Global.Houses = {} 
Global.Players = {}
Global.AssetLibraryManager = {}
Global.Manager = {}
Global.Vehicles={}
Global.Environment={}
Global.Customers={}
Global.Door = {}
Global.Paycheck = {}
Global.NPCs = {}
Global.ShopDisplays = {}

function Global:FireClient(player,action,...)
	workspace.GameService.GlobalConnector:FireClient(player,action,...)
end

function Global:FireAllClients(action,...)
	workspace.GameService.GlobalConnector:FireAllClients(action,...)
end

workspace.GameService.GlobalConnector.OnServerEvent:connect(function(player,className,action,...)
	local tuple = ...
	pcall(function()
		if typeof(action) == "string" then
			Global[className]:Receive(player,action,tuple)
		end
	end)
end)

function Global:WaitForClassToLoad(className)
--[[function Global:SyncMemberWithClient(object,memberName,value,player)
	if player then
		game.ReplicatedStorage.PublicMembers.SyncMember:FireClient(player,object,memberName,value)
	else

2026-04-11T10:14:57.544Z,1301.544922,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:15:25.509Z,1329.509644,911a000,6 [FLog::Output] ---START_FILE:ServerScriptService.Global---
2026-04-11T10:15:25.509Z,1329.509766,911a000,6 [FLog::Output] local Global = {}
Global.Houses = {} 
Global.Players = {}
Global.AssetLibraryManager = {}
Global.Manager = {}
Global.Vehicles={}
Global.Environment={}
Global.Customers={}
Global.Door = {}
Global.Paycheck = {}
Global.NPCs = {}
Global.ShopDisplays = {}

function Global:FireClient(player,action,...)
	workspace.GameService.GlobalConnector:FireClient(player,action,...)
end

function Global:FireAllClients(action,...)
	workspace.GameService.GlobalConnector:FireAllClients(action,...)
end

workspace.GameService.GlobalConnector.OnServerEvent:connect(function(player,className,action,...)
	local tuple = ...
	pcall(function()
		if typeof(action) == "string" then
			Global[className]:Receive(player,action,tuple)
		end
	end)
end)

function Global:WaitForClassToLoad(className)
--[[function Global:SyncMemberWithClient(object,memberName,value,player)
	if player then
		game.ReplicatedStorage.PublicMembers.SyncMember:FireClient(player,object,memberName,value)
	else

2026-04-11T10:15:25.509Z,1329.509766,911a000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:21.052Z,1445.052246,9b4d000,6 [FLog::Output] ---START_FILE:ServerScriptService.Global---
2026-04-11T10:17:21.052Z,1445.052246,9b4d000,6 [FLog::Output] local Global = {}
Global.Houses = {} 
Global.Players = {}
Global.AssetLibraryManager = {}
Global.Manager = {}
Global.Vehicles={}
Global.Environment={}
Global.Customers={}
Global.Door = {}
Global.Paycheck = {}
Global.NPCs = {}
Global.ShopDisplays = {}

function Global:FireClient(player,action,...)
	workspace.GameService.GlobalConnector:FireClient(player,action,...)
end

function Global:FireAllClients(action,...)
	workspace.GameService.GlobalConnector:FireAllClients(action,...)
end

workspace.GameService.GlobalConnector.OnServerEvent:connect(function(player,className,action,...)
	local tuple = ...
	pcall(function()
		if typeof(action) == "string" then
			Global[className]:Receive(player,action,tuple)
		end
	end)
end)

function Global:WaitForClassToLoad(className)
--[[function Global:SyncMemberWithClient(object,memberName,value,player)
	if player then
		game.ReplicatedStorage.PublicMembers.SyncMember:FireClient(player,object,memberName,value)
	else

2026-04-11T10:17:21.052Z,1445.052246,9b4d000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:27.054Z,1451.054565,9f53000,6 [FLog::Output] ---START_FILE:ServerScriptService.Global---
2026-04-11T10:17:27.054Z,1451.054565,9f53000,6 [FLog::Output] local Global = {}
Global.Houses = {} 
Global.Players = {}
Global.AssetLibraryManager = {}
Global.Manager = {}
Global.Vehicles={}
Global.Environment={}
Global.Customers={}
Global.Door = {}
Global.Paycheck = {}
Global.NPCs = {}
Global.ShopDisplays = {}

function Global:FireClient(player,action,...)
	workspace.GameService.GlobalConnector:FireClient(player,action,...)
end

function Global:FireAllClients(action,...)
	workspace.GameService.GlobalConnector:FireAllClients(action,...)
end

workspace.GameService.GlobalConnector.OnServerEvent:connect(function(player,className,action,...)
	local tuple = ...
	pcall(function()
		if typeof(action) == "string" then
			Global[className]:Receive(player,action,tuple)
		end
	end)
end)

function Global:WaitForClassToLoad(className)
--[[function Global:SyncMemberWithClient(object,memberName,value,player)
	if player then
		game.ReplicatedStorage.PublicMembers.SyncMember:FireClient(player,object,memberName,value)
	else

2026-04-11T10:17:27.054Z,1451.054565,9f53000,6 [FLog::Output] ---END_FILE---
