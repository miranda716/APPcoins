// Espera de 30 minutos por material (vale en todo el campus).
// Se guarda en memoria al reclamar y, con Supabase, se recupera de los movimientos recientes
// (así sigue valiendo si recargas la página o cambias de celular).
import { state } from '../store.js';
import { getClient } from './supabase.js';
import { ESPERA_MS } from '../data/rules.js';

export async function cargarEsperas() {
  const sb = getClient();
  if (!sb || !state.session) return;
  const desde = new Date(Date.now() - ESPERA_MS).toISOString();
  const { data, error } = await sb.from('movimientos').select('created_at,materiales')
    .eq('user_id', state.session.userId).eq('tipo', 'reciclaje').gte('created_at', desde);
  if (error) { console.warn('No se pudieron leer las esperas:', error.message); return; }
  for (const fila of data || []) {
    const t = new Date(fila.created_at).getTime();
    for (const m of fila.materiales || []) {
      if (!(state.cooldowns[m] > t)) state.cooldowns[m] = t;
    }
  }
}

/** Milisegundos que faltan para poder volver a reclamar ese material (0 = disponible). */
export function esperaRestanteMs(material) {
  const t = state.cooldowns[material];
  return t ? Math.max(0, ESPERA_MS - (Date.now() - t)) : 0;
}
