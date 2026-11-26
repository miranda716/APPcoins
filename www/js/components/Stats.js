import { state } from '../store.js';
import { DIAS, MESES } from '../services/stats.js';

export function StatsScreen() {
  return /* html */ `
<section class="screen" id="screen-stats">
  <div class="auth-header">
    <button class="icon-btn" onclick="switchTab('screen-profile')">←</button>
    <div>
      <h2 style="font-size:19px; font-weight:900;">Mis estadísticas</h2>
      <p style="font-size:12px; color:var(--text-muted);">Tu aporte al campus</p>
    </div>
  </div>

  <div class="section-pad">
    <div class="stats-summary">
      <div class="impact-pill-card"><strong id="stat-semana">0</strong><span>Esta semana</span></div>
      <div class="impact-pill-card"><strong id="stat-mes">0</strong><span>Este mes</span></div>
      <div class="impact-pill-card"><strong id="stat-total">0</strong><span>Total</span></div>
    </div>

    <div class="card">
      <h3 class="chart-title">Reciclajes de la semana</h3>
      <p class="chart-sub">Cuántas veces aportaste cada día (lunes a sábado)</p>
      <div id="chart-week"></div>
    </div>

    <div class="card">
      <h3 class="chart-title">Aporte por mes</h3>
      <p class="chart-sub">1 = aportaste ese mes · 0 = no aportaste</p>
      <div id="chart-months"></div>
    </div>
  </div>
</section>
`;
}

/** Gráfica de línea (SVG, sin librerías). values: número o null (= aún no llega). */
function lineChart(labels, values, { yMax, step = false, area = false, showValues = false, binary = false }) {
  const W = 320, H = 190, L = 30, R = 14, T = 16, B = 28;
  const iw = W - L - R, ih = H - T - B, n = labels.length;
  const x = (i) => L + (i * iw) / (n - 1);

  // eje Y con marcas enteras
  const tick = binary ? 1 : Math.max(1, Math.ceil(yMax / 4));
  const top = binary ? 1 : Math.ceil(yMax / tick) * tick;
  const y = (v) => T + ih - (v / top) * ih;

  let grid = '';
  for (let v = 0; v <= top; v += tick) {
    grid += `<line class="chart-grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>
             <text class="chart-txt" x="${L - 8}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
  }
  const xl = labels.map((t, i) =>
    `<text class="chart-txt" x="${x(i)}" y="${H - 8}" text-anchor="middle">${t}</text>`).join('');

  const pts = values.map((v, i) => (v === null ? null : { x: x(i), y: y(v), v })).filter(Boolean);
  let path = '';
  pts.forEach((p, i) => {
    if (i === 0) path = `M${p.x},${p.y}`;
    else path += step ? ` H${p.x} V${p.y}` : ` L${p.x},${p.y}`;
  });
  const areaPath = area && pts.length > 1
    ? `<path class="chart-area" d="${path} L${pts[pts.length - 1].x},${y(0)} L${pts[0].x},${y(0)} Z"/>` : '';
  const dots = pts.map((p) =>
    `<circle class="chart-dot ${binary && p.v === 0 ? 'zero' : ''}" cx="${p.x}" cy="${p.y}" r="4.5"/>` +
    (showValues ? `<text class="chart-val" x="${p.x}" y="${p.y - 9}" text-anchor="middle">${p.v}</text>` : '')
  ).join('');

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img">
    ${grid}${areaPath}<path class="chart-line" d="${path}"/>${dots}${xl}</svg>`;
}

export function renderStats() {
  const st = state.stats;
  document.getElementById('stat-total').textContent = state.user.reciclajesTotales;
  if (!st) {
    document.getElementById('chart-week').innerHTML = '<p class="chart-sub">Cargando…</p>';
    document.getElementById('chart-months').innerHTML = '';
    return;
  }
  document.getElementById('stat-semana').textContent = st.semana;
  document.getElementById('stat-mes').textContent = st.mes;

  const maxDia = Math.max(3, ...st.week.map((v) => v || 0));
  document.getElementById('chart-week').innerHTML =
    lineChart(DIAS, st.week, { yMax: maxDia, area: true, showValues: true });
  document.getElementById('chart-months').innerHTML =
    lineChart(MESES, st.months, { yMax: 1, step: true, binary: true });
}
