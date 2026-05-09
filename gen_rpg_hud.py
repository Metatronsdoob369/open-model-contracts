from PIL import Image, ImageDraw, ImageFont
import math

# Params from prompt: 800x600, blue fantasy theme, health/mana bars, inventory slots, minimap, labels
width, height = 800, 600
colors = {
    'bg': (20, 30, 60),  # Dark blue bg
    'bar_bg': (50, 60, 90),  # Mid blue bar background
    'health_fill': (200, 50, 50),  # Red health
    'mana_fill': (50, 50, 200),  # Blue mana
    'text': (220, 220, 255),  # Light blue text
    'slot': (80, 90, 120),  # Inventory slot color
    'minimap': (100, 110, 140)  # Minimap circle
}

img = Image.new('RGB', (width, height), colors['bg'])
draw = ImageDraw.Draw(img)
font = ImageFont.load_default()  # Use default or load a TTF for better fonts

# Draw health bar (top-left, gradient red-green but red for now)
draw.rectangle([(20, 20), (220, 40)], fill=colors['bar_bg'], outline=colors['text'])
draw.rectangle([(20, 20), (20 + 160, 40)], fill=colors['health_fill'])  # 80% full
draw.text((230, 25), "HP: 80/100", fill=colors['text'], font=font)

# Draw mana bar below health
draw.rectangle([(20, 50), (220, 70)], fill=colors['bar_bg'], outline=colors['text'])
draw.rectangle([(20, 50), (20 + 120, 70)], fill=colors['mana_fill'])  # 60% full
draw.text((230, 55), "MP: 60/100", fill=colors['text'], font=font)

# Draw inventory slots (bottom, 5 slots)
slot_size = 60
for i in range(5):
    x = 20 + i * (slot_size + 10)
    y = height - 80
    draw.rectangle([(x, y), (x + slot_size, y + slot_size)], fill=colors['slot'], outline=colors['text'])
    draw.text((x + 20, y + 20), f"Slot {i+1}", fill=colors['text'], font=font)

# Draw minimap (right circle with simple dots)
minimap_center = (width - 100, 100)
draw.ellipse([(minimap_center[0]-50, minimap_center[1]-50), (minimap_center[0]+50, minimap_center[1]+50)], fill=colors['minimap'], outline=colors['text'])
# Simple map dots (procedural placeholders)
for dot in [(minimap_center[0]-20, minimap_center[1]-10), (minimap_center[0]+15, minimap_center[1]+20)]:
    draw.ellipse([(dot[0]-5, dot[1]-5), (dot[0]+5, dot[1]+5)], fill=colors['health_fill'])

# Save
img.save('rpg_hud_ui.png')
print("Generated detailed RPG HUD: Health/mana bars, inventory slots, minimap, blue fantasy theme.")