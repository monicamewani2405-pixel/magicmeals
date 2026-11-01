import os, base64

pouch_dir = r"c:\Users\Monica\Desktop\magicmeals\pouch-art"
out_file = os.path.join(pouch_dir, "pouch-textures.js")

products = [
    "rajma-masala", "paneer-butter-masala", "paneer-bhurji", "pind-ke-chhole",
    "pav-bhaji", "bhindi-masala", "veg-kadhai", "veg-makhanwala", "moong-masala",
    "dal-makhani", "dal-tadka", "dal-fry", "gujarati-dal", "dal-khichdi",
    "masala-khichdi-kadhi", "veg-biryani", "jeera-rice", "tawa-pulao",
    "fried-rice", "schezwan-rice", "mexican-rice", "fried-rice-manchurian",
    "kanda-poha", "idli-sambar", "upma", "mumbai-misal", "tomato-soup",
    "sweet-corn-soup", "hot-and-sour-soup", "gajar-halwa", "aam-ras", "rawa-sheera"
]

lines = ["// Auto-generated 3D pouch texture assets for all products", "window.POUCH_TEXTURES = {"]

for pid in products:
    f_path = os.path.join(pouch_dir, f"{pid}-front.webp")
    b_path = os.path.join(pouch_dir, f"{pid}-back.webp")
    if os.path.exists(f_path) and os.path.exists(b_path):
        with open(f_path, "rb") as f:
            f_b64 = base64.b64encode(f.read()).decode("ascii")
        with open(b_path, "rb") as f:
            b_b64 = base64.b64encode(f.read()).decode("ascii")
        lines.append(f'  "{pid}": {{')
        lines.append(f'    front: "data:image/webp;base64,{f_b64}",')
        lines.append(f'    back: "data:image/webp;base64,{b_b64}"')
        lines.append("  },")

lines.append("};")
lines.append('window.RAJMA_POUCH_TEXTURES = window.POUCH_TEXTURES["rajma-masala"];')

with open(out_file, "w", encoding="utf-8") as out:
    out.write("\n".join(lines) + "\n")

print(f"Generated pouch-textures.js successfully, size: {os.path.getsize(out_file) // 1024} KB")
