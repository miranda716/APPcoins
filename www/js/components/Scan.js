import { state, emitChange } from '../store.js';
import { campusPoints } from '../data/campusPoints.js';
import { MATERIALS, materialByLabel } from '../data/materials.js';
import { VENTANA_MS, ESPERA_MIN } from '../data/rules.js';
import { showToast, openModal } from '../utils/ui.js';
import { monthLabel } from '../utils/date.js';
import { estaAbierto, HORARIO_TEXTO } from '../utils/schedule.js';
import { parseQR } from '../services/qr.js';
import { cargarEsperas, esperaRestanteMs } from '../services/cooldown.js';
import { saveProgress } from '../services/data.js';
import { refreshChallenges } from '../services/challenges.js';
import { addDemoRecycle } from '../services/stats.js';

const botonesMateriales = Object.values(MATERIALS)
  .map((m) => `<button class="lock-btn" data-material="${m.label}" disabled>🔒 ${m.icon} ${m.label}</button>`)
  .join('');

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
    <p id="scan-hint" style="font-size:12px; color:#A8C3B0; margin-bottom:10px; line-height:1.5;"></p>

    <div class="material-btns" id="material-btns">${botonesMateriales}</div>

    <button class="claim-btn" id="claim-btn" onclick="claimRecycle()" disabled>Reclamar</button>
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

// ─────────── Sesión de escaneo: cada QR desbloquea su material ───────────
let timer = null;

const mmss = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const expirada = () => !!state.scanSession && Date.now() - state.scanSession.startedAt >= VENTANA_MS;

function detenerReloj() {
  clearInterval(timer);
  timer = null;
}

function iniciarReloj() {
  if (timer) return;
  timer = setInterval(() => {
    if (!state.scanSession) { detenerReloj(); return; }
    if (expirada()) { expirar(); return; }
    renderScanPanel();
  }, 1000);
}

/** Pasaron los 5 minutos sin reclamar: se pierde todo y puede intentar de nuevo. */
function expirar() {
  state.scanSession = null;
  detenerReloj();
  renderScanPanel();
  showToast('⏱️ Pasaron los 5 minutos. Se reinició: escanea los QR otra vez.', true);
}

function cerrarSesion() {
  state.scanSession = null;
  detenerReloj();
  renderScanPanel();
}

/** Dibuja el panel: materiales bloqueados/desbloqueados, tiempo restante y botón Reclamar. */
export function renderScanPanel() {
  const claimBtn = document.getElementById('claim-btn');
  if (!claimBtn) return;
  if (expirada()) { expirar(); return; }

  const s = state.scanSession;
  const punto = s ? campusPoints.find((p) => p.id === s.pointId) : null;

  document.querySelectorAll('#material-btns .lock-btn').forEach((btn) => {
    const m = materialByLabel(btn.dataset.material);
    const activo = !!s && s.unlocked.includes(m.label);
    btn.classList.toggle('unlocked', activo);
    btn.textContent = activo ? `✅ ${m.icon} ${m.label} (+${m.pts})` : `🔒 ${m.icon} ${m.label}`;
  });

  const base = s ? s.unlocked.reduce((suma, l) => suma + materialByLabel(l).pts, 0) : 0;
  const total = base * (state.user.doublePoints ? 2 : 1);
  claimBtn.disabled = total === 0;
  claimBtn.classList.toggle('ready', total > 0);
  claimBtn.textContent = total > 0 ? `Reclamar +${total} pts${state.user.doublePoints ? ' (x2)' : ''}` : 'Reclamar';

  const hint = document.getElementById('scan-hint');
  if (s) {
    hint.innerHTML = `📍 <strong>${punto.nombre}</strong><br>⏱️ Te quedan <strong>${mmss(VENTANA_MS - (Date.now() - s.startedAt))}</strong> para escanear los demás materiales y reclamar.`;
  } else if (!estaAbierto()) {
    hint.innerHTML = `🔴 Puntos cerrados ahora.<br>Horario: ${HORARIO_TEXTO}`;
  } else {
    hint.textContent = 'Escanea los QR de las canecas. Cada material se desbloquea al leer su QR.';
  }
}

