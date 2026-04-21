--[=[
    CoOpController.luau
    Status: SOVEREIGN BLUEPRINT | Diamond-Stable
    OMC Room: Client_Visual

    Handles incoming co-op offer popups (public + private) and sends
    accept/decline back to the server via OMC_CoOpResponse.

    Flow:
      Server fires OMC_CoOpRequest → this controller shows popup
      Player taps Accept → fires OMC_CoOpResponse with { accepted=true }
      Player taps Decline or ignores (timeout) → fires { accepted=false }
]=]

local Players         = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService    = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui   = LocalPlayer:WaitForChild("PlayerGui")

-- Bridges
local CoOpRequestBridge  = ReplicatedStorage:WaitForChild("OMC_CoOpRequest")
local CoOpResponseBridge = ReplicatedStorage:WaitForChild("OMC_CoOpResponse")

-- Config
local POPUP_TIMEOUT   = 8      -- seconds before auto-decline
local POPUP_W, POPUP_H = 340, 110

-- ── Theme ─────────────────────────────────────────────────────────────────────
local COLORS = {
    BG        = Color3.fromRGB(8, 8, 18),
    BORDER    = Color3.fromRGB(0, 210, 255),
    BORDER_PVT = Color3.fromRGB(200, 50, 255),
    ACCEPT    = Color3.fromRGB(0, 200, 100),
    DECLINE   = Color3.fromRGB(200, 40, 40),
    TEXT      = Color3.fromRGB(240, 245, 255),
    SUBTEXT   = Color3.fromRGB(160, 170, 200),
    TIMER_LOW = Color3.fromRGB(255, 60, 60),
}

local CoOpController = {}

-- ── UI Construction ───────────────────────────────────────────────────────────

local function buildPopup(payload: {
    initiatorName: string,
    itemId: string,
    actionType: string,
    isPublic: boolean,
})
    local gui = Instance.new("ScreenGui")
    gui.Name = "CoOp_Popup"
    gui.ResetOnSpawn = false
    gui.DisplayOrder = 20
    gui.Parent = PlayerGui

    -- Card
    local card = Instance.new("Frame")
    card.Name = "Card"
    card.Size = UDim2.fromOffset(POPUP_W, POPUP_H)
    card.Position = UDim2.new(0.5, 0, 0, 90)
    card.AnchorPoint = Vector2.new(0.5, 0)
    card.BackgroundColor3 = COLORS.BG
    card.BackgroundTransparency = 0.08
    card.BorderSizePixel = 0
    card.Parent = gui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 14)
    corner.Parent = card

    local borderColor = payload.isPublic and COLORS.BORDER or COLORS.BORDER_PVT
    local stroke = Instance.new("UIStroke")
    stroke.Color = borderColor
    stroke.Thickness = 2
    stroke.Transparency = 0.1
    stroke.Parent = card

    -- Tag: PUBLIC or PRIVATE
    local tag = Instance.new("TextLabel")
    tag.Name = "Tag"
    tag.Size = UDim2.fromOffset(70, 20)
    tag.Position = UDim2.fromOffset(12, 10)
    tag.BackgroundColor3 = borderColor
    tag.BackgroundTransparency = 0.3
    tag.BorderSizePixel = 0
    tag.TextColor3 = Color3.new(1,1,1)
    tag.TextSize = 10
    tag.Font = Enum.Font.GothamBold
    tag.Text = payload.isPublic and "PUBLIC" or "PRIVATE"
    tag.Parent = card
    Instance.new("UICorner", tag).CornerRadius = UDim.new(0, 6)

    -- Timer bar (shrinks over POPUP_TIMEOUT)
    local timerBar = Instance.new("Frame")
    timerBar.Name = "TimerBar"
    timerBar.Size = UDim2.new(1, -24, 0, 3)
    timerBar.Position = UDim2.fromOffset(12, POPUP_H - 10)
    timerBar.BackgroundColor3 = borderColor
    timerBar.BorderSizePixel = 0
    timerBar.Parent = card
    Instance.new("UICorner", timerBar).CornerRadius = UDim.new(1, 0)

    -- Main label
    local label = Instance.new("TextLabel")
    label.Name = "Label"
    label.Size = UDim2.new(1, -24, 0, 28)
    label.Position = UDim2.fromOffset(12, 34)
    label.BackgroundTransparency = 1
    label.TextColor3 = COLORS.TEXT
    label.TextSize = 14
    label.Font = Enum.Font.GothamBold
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.TextTruncate = Enum.TextTruncate.AtEnd
    label.Text = payload.initiatorName .. " wants to Co-Op → " .. payload.itemId
    label.Parent = card

    -- Sub-label: action description
    local sub = Instance.new("TextLabel")
    sub.Name = "Sub"
    sub.Size = UDim2.new(1, -24, 0, 18)
    sub.Position = UDim2.fromOffset(12, 58)
    sub.BackgroundTransparency = 1
    sub.TextColor3 = COLORS.SUBTEXT
    sub.TextSize = 11
    sub.Font = Enum.Font.Gotham
    sub.TextXAlignment = Enum.TextXAlignment.Left
    sub.Text = payload.actionType or "Teamwork action"
    sub.Parent = card

    -- Buttons
    local btnContainer = Instance.new("Frame")
    btnContainer.Name = "Buttons"
    btnContainer.Size = UDim2.fromOffset(160, 32)
    btnContainer.Position = UDim2.new(1, -12, 0, 34)
    btnContainer.AnchorPoint = Vector2.new(1, 0)
    btnContainer.BackgroundTransparency = 1
    btnContainer.Parent = card

    local layout = Instance.new("UIListLayout")
    layout.FillDirection = Enum.FillDirection.Horizontal
    layout.HorizontalAlignment = Enum.HorizontalAlignment.Right
    layout.VerticalAlignment = Enum.VerticalAlignment.Center
    layout.Padding = UDim.new(0, 8)
    layout.Parent = btnContainer

    local function makeBtn(text, color)
        local btn = Instance.new("TextButton")
        btn.Size = UDim2.fromOffset(72, 30)
        btn.BackgroundColor3 = color
        btn.BackgroundTransparency = 0.2
        btn.BorderSizePixel = 0
        btn.TextColor3 = Color3.new(1,1,1)
        btn.TextSize = 12
        btn.Font = Enum.Font.GothamBold
        btn.Text = text
        btn.Parent = btnContainer
        Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 8)
        return btn
    end

    local declineBtn = makeBtn("✗ Pass", COLORS.DECLINE)
    local acceptBtn  = makeBtn("✓ Join", COLORS.ACCEPT)

    -- Slide-in animation
    card.Position = UDim2.new(0.5, 0, 0, 60)
    card.BackgroundTransparency = 1
    TweenService:Create(card, TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Position = UDim2.new(0.5, 0, 0, 90),
        BackgroundTransparency = 0.08,
    }):Play()

    return gui, acceptBtn, declineBtn, timerBar, borderColor
