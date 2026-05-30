const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const outDir = path.join(process.cwd(), "src-tauri", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const python = spawnSync(
  "python",
  [
    "-c",
    `
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

out_dir = Path(r"${outDir.replace(/\\/g, "\\\\")}")
size = 1024
img = Image.new("RGBA", (size, size), (10, 11, 15, 255))
draw = ImageDraw.Draw(img)

# Background glow layers
for radius, color in [
    (410, (96, 100, 255, 52)),
    (330, (0, 194, 255, 42)),
    (240, (138, 92, 255, 58)),
]:
    x0 = y0 = (size // 2) - radius
    x1 = y1 = (size // 2) + radius
    draw.ellipse((x0, y0, x1, y1), fill=color)

# Main ring
draw.ellipse((108, 108, 916, 916), fill=(18, 20, 28, 255), outline=(118, 124, 255, 255), width=24)
draw.ellipse((154, 154, 870, 870), outline=(0, 194, 255, 160), width=12)

font_paths = [
    r"C:\\Windows\\Fonts\\segoeuib.ttf",
    r"C:\\Windows\\Fonts\\arialbd.ttf",
]
for font_path in font_paths:
    try:
        font_phi = ImageFont.truetype(font_path, 540)
        font_v = ImageFont.truetype(font_path, 250)
        break
    except Exception:
        font_phi = ImageFont.load_default()
        font_v = ImageFont.load_default()

phi_bbox = draw.textbbox((0, 0), "Φ", font=font_phi)
phi_x = (size - (phi_bbox[2] - phi_bbox[0])) // 2
phi_y = 82
draw.text((phi_x, phi_y), "Φ", font=font_phi, fill=(250, 250, 255, 255))
draw.text((phi_x - 3, phi_y - 3), "Φ", font=font_phi, fill=(88, 101, 242, 90))

v_bbox = draw.textbbox((0, 0), "V", font=font_v)
v_x = (size - (v_bbox[2] - v_bbox[0])) // 2
v_y = 456
draw.text((v_x, v_y), "V", font=font_v, fill=(0, 194, 255, 255))
draw.text((v_x - 2, v_y - 2), "V", font=font_v, fill=(255, 255, 255, 120))

img.save(out_dir / "icon.png")

sizes = [16, 32, 48, 64, 128, 256]
for s in sizes:
    img.resize((s, s), Image.Resampling.LANCZOS).save(out_dir / f"{s}x{s}.png")
img.resize((1024, 1024), Image.Resampling.LANCZOS).save(out_dir / "128x128@2x.png")
img.save(out_dir / "icon.ico", format="ICO", sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
img.save(out_dir / "icon.icns", format="PNG")
print("branding generated")
`,
  ],
  { stdio: "inherit" },
);

if (python.status !== 0) {
  process.exit(python.status ?? 1);
}
