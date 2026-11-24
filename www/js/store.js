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
    puntos: 1250,
    co2Total: 18.4,
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
  challenges: [
    { id: 'ch-1', titulo: 'Recicla 5 veces esta semana', meta: 5, progreso: 4, puntos: 100, tipo: 'reciclaje', completado: false },
    { id: 'ch-2', titulo: 'Visita 3 comercios del campus', meta: 3, progreso: 2, puntos: 80, tipo: 'comercio', completado: false },
    { id: 'ch-3', titulo: 'Invita a 3 compañeros Unicórdoba', meta: 3, progreso: 1, puntos: 150, tipo: 'referido', completado: false },
    { id: 'ch-4', titulo: 'Primer reciclaje en Plazoleta El Ágora', meta: 1, progreso: 1, puntos: 60, tipo: 'reciclaje', completado: true }
  ],
  history: [
    { mes: 'Noviembre 2026', titulo: 'Plástico · Plazoleta El Ágora', fecha: 'Hoy, 10:15 AM', puntos: 50 },
    { mes: 'Noviembre 2026', titulo: 'Canje: Descuento 15% Cafetería Central', fecha: 'Ayer, 1:20 PM', puntos: -200 },
    { mes: 'Noviembre 2026', titulo: 'Papel · Biblioteca Central', fecha: '19 Nov, 4:05 PM', puntos: 30 },
    { mes: 'Octubre 2026', titulo: 'Vidrio · Bloque Ingenierías', fecha: '28 Oct, 11:40 AM', puntos: 40 }
  ]
};

// Copia del estado inicial (usuario demo) para volver a él al cerrar sesión
const initial = structuredClone({
  user: state.user, history: state.history, challenges: state.challenges
});

export function resetState() {
  const fresh = structuredClone(initial);
  state.session = null;
  state.user = fresh.user;
  state.history = fresh.history;
  state.challenges = fresh.challenges;
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
