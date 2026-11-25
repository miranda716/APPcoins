// Desafíos.
//  · "semanal": se cuentan los reciclajes de la semana actual (lunes 00:00, hora de Colombia)
//               y se reinician solos cada semana.
//  · "unico"  : se gana una sola vez en la vida (invitar compañeros).
export const UNICO_KEY = '2000-01-01'; // "periodo" que se guarda en la base para los desafíos únicos

export const CHALLENGES = [
  { id: 'rec-1',  titulo: 'Recicla 1 vez esta semana',   meta: 1,  puntos: 20,  tipo: 'reciclaje', periodo: 'semanal' },
  { id: 'rec-3',  titulo: 'Recicla 3 veces esta semana', meta: 3,  puntos: 60,  tipo: 'reciclaje', periodo: 'semanal' },
  { id: 'rec-5',  titulo: 'Recicla 5 veces esta semana', meta: 5,  puntos: 120, tipo: 'reciclaje', periodo: 'semanal' },
  { id: 'inv-1',  titulo: 'Invita a 1 compañero',        meta: 1,  puntos: 50,  tipo: 'referido',  periodo: 'unico' },
  { id: 'inv-3',  titulo: 'Invita a 3 compañeros',       meta: 3,  puntos: 150, tipo: 'referido',  periodo: 'unico' },
  { id: 'inv-10', titulo: 'Invita a 10 compañeros',      meta: 10, puntos: 500, tipo: 'referido',  periodo: 'unico' }
];

/** Une la definición con el progreso actual. claimed = Set de ids ya cobrados. */
export function buildChallenges(reciclajesSemana, referidos, claimed) {
  return CHALLENGES.map((def) => {
    const cuenta = def.tipo === 'reciclaje' ? reciclajesSemana : referidos;
    return { ...def, progreso: Math.min(cuenta, def.meta), completado: claimed.has(def.id) };
  });
}
