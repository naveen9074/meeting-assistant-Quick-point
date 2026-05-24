from PIL import Image, ImageDraw

size = 64
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

white = (255, 255, 255, 255)
cx = size // 2

# Mic body
draw.rounded_rectangle([20, 6, 44, 38], radius=12, fill=white)

# Mic arc
draw.arc([8, 20, 56, 46], start=0, end=180, fill=white, width=4)

# Stand
draw.line([cx, 46, cx, 54], fill=white, width=4)

# Base
draw.line([20, 54, 44, 54], fill=white, width=4)

img.save("C:/Users/naveen/Desktop/quickpoint/src-tauri/icons/icon_tray.png")
img.save("C:/Users/naveen/Desktop/quickpoint/src-tauri/icons/icon_tray_update.png")
print("Tray icons saved")
print(f"Image size: {img.size}, mode: {img.mode}")
