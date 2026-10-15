--[=[
    TraceCapture.lua
    Lightweight, high-fidelity instrumentation for 4D Spatio-Temporal Analysis.
    
    HOW TO USE:
    1. Parent this to game.ReplicatedStorage.Utils.TraceCapture
    2. Require it at the top of your scripts.
    3. Call traceCapture.record("phase_name") at key points.
]=]

local TraceCapture = {}
TraceCapture.__index = TraceCapture

function TraceCapture.new()
    local self = setmetatable({}, TraceCapture)
    self._traces = {}
    self._startTime = os.clock()
    return self
end

function TraceCapture:record(phase)
    local now = os.clock()
    local elapsed = now - self._startTime
    
    table.insert(self._traces, {
        timestamp = elapsed,
        phase = phase
    })
    
    print(string.format("[4D-TRACE] %s recorded at t=%.3fs", phase, elapsed))
    return now
end

function TraceCapture:getTraces()
    return self._traces
end

function TraceCapture:print()
    print("╚═══ Metropolis Execution Trace ═══╝")
    for _, t in ipairs(self._traces) do
        print(string.format("t=%.3fs → %s", t.timestamp, t.phase))
    end
end

-- Global singleton instance
return TraceCapture.new()
