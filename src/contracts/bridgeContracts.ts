// src/contracts/bridgeContracts.ts
// Pre-approved generic OMC bridge contracts
// These are the ONLY contracts allowed for topological bridges.
// No dynamic schema generation is permitted.

export const BridgeContracts = {
  // 1. Simple signal / trigger only (no payload)
  OMC_Bridge_SignalOnly: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["signal"] },
      timestamp: { type: "number" }
    },
    required: ["type", "timestamp"]
  },

  // 2. State synchronization (lightweight key-value map)
  OMC_Bridge_StateSync: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["stateSync"] },
      timestamp: { type: "number" },
      data: { 
        type: "object",
        additionalProperties: { type: ["string", "number", "boolean"] }
      }
    },
    required: ["type", "timestamp", "data"]
  },

  // 3. Player-initiated action (most common for tag/rowdy events)
  OMC_Bridge_PlayerAction: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["playerAction"] },
      timestamp: { type: "number" },
      playerId: { type: "number" },
      action: { type: "string" },
      payload: { 
        type: "object",
        additionalProperties: true 
      }
    },
    required: ["type", "timestamp", "playerId", "action"]
  }
  // 4. Inventory slot sync (server → client HUD)
  OMC_Bridge_InventorySync: {
    type: "object",
    properties: {
      slots: {
        type: "object",
        description: "Map of slot index (1-3) to item definition or null",
        additionalProperties: {
          oneOf: [
            {
              type: "object",
              properties: {
                id:          { type: "string" },
                displayName: { type: "string" },
                icon:        { type: "string" },
                duration:    { type: "number" }
              },
              required: ["id", "displayName", "icon", "duration"]
            },
            { type: "null" }
          ]
        }
      }
    },
    required: ["slots"]
  },

  // 5. Co-Op request broadcast (server → client popup)
  OMC_Bridge_CoOpRequest: {
    type: "object",
    properties: {
      type:          { type: "string", enum: ["coopRequest"] },
      initiatorId:   { type: "number" },
      initiatorName: { type: "string" },
      itemId:        { type: "string" },
      actionType:    { type: "string" },
      isPublic:      { type: "boolean" }
    },
    required: ["initiatorId", "initiatorName", "itemId", "actionType", "isPublic"]
  },

  // 6. Co-Op response (client → server accept/decline)
  OMC_Bridge_CoOpResponse: {
    type: "object",
    properties: {
      type:            { type: "string", enum: ["coopResponse"] },
      initiatorUserId: { type: "number" },
      accepted:        { type: "boolean" }
    },
    required: ["initiatorUserId", "accepted"]
  }

} as const;

// Helper for Luau-side validation (mirrored from your existing TagGameContracts)
export function getBridgeContract(name: keyof typeof BridgeContracts) {
  return BridgeContracts[name];
}
