# Genera los iconos de Android (adaptativo + clásico) desde www/icons/icon-512.png
import glob, os
from PIL import Image

SRC = 'www/icons/icon-512.png'
RES = 'android/app/src/main/res'
BG = '#1F6B34'

# Borra los iconos por defecto de Capacitor
for f in glob.glob(f'{RES}/mipmap-*/ic_launcher*'):
    os.remove(f)

src = Image.open(SRC).convert('RGBA')
sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}

for dens, s in sizes.items():
    folder = f'{RES}/mipmap-{dens}'
    os.makedirs(folder, exist_ok=True)
    # Icono clásico (Android 7.x)
    legacy = src.resize((s, s), Image.LANCZOS)
    legacy.save(f'{folder}/ic_launcher.png')
    legacy.save(f'{folder}/ic_launcher_round.png')
    # Primer plano del icono adaptativo: lienzo de 108dp con el logo al 50 % en el centro
    canvas = round(s * 108 / 48)
    inner = round(canvas * 0.50)
    fg = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    logo = src.resize((inner, inner), Image.LANCZOS)
    off = (canvas - inner) // 2
    fg.paste(logo, (off, off), logo)
    fg.save(f'{folder}/ecop_foreground.png')

os.makedirs(f'{RES}/mipmap-anydpi-v26', exist_ok=True)
xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ecop_icon_bg"/>
    <foreground android:drawable="@mipmap/ecop_foreground"/>
</adaptive-icon>
'''
for name in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    with open(f'{RES}/mipmap-anydpi-v26/{name}', 'w') as f:
        f.write(xml)

os.makedirs(f'{RES}/values', exist_ok=True)
with open(f'{RES}/values/ecop_icon.xml', 'w') as f:
    f.write(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ecop_icon_bg">{BG}</color>\n</resources>\n')

print('Iconos de Android generados')
