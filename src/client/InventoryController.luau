--[=[
    InventoryController.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: Client_Visual (HUD Layer)
    Law Compliance: Resonance Manifestation §4, Dependency Autonomy §8

    The visual manifestation of the player's 3-slot inventory.
    Handles PC (1,2,3) inputs and Mobile touch buttons.
    Uses the "Gothic Rave" aesthetic (Translucent Dark + Neon Glow).
]=]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

-- ── Sovereign Anchors ─────────────────────────────────────────────────────────
local OMC = ReplicatedStorage:WaitForChild("OMC")
local Generated = OMC:WaitForChild("Generated")
local Telemetry = require(Generated:WaitForChild("Telemetry"))

-- ── Theme Constants ──────────────────────────────────────────────────────────
local COLORS = {
    BG = Color3.fromRGB(5, 5, 10),
    NEON_CYAN = Color3.fromRGB(0, 255, 255),
    NEON_PURPLE = Color3.fromRGB(200, 50, 255),
    EMPTY = Color3.fromRGB(20, 20, 30)
}

local TWEEN_INFO = TweenInfo.new(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)

-- ── Controller Definition ─────────────────────────────────────────────────────
local InventoryController = {}

-- Bridges (Server ↔ Client)
local InventorySyncBridge = ReplicatedStorage:WaitForChild("OMC_InventorySync")
local ActivateBridge = ReplicatedStorage:WaitForChild("OMC_InventoryActivate")
local CoOpRequestBridge = ReplicatedStorage:WaitForChild("OMC_CoOpRequest")
local CoOpResponseBridge = ReplicatedStorage:WaitForChild("OMC_CoOpResponse")

-- UI Refs
local _screenGui: ScreenGui = nil
local _slots: { [number]: Frame } = {}  -- [1, 2, 3]

-- ── UI Construction (Mobile-Safe) ─────────────────────────────────────────────

local function CreateSlot(index: number)
    local slot = Instance.new("Frame")
    slot.Name = "Slot" .. index
    slot.Size = UDim2.fromOffset(60, 60)
    slot.BackgroundColor3 = COLORS.BG
    slot.BackgroundTransparency = 0.2
    slot.BorderSizePixel = 0
    slot.ClipsDescendants = true -- Keep large icons inside

    local uiCorner = Instance.new("UICorner")
    uiCorner.CornerRadius = UDim.new(0, 8)
    uiCorner.Parent = slot

    local uiGradient = Instance.new("UIGradient")
    uiGradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, Color3.new(1,1,1)),
        ColorSequenceKeypoint.new(1, Color3.new(0.4, 0.4, 0.5))
    })
    uiGradient.Rotation = 45
    uiGradient.Parent = slot

    local uiStroke = Instance.new("UIStroke")
    uiStroke.Color = COLORS.NEON_CYAN
    uiStroke.Thickness = 2.5
    uiStroke.Transparency = 0.8
    uiStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    uiStroke.Name = "Glow"
    uiStroke.Parent = slot

    local icon = Instance.new("ImageLabel")
    icon.Name = "Icon"
    icon.Size = UDim2.fromScale(1.4, 1.4) -- Larger for visibility
    icon.Position = UDim2.fromScale(0.5, 0.5)
    icon.AnchorPoint = Vector2.new(0.5, 0.5)
    icon.BackgroundTransparency = 1
    icon.ImageTransparency = 1
    icon.ImageColor3 = COLORS.NEON_CYAN -- Force neon tint
    icon.Parent = slot

    local keyLabel = Instance.new("TextLabel")
    keyLabel.Name = "KeyLabel"
    keyLabel.Size = UDim2.fromScale(1, 0.3)
    keyLabel.Position = UDim2.fromScale(0, 0.8)
    keyLabel.BackgroundTransparency = 1
    keyLabel.Text = tostring(index)
    keyLabel.TextColor3 = Color3.new(1,1,1)
    keyLabel.TextTransparency = 0.5
    keyLabel.TextSize = 10
    keyLabel.FontFace = Font.fromEnum(Enum.Font.RobotoMono)
    keyLabel.Parent = slot

    -- Mobile Button Support
    local button = Instance.new("TextButton")
    button.Name = "MobileTrigger"
    button.Size = UDim2.fromScale(1, 1)
    button.BackgroundTransparency = 1
    button.Text = ""
    button.Parent = slot

    return slot
end

