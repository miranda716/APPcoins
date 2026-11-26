// Formato del QR pegado en cada caneca:   ECOPUNTOS:<codigoQR del punto>:<material>
// Ejemplo:                                ECOPUNTOS:UNICOR-AGORA-03:plastico
import { MATERIALS } from '../data/materials.js';

export const QR_PREFIX = 'ECOPUNTOS';

export function buildQR(point, materialKey) {
  return `${QR_PREFIX}:${point.codigoQR}:${materialKey}`;
}

/** Devuelve { point, key, material } o null si el QR no es válido. */
export function parseQR(text, points) {
  const parts = String(text).trim().split(':');
  if (parts.length !== 3 || parts[0].toUpperCase() !== QR_PREFIX) return null;

  const point = points.find((p) => p.codigoQR.toUpperCase() === parts[1].toUpperCase());
  const key = parts[2].toLowerCase();
  const material = MATERIALS[key];
  if (!point || !material) return null;
  if (point.tipo !== 'reciclaje' || !point.materiales.includes(material.label)) return null;

  return { point, key, material };
}
