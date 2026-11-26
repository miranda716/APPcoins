// Estadísticas del usuario: reciclajes por día (semana actual) y meses con aporte (año actual).
// Todo se calcula con la hora de Colombia (UTC-5).
import { state } from '../store.js';
import { getClient } from './supabase.js';
import { weekStartColombia } from './challenges.js';

const DIA_MS = 86400000;
const CO_OFFSET_MS = 5 * 3600 * 1000;

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function ahoraColombia(now = new Date()) {
  const l = new Date(now.getTime() - CO_OFFSET_MS);
  return { year: l.getUTCFullYear(), month: l.getUTCMonth(), dayIdx: (l.getUTCDay() + 6) % 7 }; // lunes = 0
}

/**
 * A partir de las fechas (ISO) de cada reciclaje calcula:
 *  week   → reciclajes por día, Lun–Sáb (null = día que aún no llega)
 *  months → 1 si aportó ese mes, 0 si no (null = mes que aún no llega)
 */
export function buildStats(fechas, now = new Date()) {
  const { year, month, dayIdx } = ahoraColombia(now);
  const lunesMs = new Date(weekStartColombia(now).iso).getTime();
  const week = DIAS.map((_, i) => (i <= dayIdx ? 0 : null));
  const months = MESES.map((_, m) => (m <= month ? 0 : null));
  let mesCount = 0;

  for (const iso of fechas) {
    const t = new Date(iso).getTime();
    const d = Math.floor((t - lunesMs) / DIA_MS);
    if (d >= 0 && d < 6 && week[d] !== null) week[d] += 1;

    const l = new Date(t - CO_OFFSET_MS);
    if (l.getUTCFullYear() === year && months[l.getUTCMonth()] !== null) {
      months[l.getUTCMonth()] = 1;
      if (l.getUTCMonth() === month) mesCount += 1;
    }
  }
  return { week, months, semana: week.reduce((s, v) => s + (v || 0), 0), mes: mesCount };
}

// ── Modo demo: datos de ejemplo que además suben cuando "reciclas" en la demo ──
function buildDemoStats() {
  const { month, dayIdx } = ahoraColombia();
  const L = state.local;
  return {
    week: DIAS.map((_, i) => (i <= dayIdx ? L.weekCounts[i] || 0 : null)),
    months: MESES.map((_, m) => (m <= month ? L.monthFlags[m] || 0 : null)),
    semana: L.weekCounts.slice(0, dayIdx + 1).reduce((s, v) => s + v, 0),
    mes: L.monthCount
  };
}

export function addDemoRecycle() {
  const { month, dayIdx } = ahoraColombia();
  if (dayIdx < 6) state.local.weekCounts[dayIdx] += 1;
  state.local.monthFlags[month] = 1;
  state.local.monthCount += 1;
}

export async function loadStats() {
  const sb = getClient();
  if (sb && state.session) {
    const { year } = ahoraColombia();
    const desde = new Date(Date.UTC(year, 0, 1) + CO_OFFSET_MS).toISOString(); // 1 de enero 00:00 Colombia
    const { data, error } = await sb.from('movimientos').select('created_at')
      .eq('user_id', state.session.userId).eq('tipo', 'reciclaje')
      .gte('created_at', desde).limit(5000);
    if (error) { console.error('Estadísticas:', error); return; }
    state.stats = buildStats(data.map((r) => r.created_at));
  } else {
    state.stats = buildDemoStats();
  }
}
