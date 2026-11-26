// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN  (aquí pegas tus datos de Supabase)
//  Supabase → Project Settings → API
// ─────────────────────────────────────────────────────────────

// Project URL
export const SUPABASE_URL = 'https://cyyarfcgqkubyhlnqoht.supabase.co';

// Clave "anon" / "publishable" (es PÚBLICA por diseño: la seguridad la da RLS).
// ⚠️ NUNCA pegues aquí la clave "service_role" ni "secret".
export const SUPABASE_ANON_KEY = 'sb_publishable_M5A6m2VomP6Gsh5ij5lftg_IcqTPhe8';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('TU-PROYECTO') &&
  SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes('TU_ANON_KEY');

// Distancia máxima (metros) para poder registrar un reciclaje.
export const MAX_SCAN_DISTANCE_M = 100;

// false = en pruebas NO se bloquea el escaneo si estás lejos del campus.
// true  = se exige estar a menos de MAX_SCAN_DISTANCE_M del punto (producción).
export const GPS_STRICT = false;

// true  = muestra el panel "Simulador de escaneo" (útil para probar sin QR).
// false = oculta el simulador (producción: solo se gana puntos escaneando QR reales).
export const DEV_SIMULATOR = true;
