// Reglas del escaneo.
export const VENTANA_MIN = 5;   // minutos para escanear los QR y reclamar, desde el primer QR
export const ESPERA_MIN = 30;   // minutos de espera por material (en todo el campus)

export const VENTANA_MS = VENTANA_MIN * 60 * 1000;
export const ESPERA_MS = ESPERA_MIN * 60 * 1000;
