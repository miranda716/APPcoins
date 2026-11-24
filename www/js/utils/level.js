// Niveles según EcoPuntos acumulados.

export function getLevelInfo(pts) {
  if (pts >= 2000) {
    return { title: 'Nivel 6 · Guardián del Sinú', min: 2000, next: 3000, nextLabel: `${3000 - pts} pts para Nivel 7` };
  }
  if (pts >= 1000) {
    return { title: 'Nivel 5 · EcoGuerrero', min: 1000, next: 2000, nextLabel: `${2000 - pts} pts para Nivel 6` };
  }
  return { title: 'Nivel 1 · Semilla Verde', min: 0, next: 1000, nextLabel: `${1000 - pts} pts para Nivel 5` };
}