local function ConstructHUD()
    if _screenGui then _screenGui:Destroy() end

    _screenGui = Instance.new("ScreenGui")
    _screenGui.Name = "Grok_InventoryHUD"
    _screenGui.ResetOnSpawn = false
    _screenGui.DisplayOrder = 10
    _screenGui.Parent = PlayerGui

    local container = Instance.new("Frame")
    container.Name = "Container"
    container.Size = UDim2.fromOffset(220, 80)
    container.Position = UDim2.new(0.5, 0, 0.95, 0)
    container.AnchorPoint = Vector2.new(0.5, 1)
    container.BackgroundTransparency = 1
    container.Parent = _screenGui

    local uiList = Instance.new("UIListLayout")
    uiList.FillDirection = Enum.FillDirection.Horizontal
    uiList.HorizontalAlignment = Enum.HorizontalAlignment.Center
    uiList.VerticalAlignment = Enum.VerticalAlignment.Center
    uiList.Padding = UDim.new(0, 15)
    uiList.Parent = container

    for i = 1, 3 do
        local slot = CreateSlot(i)
        slot.Parent = container
        _slots[i] = slot

        -- Mobile Click Connect
        slot.MobileTrigger.Activated:Connect(function()
            InventoryController:RequestActivate(i)
        end)
    end
end

-- ── Logic ───────────────────────────────────────────────────────────────────

function InventoryController:Init()
    ConstructHUD()

    -- Server Sync Hook
    InventorySyncBridge.OnClientEvent:Connect(function(slotsPayload)
        InventoryController:UpdateHUD(slotsPayload)
    end)

    -- Input Hook (PC / Gamepad)
    UserInputService.InputBegan:Connect(function(input, processed)
        if processed then return end
        
        -- Keyboard
        if input.KeyCode == Enum.KeyCode.One then self:RequestActivate(1) end
        if input.KeyCode == Enum.KeyCode.Two then self:RequestActivate(2) end
        if input.KeyCode == Enum.KeyCode.Three then self:RequestActivate(3) end

        -- Gamepad (PS4/PS5 Support)
        if input.KeyCode == Enum.KeyCode.ButtonL1 then self:RequestActivate(1) end
        if input.KeyCode == Enum.KeyCode.ButtonR1 then self:RequestActivate(2) end
        if input.KeyCode == Enum.KeyCode.ButtonY then self:RequestActivate(3) end -- Triangle
    end)

    print("🎒 [INVENTORY-CTRL] HUD manifest. PC/Mobile listeners active.")
end

function InventoryController:UpdateHUD(slots)
    for i = 1, 3 do
        local slot = _slots[i]
        local item = slots[i]
        local uiStroke = slot:FindFirstChild("Glow") :: UIStroke
        local icon = slot:FindFirstChild("Icon") :: ImageLabel

        if item and item ~= "EMPTY" then
            -- Fill Slot
            TweenService:Create(uiStroke, TWEEN_INFO, {
                Color = COLORS.NEON_CYAN,
                Transparency = 0,
                Thickness = 4
            }):Play()
            
            icon.Image = item.icon
            icon.ImageColor3 = COLORS.NEON_CYAN
            TweenService:Create(icon, TWEEN_INFO, { ImageTransparency = 0 }):Play()
            
            slot.KeyLabel.Text = item.displayName
            slot.KeyLabel.TextTransparency = 0
        else
            -- Empty Slot
            TweenService:Create(uiStroke, TWEEN_INFO, {
                Color = COLORS.EMPTY,
                Transparency = 0.5,
                Thickness = 2
            }):Play()
            
            TweenService:Create(icon, TWEEN_INFO, { ImageTransparency = 1 }):Play()
            slot.KeyLabel.Text = "["..i.."]"
            slot.KeyLabel.TextTransparency = 0.5
        end
    end
end

function InventoryController:RequestActivate(slotIndex: number)
    -- Fast-action trigger
    -- Future: Open Co-Op menu if item supports it. 
    -- For now, default to SOLO to test the loop.
    ActivateBridge:FireServer({
        slotIndex = slotIndex,
        coopMode = "solo"
    })

    -- Visual Feedback
    local slot = _slots[slotIndex]
    if slot then
        local uiStroke = slot:FindFirstChild("Glow") :: UIStroke
        local originalColor = uiStroke.Color
        uiStroke.Color = Color3.new(1, 1, 1)
        task.delay(0.1, function()
            uiStroke.Color = originalColor
        end)
    end

    Telemetry.dispatchPulse({ event = "Slot_Trigger_Request", slot = slotIndex })
end

function InventoryController:Start()
    -- Any persistent loops go here
end

return InventoryController
