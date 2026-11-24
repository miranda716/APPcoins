const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Noviembre 2026" */
export function monthLabel(date = new Date()) {
  return cap(date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }));
}

/** "24 nov, 3:05 p. m." */
export function dateLabel(date) {
  return date.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
