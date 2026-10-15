--[=[
    Global.luau
    Status: CANONICAL | Diamond-Stable
    OMC Room: ROOM-02_WorldState
    Law Compliance: MemPalace §1, §2
    
    The Sovereign Memory Palace for the Metropolis Intelligence Hub.
    Ensures zero "loose locals" for shared state.
]=]

local Global = {
    Players = {},
    Houses = {},
    Customers = {},
    Manager = {},
    Paycheck = {},
    
    _OMC_READY = false,
    _SESSION_START = os.clock()
}

-- [MEMPALACE] Enforcement logic
function Global.RegisterRoomState(roomName, stateTable)
    if Global[roomName] then
        for k, v in pairs(stateTable) do
            Global[roomName][k] = v
        end
        return true
    end
    return false
end

function Global.IsManifest()
    return Global._OMC_READY
end

-- Initialize the Palace
task.spawn(function()
    -- Logic to verify all Rooms are manifest from the Qdrant Vault/DataStore
    task.wait(0.5) -- Simulated vault strike sync
    Global._OMC_READY = true
end)

return Global
