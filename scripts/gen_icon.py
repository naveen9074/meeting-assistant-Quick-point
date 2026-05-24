from PIL import Image, ImageDraw
import math

size = 1024
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Purple background with rounded corners
bg_color = (99, 102, 241, 255)  # #6366F1
r = 160  # corner radius

# Draw rounded rectangle background
draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=bg_color)

# Draw white microphone
white = (255, 255, 255, 255)
cx, cy = size // 2, size // 2

# Mic body (rounded rectangle)
mb_w, mb_h = 210, 290
mb_x1 = cx - mb_w // 2
mb_y1 = cy - mb_h // 2 - 50
mb_x2 = cx + mb_w // 2
mb_y2 = cy + mb_h // 2 - 50
draw.rounded_rectangle([mb_x1, mb_y1, mb_x2, mb_y2], radius=105, fill=white)

# Mic arc (stand bowl) - semicircle below mic body
arc_r = 200
arc_cx, arc_cy = cx, mb_y2 - 10
draw.arc([arc_cx - arc_r, arc_cy - arc_r, arc_cx + arc_r, arc_cy + arc_r],
         start=0, end=180, fill=white, width=36)

# Vertical stand line
stand_x = cx
stand_y1 = arc_cy + arc_r - 10
stand_y2 = stand_y1 + 100
draw.line([stand_x, stand_y1, stand_x, stand_y2], fill=white, width=36)

# Horizontal base
base_w = 180
draw.line([cx - base_w//2, stand_y2, cx + base_w//2, stand_y2], fill=white, width=36)

# Save
img.save('C:/Users/naveen/Desktop/quickpoint/src-tauri/icons/icon_new.png')
print("Icon saved: icon_new.png")
print(f"Image size: {img.size}")
print(f"Image mode: {img.mode}")
