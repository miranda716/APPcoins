import { state, emitChange } from '../store.js';
import { campusPoints } from '../data/campusPoints.js';
import { showToast, openModal } from '../utils/ui.js';
import { monthLabel } from '../utils/date.js';
import { GPS_STRICT, MAX_SCAN_DISTANCE_M } from '../config.js';
import { startLocationWatch, distanceToPoint, formatDistance } from '../services/geo.js';
import { saveProgress } from '../services/data.js';

export function ScanScreen() {
  return /* html */ `
<section class="screen" id="screen-scan">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div>
      <h2 style="font-size:20px; font-weight:900;">Escanear QR Campus</h2>
      <p style="font-size:12px; color:#A8C3B0;">Alinea el código QR con el marco</p>
    </div>
    <span style="background:rgba(139,195,74,0.2); color:#8BC34A; padding:5px 10px; border-radius:999px; font-size:11px; font-weight:800;">GPS &lt; 100m</span>
  </div>

  <div class="scanner-viewport" id="scanner-box">
    <div class="qr-guide-box">
      <div class="scan-laser"></div>
      <span style="font-size:11px; color:#C8E6C9; font-weight:700;">QR Unicórdoba</span>
    </div>
    <div class="scanner-tools">
      <button class="tool-circle" onclick="toggleFlash()">🔦 Linterna</button>
      <button class="tool-circle" onclick="showToast('Galería abierta: selecciona imagen QR')">🖼️ Galería</button>
    </div>
  </div>

  <div class="sim-panel">
    <div style="font-size:12px; font-weight:800; color:#8BC34A; margin-bottom:6px;">
      SIMULADOR DE ESCANEO Y ANTIFRAUDE
    </div>
    <select id="scan-point-select"></select>

    <div class="material-btns">
      <button class="btn btn-primary" style="padding:10px; font-size:13px;" onclick="simulateScan('Plástico', 50)">🧴 Plástico (+50)</button>
      <button class="btn btn-primary" style="padding:10px; font-size:13px;" onclick="simulateScan('Vidrio', 40)">🍾 Vidrio (+40)</button>
      <button class="btn btn-primary" style="padding:10px; font-size:13px;" onclick="simulateScan('Papel', 30)">📄 Papel (+30)</button>
      <button class="btn btn-primary" style="padding:10px; font-size:13px;" onclick="simulateScan('Aluminio', 20)">🥫 Aluminio (+20)</button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
      <button class="btn" style="background:#26392D; color:#FFB74D; font-size:11px; padding:9px;" onclick="testOutOfRange()">
        ⚠️ Probar fuera (&gt;100m)
      </button>
      <button class="btn" style="background:#26392D; color:#90CAF9; font-size:11px; padding:9px;" onclick="simulateScan('Plástico', 50, true)">
        ⏱️ Repetir QR (&lt;30m)
      </button>
    </div>
  </div>
</section>
`;
}

export function renderScannerSelect() {
  const sel = document.getElementById('scan-point-select');
  const current = sel.value;
  sel.innerHTML = campusPoints.map((p) =>
    `<option value="${p.id}">${p.nombre} (${p.codigoQR})</option>`
  ).join('');
  if (current) sel.value = current;
}

// TODO: linterna real (requiere cámara)
export function toggleFlash() {
  state.flashOn = !state.flashOn;
  document.getElementById('scanner-box').style.boxShadow = state.flashOn
    ? 'inset 0 0 60px rgba(255,255,200,0.35)'
    : 'none';
  showToast(state.flashOn ? '🔦 Linterna activada' : '🔦 Linterna desactivada');
}

export function testOutOfRange() {
  showToast('📍 Error GPS: Estás a más de 100m del punto de Unicórdoba.', true);
}

// TODO: reemplazar el simulador por lectura real del QR con la cámara
export function simulateScan(material, basePts, forceCooldown = false) {
  const pointId = document.getElementById('scan-point-select').value || campusPoints[0].id;
  const point = campusPoints.find((p) => p.id === pointId);
  const now = Date.now();
  const last = state.lastScanByPoint[pointId] || 0;

  // Validación GPS real (solo se exige si GPS_STRICT = true en config.js)
  startLocationWatch();
  if (GPS_STRICT) {
    const dist = distanceToPoint(point);
    if (dist === null) {
      showToast(state.gpsError || '📡 Activa el GPS y acepta el permiso para escanear.', true);
      return;
    }
    if (dist > MAX_SCAN_DISTANCE_M) {
      showToast(`📍 Estás a ${formatDistance(dist)} del punto. Acércate a menos de ${MAX_SCAN_DISTANCE_M} m.`, true);
      return;
    }
  }

  if (forceCooldown || (now - last < 30 * 60 * 1000 && last !== 0)) {
    showToast('⏱️ Antifraude: Ya escaneaste este QR hace menos de 30 minutos.', true);
    return;
  }

  state.lastScanByPoint[pointId] = now;
  const multiplier = state.user.doublePoints ? 2 : 1;
  const earned = basePts * multiplier;
  const co2Map = { 'Plástico': 0.65, 'Vidrio': 0.45, 'Papel': 0.50, 'Aluminio': 0.85 };
  const co2Added = co2Map[material] || 0.5;

  state.user.puntos += earned;
  state.user.reciclajesTotales += 1;
  state.user.co2Total += co2Added;

  if (state.user.doublePoints) {
    state.user.doublePoints = false;
  }

  state.history.unshift({
    mes: monthLabel(),
    titulo: `${material} · ${point.nombre}`,
    fecha: 'Ahora mismo',
    puntos: earned
  });

  // Actualizar desafíos
  let bonusMsg = '';
  state.challenges.forEach((ch) => {
    if (!ch.completado && ((ch.tipo === 'reciclaje' && point.tipo === 'reciclaje') || (ch.tipo === 'comercio' && point.tipo === 'comercio'))) {
      ch.progreso += 1;
      if (ch.progreso >= ch.meta) {
        ch.completado = true;
        state.user.puntos += ch.puntos;
        bonusMsg = ` 🏆 ¡Desafío "${ch.titulo}" completado (+${ch.puntos} pts)!`;
      }
    }
  });

  emitChange();
  saveProgress({ titulo: `${material} · ${point.nombre}`, puntos: earned });
  openModal(`
    <div style="font-size:46px; margin-bottom:6px;">✅</div>
    <h3 style="font-size:20px; font-weight:900;">¡Escaneo Exitoso!</h3>
    <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">${point.nombre}</p>
    <div style="background:var(--accent-soft); color:var(--primary); font-size:26px; font-weight:900; padding:12px; border-radius:16px; margin:14px 0;">
      +${earned} EcoPuntos
    </div>
    <p style="font-size:12px; font-weight:700; color:var(--text-muted);">
      Material: <strong>${material}</strong> · CO₂ evitado: <strong>+${co2Added.toFixed(2)} kg</strong>
    </p>
    ${bonusMsg ? `<p style="font-size:12px; color:var(--secondary); font-weight:800; margin-top:8px;">${bonusMsg}</p>` : ''}
    <button class="btn btn-primary" style="width:100%; margin-top:16px;" onclick="closeModal()">Continuar</button>
  `);
}
