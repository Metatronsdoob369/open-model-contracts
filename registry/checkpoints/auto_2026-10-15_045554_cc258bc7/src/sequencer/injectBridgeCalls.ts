import { RegisterIssue } from '../omc/governance.js';
// Note: We're mocking or importing contracts. Adjust import to your codebase if necessary.
// import { BridgeContracts } from '../contracts/bridgeContracts.js';

export interface BridgeMetadata {
  id: string;
  name: string;
  sourceRoom: string;
  targetRoom: string;
  fracturePath: string;
}

export function injectBridgeCalls(
  brokenCode: string,
  bridge: BridgeMetadata,
  fracturePath: string,
  contract: string,
  addEarlyLoadGuards: boolean = false
): string {

  const throttleRate = getBridgeThrottleRate(fracturePath);

  let guardCode = "";

  if (addEarlyLoadGuards) {
    guardCode = `
-- ROBUST EARLY-LOAD GUARD
local function SafeWaitForChild(parent, childName, timeout)
    timeout = timeout or 8
    local start = os.clock()
    while os.clock() - start < timeout do
        local child = parent:FindFirstChild(childName)
        if child then return child end
        task.wait(0.2)
    end
    -- Governance Alert (Mocked for testing)
    return nil
end
`;
  }

  // CRITICAL: Stripped Luau type annotations (like : any, : Player) to comply with Lua 5.1 AST Parsers in Escrow.
  const injectionCode = `
-- CANONICAL BRIDGE INJECTION: ${bridge.name}
-- Fracture Path: ${fracturePath}
-- Contract: ${contract}
-- Throttle Rate: ${throttleRate} calls/sec

${guardCode}

local ${bridge.name}_LastFire = 0
local ${bridge.name}_ThrottleRate = ${throttleRate}

local function SafeFire${bridge.name}(payload)
    local now = os.clock()
    if now - ${bridge.name}_LastFire < (1 / ${bridge.name}_ThrottleRate) then
        return
    end

    ${bridge.name}_LastFire = now

    ${bridge.name}:FireServer(payload)
end

-- RECEIVER-SIDE GUARD
${bridge.name}.OnServerEvent:Connect(function(player, payload)
    local now = os.clock()
    if not ${bridge.name}_LastReceive then ${bridge.name}_LastReceive = 0 end
    if now - ${bridge.name}_LastReceive < 0.05 then
        return
    end
    ${bridge.name}_LastReceive = now

    -- Safe consumption point
end)
`;

  // Safe replace: only target raw FireServer calls in the broken code
  const rawFireRegex = new RegExp(`\\b${bridge.name}:FireServer\\b`, 'g');
  const safeBrokenCode = brokenCode.replace(rawFireRegex, `SafeFire${bridge.name}`);

  let repaired = injectionCode + "\n\n" + safeBrokenCode;

  return repaired;
}

function getBridgeThrottleRate(fracturePath: string): number {
  if (fracturePath.includes("characterAdded")) return 15;
  if (fracturePath.includes("chaosEvent") || fracturePath.includes("rowdy")) return 8;
  return 10;
}
