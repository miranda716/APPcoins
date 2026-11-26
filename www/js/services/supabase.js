// Cliente de Supabase. Se carga por CDN solo si config.js tiene tus datos,
// así la app sigue funcionando en modo demo aunque falle o no esté configurado.
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../config.js';

let client = null;

export async function initSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('No se pudo cargar Supabase:', err);
  }
  return client;
}

export const getClient = () => client;
