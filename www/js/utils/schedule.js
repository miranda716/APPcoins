// Horario único de los puntos ecológicos: lunes a sábado, 6:00 a. m. a 9:00 p. m. (hora de Colombia).
const CO_OFFSET_MS = 5 * 3600 * 1000;

export const HORARIO_TEXTO = 'Lun - Sáb · 6:00 AM - 9:00 PM';

export function estaAbierto(now = new Date()) {
  const l = new Date(now.getTime() - CO_OFFSET_MS); // reloj de Colombia (se lee con getUTC*)
  const dia = l.getUTCDay();                         // 0 = domingo
  const hora = l.getUTCHours() + l.getUTCMinutes() / 60;
  return dia !== 0 && hora >= 6 && hora < 21;
}
