// Registro, login, sesión y carga del perfil desde Supabase.
import { state, resetState } from '../store.js';
import { getClient } from './supabase.js';
import { monthLabel, dateLabel } from '../utils/date.js';
import { refreshChallenges } from './challenges.js';

const ERRORES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Ese correo ya está registrado.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'Database error saving new user': 'Ese usuario ya existe. Prueba con otro.',
  'ya_tiene_referido': 'Ya registraste un código de referido.',
  'codigo_propio': 'No puedes usar tu propio código.',
  'codigo_invalido': 'Ese código no existe.'
};

export function friendlyError(err) {
  const msg = err?.message || String(err);
  const key = Object.keys(ERRORES).find((k) => msg.includes(k));
  return key ? ERRORES[key] : msg;
}

export async function loadUserData(user) {
  const sb = getClient();
  state.session = { userId: user.id };

  const { data: p, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;

  state.user = {
    nombre: p.nombre,
    usuario: p.usuario,
    correo: user.email,
    puntos: p.puntos,
    puntosHistoricos: p.puntos_historicos,
    reciclajesTotales: p.reciclajes_totales,
    codigoReferido: p.codigo_referido,
    doublePoints: p.double_points,
    referidoPor: p.referido_por,
    avatarUrl: p.avatar_url || null   // si la columna aún no existe, queda null y todo sigue funcionando
  };

  const { data: movs } = await sb
    .from('movimientos').select('titulo,puntos,created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);

  state.history = (movs || []).map((m) => {
    const d = new Date(m.created_at);
    return { mes: monthLabel(d), titulo: m.titulo, fecha: dateLabel(d), puntos: m.puntos };
  });

  await refreshChallenges(); // calcula el progreso semanal y cobra lo pendiente
}

/** Si ya había sesión guardada en el navegador, la recupera. */
export async function restoreSession() {
  const sb = getClient();
  if (!sb) return false;
  const { data } = await sb.auth.getSession();
  if (!data.session) return false;
  await loadUserData(data.session.user);
  return true;
}

export async function signIn(email, password) {
  const sb = getClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await loadUserData(data.user);
}

export async function signUp({ nombre, usuario, correo, password, ref }) {
  const sb = getClient();
  const { data, error } = await sb.auth.signUp({
    email: correo,
    password,
    options: {
      data: { nombre, usuario, ref },
      emailRedirectTo: location.origin + location.pathname
    }
  });
  if (error) throw error;
  // Si el proyecto exige confirmar correo, todavía no hay sesión
  if (!data.session) return { needsConfirmation: true };
  await loadUserData(data.user);
  return { needsConfirmation: false };
}

export async function signOut() {
  const sb = getClient();
  if (sb) await sb.auth.signOut();
  resetState();
}
