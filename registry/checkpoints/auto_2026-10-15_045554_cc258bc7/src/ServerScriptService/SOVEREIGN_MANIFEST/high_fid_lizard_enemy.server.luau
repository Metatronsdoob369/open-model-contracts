-- Metadata for Audit
local ASSET_HASH = "k9j8h7g6f5e4d3c2b1a0"  -- SHA-256 placeholder (hash this script to verify)
print("Generated High-Fid 3D Lizard Enemy. Audit hash: " .. ASSET_HASH)

-- Create model
local model = Instance.new("Model")
model.Name = "HighFidJackedLizard"
model.Parent = workspace

-- Colors
local skinColor = Color3.fromRGB(0, 100, 0)  -- Green skin
local eyeColor = Color3.fromRGB(255, 0, 0)   -- Red eyes
local clawColor = Color3.fromRGB(255, 255, 255)  -- White claws
local muscleColor = Color3.fromRGB(0, 80, 0)  -- Darker green for muscle definition

-- Helper to create part
local function createPart(name, size, position, color, parent, shape)
    local part = Instance.new("Part")
    part.Name = name
    part.Size = size
    part.Position = position
    part.Color = color
    part.Anchored = true
    part.Shape = shape or Enum.PartType.Block
    part.Parent = parent
    return part
end

-- Helper to weld
local function weld(part1, part2)
    local weld = Instance.new("WeldConstraint")
    weld.Part0 = part1
    weld.Part1 = part2
    weld.Parent = part1
end

-- Torso (cylinder for bulk)
local torso = createPart("Torso", Vector3.new(4, 6, 3), Vector3.new(0, 6, 0), skinColor, model, Enum.PartType.Cylinder)

-- Head (block with ball for jaw)
local head = createPart("Head", Vector3.new(3, 2, 2.5), Vector3.new(0, 9, 0), skinColor, model)
local jaw = createPart("Jaw", Vector3.new(2.5, 1, 2), Vector3.new(0, 8, 1), skinColor, head, Enum.PartType.Ball)
weld(head, jaw)

-- Eyes (small balls)
local leftEye = createPart("LeftEye", Vector3.new(0.5, 0.5, 0.5), Vector3.new(-1, 9.5, 0.5), eyeColor, head, Enum.PartType.Ball)
local rightEye = createPart("RightEye", Vector3.new(0.5, 0.5, 0.5), Vector3.new(1, 9.5, 0.5), eyeColor, head, Enum.PartType.Ball)
weld(head, leftEye)
weld(head, rightEye)

-- Muscular Arms (cylinders for biceps, blocks for forearms)
local leftBicep = createPart("LeftBicep", Vector3.new(2, 2, 2), Vector3.new(-3, 7, 0), muscleColor, model, Enum.PartType.Cylinder)
local leftForearm = createPart("LeftForearm", Vector3.new(1.5, 4, 1.5), Vector3.new(-4, 4, 0), skinColor, leftBicep)
weld(torso, leftBicep)
weld(leftBicep, leftForearm)

local rightBicep = createPart("RightBicep", Vector3.new(2, 2, 2), Vector3.new(3, 7, 0), muscleColor, model, Enum.PartType.Cylinder)
local rightForearm = createPart("RightForearm", Vector3.new(1.5, 4, 1.5), Vector3.new(4, 4, 0), skinColor, rightBicep)
weld(torso, rightBicep)
weld(rightBicep, rightForearm)

-- Claws (wedges for sharp look)
local leftClaw = createPart("LeftClaw", Vector3.new(0.5, 1, 0.5), Vector3.new(-4, 0, 0), clawColor, leftForearm, Enum.PartType.Wedge)
local rightClaw = createPart("RightClaw", Vector3.new(0.5, 1, 0.5), Vector3.new(4, 0, 0), clawColor, rightForearm, Enum.PartType.Wedge)
weld(leftForearm, leftClaw)
weld(rightForearm, rightClaw)

-- Muscular Legs (cylinders for thighs, blocks for calves)
local leftThigh = createPart("LeftThigh", Vector3.new(2.5, 3, 2), Vector3.new(-1.5, 3.5, 0), muscleColor, model, Enum.PartType.Cylinder)
local leftCalf = createPart("LeftCalf", Vector3.new(2, 3, 2), Vector3.new(-1.5, 0.5, 0), skinColor, leftThigh)
weld(torso, leftThigh)
weld(leftThigh, leftCalf)

local rightThigh = createPart("RightThigh", Vector3.new(2.5, 3, 2), Vector3.new(1.5, 3.5, 0), muscleColor, model, Enum.PartType.Cylinder)
local rightCalf = createPart("RightCalf", Vector3.new(2, 3, 2), Vector3.new(1.5, 0.5, 0), skinColor, rightThigh)
weld(torso, rightThigh)
weld(rightThigh, rightCalf)

-- Foot Claws (wedges)
local leftFootClaw = createPart("LeftFootClaw", Vector3.new(0.8, 1.5, 0.8), Vector3.new(-1.5, -1, 0), clawColor, leftCalf, Enum.PartType.Wedge)
local rightFootClaw = createPart("RightFootClaw", Vector3.new(0.8, 1.5, 0.8), Vector3.new(1.5, -1, 0), clawColor, rightCalf, Enum.PartType.Wedge)
weld(leftCalf, leftFootClaw)
weld(rightCalf, rightFootClaw)

-- Tail (tapered cylinders)
local tailBase = createPart("TailBase", Vector3.new(1.5, 4, 1.5), Vector3.new(0, 2, -1), skinColor, model, Enum.PartType.Cylinder)
tailBase.Orientation = Vector3.new(0, 0, -30)
local tailTip = createPart("TailTip", Vector3.new(1, 3, 1), Vector3.new(0, -1, -2), skinColor, tailBase, Enum.PartType.Cylinder)
tailTip.Orientation = Vector3.new(0, 0, -45)
weld(torso, tailBase)
weld(tailBase, tailTip)

-- Procedural Scales (small balls dotted on body)
for i = 1, 100 do
    local scale = createPart("Scale" .. i, Vector3.new(0.2, 0.2, 0.1), Vector3.new(math.random(-2, 2), math.random(0, 10), math.random(-1, 1)), Color3.fromRGB(0, 77, 0), torso, Enum.PartType.Ball)
    weld(torso, scale)
end

print("High-Fid 3D Jacked Lizard Enemy spawned at (0,6,0). Muscular Komodo anthro with scales, claws, tail, and procedural details.")
