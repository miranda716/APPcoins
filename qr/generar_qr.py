"""
Genera el PDF de QR imprimibles: un QR por MATERIAL en cada punto de reciclaje.

Uso:    pip install reportlab
        python qr/generar_qr.py
Lee:    www/js/data/campusPoints.js  (puntos, códigos y materiales)
Crea:   qr/QR-EcoPuntos.pdf

Formato de cada QR:  ECOPUNTOS:<codigoQR del punto>:<material>
"""
import re, pathlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF

ROOT = pathlib.Path(__file__).resolve().parent.parent
MATERIALES = {            # etiqueta en el punto -> (clave en el QR, color)
    'Plástico': ('plastico', '#1E88E5'),
    'Vidrio':   ('vidrio',   '#2E7D32'),
    'Papel':    ('papel',    '#6D4C41'),
    'Aluminio': ('aluminio', '#EF6C00'),
}

def leer_puntos():
    src = (ROOT / 'www/js/data/campusPoints.js').read_text(encoding='utf-8')
    puntos = []
    for bloque in re.findall(r'\{[^{}]*?id:[^{}]*?\}', src, re.S):
        g = lambda k: (re.search(k + r":\s*'([^']*)'", bloque) or [None, None])[1]
        mats = re.search(r'materiales:\s*\[(.*?)\]', bloque, re.S)
        puntos.append({
            'nombre': g('nombre'), 'tipo': g('tipo'), 'codigo': g('codigoQR'),
            'materiales': re.findall(r"'([^']*)'", mats.group(1)) if mats else [],
        })
    return puntos

def tarjetas():
    out = []
    for p in leer_puntos():
        if p['tipo'] != 'reciclaje':
            continue
        for etiqueta in p['materiales']:
            if etiqueta in MATERIALES:
                clave, color = MATERIALES[etiqueta]
                out.append({'texto': f"ECOPUNTOS:{p['codigo']}:{clave}", 'etiqueta': etiqueta,
                            'color': color, 'punto': p['nombre'], 'codigo': p['codigo']})
    return out

def dibujar(c, t, x, y, w, h):
    col = HexColor(t['color'])
    c.setStrokeColor(col); c.setLineWidth(1.6); c.roundRect(x, y, w, h, 4*mm)
    # banda superior con el material
    c.setFillColor(col); c.roundRect(x, y + h - 14*mm, w, 14*mm, 4*mm, stroke=0, fill=1)
    c.rect(x, y + h - 14*mm, w, 6*mm, stroke=0, fill=1)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 17)
    c.drawCentredString(x + w/2, y + h - 10*mm, t['etiqueta'].upper())
    # QR
    size = 44*mm   # deja ~6 mm de margen blanco alrededor (zona silenciosa del QR)
    wd = QrCodeWidget(t['texto'], barLevel='M'); b = wd.getBounds()
    d = Drawing(size, size, transform=[size/(b[2]-b[0]), 0, 0, size/(b[3]-b[1]), 0, 0]); d.add(wd)
    renderPDF.draw(d, c, x + (w-size)/2, y + 24*mm)
    # textos
    c.setFillColor(black); c.setFont('Helvetica-Bold', 9.5)
    ty = y + 13.5*mm
    for linea in simpleSplit(t['punto'], 'Helvetica-Bold', 9.5, w - 8*mm)[:2]:
        c.drawCentredString(x + w/2, ty, linea); ty -= 4.2*mm
    c.setFont('Helvetica', 7.5); c.setFillColor(HexColor('#555555'))
    c.drawCentredString(x + w/2, y + 4.5*mm, f"{t['codigo']} · Escanea con la app EcoPuntos")

def main():
    cards = tarjetas()
    W, H = A4
    cw, ch, gx, gy, mx, my = 88*mm, 88*mm, 6*mm, 5*mm, 11*mm, 10*mm
    salida = ROOT / 'qr/QR-EcoPuntos.pdf'
    c = canvas.Canvas(str(salida), pagesize=A4)
    c.setTitle('QR EcoPuntos Unicórdoba')
    for i, t in enumerate(cards):
        pos = i % 6
        if i and pos == 0:
            c.showPage()
        col, fila = pos % 2, pos // 2
        dibujar(c, t, mx + col*(cw+gx), H - my - (fila+1)*ch - fila*gy, cw, ch)
    c.save()
    print(f'{len(cards)} QR en {salida}')
    for t in cards:
        print('  ', t['texto'])

if __name__ == '__main__':
    main()