end

-- ── Dismiss helper ────────────────────────────────────────────────────────────

local function dismissPopup(gui: ScreenGui, accepted: boolean, initiatorId: number)
    CoOpResponseBridge:FireServer({
        accepted    = accepted,
        initiatorId = initiatorId,
    })

    -- Slide out
    local card = gui:FindFirstChild("Card")
    if card then
        TweenService:Create(card, TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
            Position = UDim2.new(0.5, 0, 0, 50),
            BackgroundTransparency = 1,
        }):Play()
    end
    task.delay(0.25, function()
        if gui and gui.Parent then gui:Destroy() end
    end)
end

-- ── Main listener ─────────────────────────────────────────────────────────────

function CoOpController:Init()
    CoOpRequestBridge.OnClientEvent:Connect(function(payload)
        -- Only one popup at a time
        if PlayerGui:FindFirstChild("CoOp_Popup") then
            PlayerGui.CoOp_Popup:Destroy()
        end

        local gui, acceptBtn, declineBtn, timerBar, borderColor = buildPopup(payload)
        local responded = false

        local function respond(accepted: boolean)
            if responded then return end
            responded = true
            dismissPopup(gui, accepted, payload.initiatorId)
        end

        acceptBtn.Activated:Connect(function() respond(true) end)
        declineBtn.Activated:Connect(function() respond(false) end)

        -- Timer bar shrink
        local startTime = os.clock()
        local conn
        conn = game:GetService("RunService").Heartbeat:Connect(function()
            if responded then conn:Disconnect() return end
            local elapsed = os.clock() - startTime
            local frac = math.clamp(1 - (elapsed / POPUP_TIMEOUT), 0, 1)
            timerBar.Size = UDim2.new(frac, -24 * (1 - frac), 0, 3)
            if frac < 0.3 then
                timerBar.BackgroundColor3 = COLORS.TIMER_LOW
            end
            if elapsed >= POPUP_TIMEOUT then
                conn:Disconnect()
                respond(false) -- auto-decline on timeout
            end
        end)
    end)

    print("🤝 [COOP-CTRL] Co-Op offer listener active.")
end

function CoOpController:Start() end

return CoOpController
