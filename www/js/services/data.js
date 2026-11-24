// Guarda puntos y movimientos en Supabase (si hay sesión; en modo demo no hace nada).
// ⚠️ Los puntos se calculan en el navegador. Para producción conviene moverlo
//    a una función RPC / Edge Function de Supabase para evitar trampas.
import { state } from '../store.js';
import { getClient } from './supabase.js';
import { showToast } from '../utils/ui.js';

export async function saveProgress(movimiento) {
  const sb = getClient();
  if (!sb || !state.session) return;
  const u = state.user;
  const id = state.session.userId;

  const { error } = await sb.from('profiles').update({
    puntos: u.puntos,
    co2_total: u.co2Total,
    reciclajes_totales: u.reciclajesTotales,
    double_points: u.doublePoints
  }).eq('id', id);

  let error2 = null;
  if (movimiento) {
    ({ error: error2 } = await sb.from('movimientos').insert({
      user_id: id, titulo: movimiento.titulo, puntos: movimiento.puntos
    }));
  }
  if (error || error2) {
    console.error(error || error2);
    showToast('⚠️ No se pudo guardar en la nube', true);
  }
}

/** Registra el código de quien te invitó (una sola vez). Lanza error si no es válido. */
export async function applyReferral(code) {
  const sb = getClient();
  const c = code.trim().toUpperCase();
  if (!c) throw new Error('Escribe un código.');

  if (sb && state.session) {
    const { error } = await sb.rpc('canjear_referido', { p_codigo: c });
    if (error) throw error;
  } else if (c !== 'SOFIA-UNICOR') {   // modo demo: solo existe este código
    throw new Error('codigo_invalido');
  } else if (state.user.referidoPor) {
    throw new Error('ya_tiene_referido');
  }
  state.user.referidoPor = c;
  state.user.doublePoints = true;
}
