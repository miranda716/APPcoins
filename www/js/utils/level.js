import { LEVELS } from '../data/levels.js';

/** Recibe los puntos HISTÓRICOS y devuelve el nivel actual y lo que falta para el siguiente. */
export function getLevelInfo(puntosHistoricos) {
  let i = 0;
  LEVELS.forEach((l, idx) => { if (puntosHistoricos >= l.desde) i = idx; });
  const actual = LEVELS[i];
  const sig = LEVELS[i + 1] || null;
  return {
    nivel: actual.nivel,
    nombre: actual.nombre,
    title: `Nivel ${actual.nivel} · ${actual.nombre}`,
    min: actual.desde,
    next: sig ? sig.desde : null,
    nextLabel: sig ? `${sig.desde - puntosHistoricos} pts para Nivel ${sig.nivel}` : '¡Nivel máximo!'
  };
}