function onDecoded(text) {
  const ahora = Date.now();
  if (ahora < lockUntil) return;
  lockUntil = ahora + 2500; // evita leer el mismo QR varias veces seguidas
  const parsed = parseQR(text, campusPoints);
  if (!parsed) {
    showToast('❓ QR no reconocido. Escanea un QR de EcoPuntos.', true);
    return;
  }
  procesarQR(parsed.point, parsed.material);
}

async function procesarQR(point, material) {
  if (!estaAbierto()) {
    if (state.scanSession) cerrarSesion();
    showToast(`🔴 Punto cerrado. Horario: ${HORARIO_TEXTO}`, true);
    return;
  }
  if (expirada()) { expirar(); }

  const s = state.scanSession;
  if (s && s.pointId !== point.id) {
    const actual = campusPoints.find((p) => p.id === s.pointId);
    showToast(`📍 Ya estás reciclando en ${actual.nombre}. Reclama ahí o espera a que se reinicie.`, true);
    return;
  }
  if (s && s.unlocked.includes(material.label)) {
    showToast(`✅ ${material.label} ya estaba desbloqueado.`);
    return;
  }

  await cargarEsperas(); // trae de Supabase los reclamos de los últimos 30 min
  const espera = esperaRestanteMs(material.label);
  if (espera > 0) {
    showToast(`⏱️ Ya reclamaste ${material.label} hace poco. Podrás volver a hacerlo en ${Math.ceil(espera / 60000)} min.`, true);
    return;
  }

  if (!state.scanSession) {
    state.scanSession = { pointId: point.id, startedAt: Date.now(), unlocked: [] };
  }
  state.scanSession.unlocked.push(material.label);
  iniciarReloj();
  renderScanPanel();
  showToast(`🔓 ${material.label} desbloqueado · ${point.nombre}`);
}

// ─────────── Reclamar: suma los puntos de todos los materiales y cuenta como 1 reciclaje ───────────
export function claimRecycle() {
  const s = state.scanSession;
  if (!s || s.unlocked.length === 0) return;
  if (expirada()) { expirar(); return; }
  if (!estaAbierto()) {
    cerrarSesion();
    showToast(`🔴 Punto cerrado. Horario: ${HORARIO_TEXTO}`, true);
    return;
  }

  const point = campusPoints.find((p) => p.id === s.pointId);
  const labels = s.unlocked.slice();
  const earned = labels.reduce((suma, l) => suma + materialByLabel(l).pts, 0) * (state.user.doublePoints ? 2 : 1);
  const ahora = Date.now();

  state.user.puntos += earned;
  state.user.puntosHistoricos += earned;
  state.user.reciclajesTotales += 1; // todo el reclamo cuenta como UN reciclaje
  state.user.doublePoints = false;
  labels.forEach((l) => { state.cooldowns[l] = ahora; }); // espera de 30 min por material
  if (!state.session) { state.local.recycles += 1; addDemoRecycle(); } // demo

  const titulo = `${labels.join(' + ')} · ${point.nombre}`;
  state.history.unshift({ mes: monthLabel(), titulo, fecha: 'Ahora mismo', puntos: earned });

  state.scanSession = null; // los materiales vuelven a bloquearse
  detenerReloj();
  emitChange();

  // Guarda el reclamo y después revisa los desafíos (cuentan los reciclajes ya guardados)
  (async () => {
    await saveProgress({ titulo, puntos: earned, tipo: 'reciclaje', materiales: labels });
    await refreshChallenges();
  })();

  openModal(`
    <div style="font-size:46px; margin-bottom:6px;">♻️</div>
    <h3 style="font-size:20px; font-weight:900;">¡Reciclaje registrado!</h3>
    <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">${point.nombre}</p>
    <div style="background:var(--accent-soft); color:var(--primary); font-size:26px; font-weight:900; padding:12px; border-radius:16px; margin:14px 0;">
      +${earned} EcoPuntos
    </div>
    <p style="font-size:13px; font-weight:800;">${labels.map((l) => `${materialByLabel(l).icon} ${l}`).join(' · ')}</p>
    <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">
      Podrás reclamar de nuevo estos materiales en ${ESPERA_MIN} min.
    </p>
    <button class="btn btn-primary" style="width:100%; margin-top:16px;" onclick="closeModal()">Continuar</button>
  `);
}
