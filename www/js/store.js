import { buildChallenges } from './data/challenges.js';

// Estado global de la app + mini sistema de suscripción para re-renderizar.
// TODO: conectar con Firebase Auth / Firestore.

export const state = {
  session: null,      // { userId } cuando hay login con Supabase; null = modo demo
  userPos: null,      // { lat, lng, accuracy } del GPS
  gpsError: null,
  user: {
    nombre: 'Sofía Martínez',
    usuario: 'sofia_unicordoba',
    correo: 'sofia.ambiental@correo.unicordoba.edu.co',
    puntos: 250,             // saldo: sube al reciclar, baja al canjear
    puntosHistoricos: 280,   // solo sube; define el NIVEL
    reciclajesTotales: 32,
    codigoReferido: 'SOFIA-UNICOR',
    doublePoints: false,
    referidoPor: null
  },
  selectedPointId: 'pt-agora',
  mapFilter: 'Todos',
  rewardFilter: 'Todas',
  challengeTab: 'active',
  lastScanByPoint: {},
  flashOn: false,
  // Contadores del modo demo (con Supabase el progreso se calcula desde la base)
  local: {
    recycles: 4, referidos: 1, claimed: ['rec-1', 'rec-3', 'inv-1'],
    // estadísticas de ejemplo: reciclajes por día (Lun–Sáb) y mes con aporte (Ene–Dic)
    weekCounts: [1, 2, 1, 0, 0, 0],
    monthFlags: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    monthCount: 6
  },
  stats: null,
  challenges: [],
  history: [
    { mes: 'Noviembre 2026', titulo: 'Plástico · Edificio de Postgrados', fecha: 'Hoy, 10:15 AM', puntos: 50 },
    { mes: 'Noviembre 2026', titulo: 'Canje: Descuento 15% Cafetería Central', fecha: 'Ayer, 1:20 PM', puntos: -200 },
    { mes: 'Noviembre 2026', titulo: 'Papel · Biblioteca Central', fecha: '19 Nov, 4:05 PM', puntos: 30 },
    { mes: 'Octubre 2026', titulo: 'Vidrio · Bloque 11 Bioclimático', fecha: '28 Oct, 11:40 AM', puntos: 40 }
  ]
};

state.challenges = buildChallenges(state.local.recycles, state.local.referidos, new Set(state.local.claimed));

// Copia del estado inicial (usuario demo) para volver a él al cerrar sesión
const initial = structuredClone({
  user: state.user, history: state.history, challenges: state.challenges, local: state.local
});

export function resetState() {
  const fresh = structuredClone(initial);
  state.session = null;
  state.user = fresh.user;
  state.history = fresh.history;
  state.challenges = fresh.challenges;
  state.local = fresh.local;
  state.lastScanByPoint = {};
}

const listeners = new Set();

/** Registra una función que se ejecuta cada vez que cambia el estado. */
export function subscribe(fn) {
  listeners.add(fn);
}

/** Avisa que el estado cambió para que la UI se vuelva a dibujar. */
export function emitChange() {
  listeners.forEach((fn) => fn());
}
