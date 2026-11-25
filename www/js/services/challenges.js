// Progreso y cobro de desafíos.
//  · Reciclaje: cuenta los movimientos "reciclaje" desde el lunes 00:00 (hora Colombia).
//  · Invitar:   cuenta (función contar_referidos de Supabase) a los invitados que ya reciclaron.
//  · Cada desafío se cobra una sola vez por periodo (la base lo garantiza con una llave única).
import { state, emitChange } from '../store.js';
import { CHALLENGES, UNICO_KEY, buildChallenges } from '../data/challenges.js';
import { getClient } from './supabase.js';
import { saveProgress } from './data.js';
import { monthLabel } from '../utils/date.js';
import { showToast } from '../utils/ui.js';

const CO_OFFSET_MS = 5 * 3600 * 1000; // Colombia = UTC-5 (sin horario de verano)

/** Inicio de la semana actual: lunes 00:00 hora de Colombia. */
export function weekStartColombia(now = new Date()) {
  const local = new Date(now.getTime() - CO_OFFSET_MS);       // reloj de Colombia (se lee con getUTC*)
  const dia = (local.getUTCDay() + 6) % 7;                    // lunes = 0
  const lunesLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dia);
  return {
    iso: new Date(lunesLocal + CO_OFFSET_MS).toISOString(),   // para filtrar created_at
    key: new Date(lunesLocal).toISOString().slice(0, 10)      // "2026-11-23", identifica la semana
  };
}

async function claim(def, periodo) {
  const sb = getClient();
  if (sb && state.session) {
    const { error } = await sb.from('desafios_completados').insert({
      user_id: state.session.userId, desafio_id: def.id, periodo, puntos: def.puntos
    });
    if (error) return error.code === '23505' ? 'ya' : 'error'; // 23505 = ya estaba cobrado
  } else {
    state.local.claimed.push(def.id);
  }
  state.user.puntos += def.puntos;
  state.user.puntosHistoricos += def.puntos;
  const titulo = `Desafío: ${def.titulo}`;
  state.history.unshift({ mes: monthLabel(), titulo, fecha: 'Ahora mismo', puntos: def.puntos });
  await saveProgress({ titulo, puntos: def.puntos, tipo: 'desafio' });
  return 'ok';
}

async function doRefresh() {
  const sb = getClient();
  const semana = weekStartColombia();
  let reciclajes, referidos, claimed;

  if (sb && state.session) {
    const id = state.session.userId;
    const r1 = await sb.from('movimientos').select('id', { count: 'exact', head: true })
      .eq('user_id', id).eq('tipo', 'reciclaje').gte('created_at', semana.iso);
    const r2 = await sb.rpc('contar_referidos');
    const r3 = await sb.from('desafios_completados').select('desafio_id,periodo')
      .eq('user_id', id).in('periodo', [semana.key, UNICO_KEY]);
    if (r1.error || r2.error || r3.error) {
      console.error('Desafíos:', r1.error || r2.error || r3.error);
      return [];
    }
    reciclajes = r1.count || 0;
    referidos = r2.data || 0;
    claimed = new Set(r3.data.map((r) => r.desafio_id));
  } else { // modo demo
    reciclajes = state.local.recycles;
    referidos = state.local.referidos;
    claimed = new Set(state.local.claimed);
  }

  const cobrados = [];
  for (const def of CHALLENGES) {
    const cuenta = def.tipo === 'reciclaje' ? reciclajes : referidos;
    if (cuenta < def.meta || claimed.has(def.id)) continue;
    const res = await claim(def, def.periodo === 'semanal' ? semana.key : UNICO_KEY);
    if (res === 'ok') cobrados.push(def);
    if (res !== 'error') claimed.add(def.id); // si falló, se reintenta la próxima vez
  }

  state.challenges = buildChallenges(reciclajes, referidos, claimed);
  emitChange();

  if (cobrados.length) {
    const total = cobrados.reduce((s, d) => s + d.puntos, 0);
    showToast(`🏆 ¡Desafío completado! ${cobrados.map((d) => d.titulo).join(' · ')} (+${total} pts)`);
  }
  return cobrados;
}

// Se ejecutan de una en una para que nunca se cobre dos veces el mismo desafío
let cola = Promise.resolve();
export function refreshChallenges() {
  const p = cola.then(doRefresh);
  cola = p.catch((err) => console.error('Desafíos:', err));
  return p;
}
