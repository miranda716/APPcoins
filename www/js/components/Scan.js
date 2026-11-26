import { state, emitChange } from '../store.js';
import { campusPoints } from '../data/campusPoints.js';
import { showToast, openModal } from '../utils/ui.js';
import { monthLabel } from '../utils/date.js';
import { saveProgress } from '../services/data.js';
import { parseQR } from '../services/qr.js';
import { refreshChallenges } from '../services/challenges.js';
import { addDemoRecycle } from '../services/stats.js';
import { materialByLabel } from '../data/materials.js';

export function ScanScreen() {
  return /* html */ `
<section class="screen" id="screen-scan">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div>
      <h2 style="font-size:20px; font-weight:900;">Escanear QR Campus</h2>
      <p style="font-size:12px; color:#A8C3B0;">Alinea el código QR con el marco</p>
    </div>
  </div>

  <div class="scanner-viewport" id="scanner-box">
    <div id="qr-reader"></div>
    <div class="qr-status" id="qr-status"></div>
    <div class="qr-guide-box">
      <div class="scan-laser"></div>
      <span style="font-size:11px; color:#C8E6C9; font-weight:700;">QR Unicórdoba</span>
    </div>
    <div class="scanner-tools">
      <button class="tool-circle" onclick="toggleFlash()">🔦 Linterna</button>
    </div>
  </div>

  <div class="sim-panel">
    <div style="font-size:12px; font-weight:800; color:#8BC34A; margin-bottom:4px;">MATERIALES A RECLAMAR</div>
    <p id="scan-hint" style="font-size:12px; color:#A8C3B0; margin-bottom:10px;">
      Escanea los QR de las canecas. Cada material se desbloquea al leer su QR.
    </p>

    <div class="material-btns">
      <button class="lock-btn" disabled>🔒 🧴 Plástico</button>
      <button class="lock-btn" disabled>🔒 🍾 Vidrio</button>
      <button class="lock-btn" disabled>🔒 📄 Papel</button>
      <button class="lock-btn" disabled>🔒 🥫 Aluminio</button>
    </div>

    <button class="claim-btn" id="claim-btn" disabled>Reclamar</button>
  </div>
</section>
`;
}

// ─────────── Cámara y lectura de QR (librería html5-qrcode) ───────────
let scanner = null;
let running = false;
let starting = false;
let lockUntil = 0; // evita leer el mismo QR varias veces seguidas

const isScanVisible = () => document.getElementById('screen-scan').classList.contains('active');

function setStatus(html) {
  document.getElementById('qr-status').innerHTML = html;
}

async function startScanner() {
  if (!window.Html5Qrcode) {
    setStatus('No se pudo cargar el lector de QR.<br>Revisa tu conexión y recarga.');
    return;
  }
  starting = true;
  setStatus('Abriendo cámara…');
  try {
    scanner = scanner || new Html5Qrcode('qr-reader');
    await scanner.start({ facingMode: 'environment' }, { fps: 10 }, onDecoded, () => {});
    running = true;
    setStatus('');
    if (!isScanVisible()) await stopScanner(); // el usuario ya se fue de la pantalla
  } catch (err) {
    console.error('Cámara:', err);
    setStatus('No se pudo abrir la cámara.<br>Acepta el permiso y pulsa Reintentar.<br><button class="btn btn-primary" style="margin-top:8px; padding:8px 14px; font-size:12px;" onclick="retryCamera()">Reintentar</button>');
  } finally {
    starting = false;
  }
}

async function stopScanner() {
  try { if (scanner && running) await scanner.stop(); } catch (e) { /* ya estaba detenida */ }
  running = false;
  state.flashOn = false;
}

/** Abre la cámara al entrar a la pantalla y la cierra al salir (se llama desde render.js). */
export function syncScanner() {
  if (isScanVisible()) {
    if (!running && !starting) startScanner();
  } else if (running) {
    stopScanner();
  }
}

export function retryCamera() {
  if (!running && !starting) startScanner();
}

export async function toggleFlash() {
  if (!running) { showToast('🔦 Abre la cámara primero', true); return; }
  try {
    const torch = scanner.getRunningTrackCameraCapabilities().torchFeature();
    if (!torch.isSupported()) { showToast('🔦 Tu dispositivo no permite usar la linterna', true); return; }
    await torch.apply(!torch.value());
    state.flashOn = torch.value();
    showToast(state.flashOn ? '🔦 Linterna activada' : '🔦 Linterna desactivada');
  } catch (e) {
    showToast('🔦 No se pudo usar la linterna', true);
  }
}

function onDecoded(text) {
  const now = Date.now();
  if (now < lockUntil) return;
  const parsed = parseQR(text, campusPoints);
  lockUntil = now + (parsed ? 5000 : 2500);
  if (!parsed) {
    showToast('❓ QR no reconocido. Escanea un QR de EcoPuntos.', true);
    return;
  }
  registerRecycle(parsed.point, parsed.material.label);
}

// ─────────── Registrar un reciclaje (1 escaneo = 1 reciclaje) ───────────
export function registerRecycle(point, materialLabel, forceCooldown = false) {
  const mat = materialByLabel(materialLabel);
  const key = `${point.id}:${materialLabel}`;
  const now = Date.now();
  const last = state.lastScanByPoint[key] || 0;

  if (forceCooldown || (last !== 0 && now - last < 30 * 60 * 1000)) {
    showToast('⏱️ Ya escaneaste este QR hace menos de 30 minutos.', true);
    return;
  }

  state.lastScanByPoint[key] = now;
  const earned = mat.pts * (state.user.doublePoints ? 2 : 1);

  state.user.puntos += earned;
  state.user.puntosHistoricos += earned;
  if (!state.session) { state.local.recycles += 1; addDemoRecycle(); } // demo
  state.user.reciclajesTotales += 1;
  state.user.doublePoints = false;

  state.history.unshift({
    mes: monthLabel(),
    titulo: `${materialLabel} · ${point.nombre}`,
    fecha: 'Ahora mismo',
    puntos: earned
  });

  emitChange();
  // Guarda el reciclaje y después revisa los desafíos (cuentan los reciclajes ya guardados)
  (async () => {
    await saveProgress({ titulo: `${materialLabel} · ${point.nombre}`, puntos: earned, tipo: 'reciclaje' });
    await refreshChallenges();
  })();
  openModal(`
    <div style="font-size:46px; margin-bottom:6px;">${mat.icon}</div>
    <h3 style="font-size:20px; font-weight:900;">¡Reciclaje registrado!</h3>
    <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">${point.nombre}</p>
    <div style="background:var(--accent-soft); color:var(--primary); font-size:26px; font-weight:900; padding:12px; border-radius:16px; margin:14px 0;">
      +${earned} EcoPuntos
    </div>
    <p style="font-size:12px; font-weight:700; color:var(--text-muted);">
      Material: <strong>${materialLabel}</strong>
    </p>
    <button class="btn btn-primary" style="width:100%; margin-top:16px;" onclick="closeModal()">Continuar</button>
  `);
}
