// GPS del dispositivo (navigator.geolocation) y cálculo de distancias.
import { state } from '../store.js';

const listeners = new Set();
let watchId = null;

/** Registra una función que se llama cada vez que cambia la posición. */
export function onPosition(fn) {
  listeners.add(fn);
}

function publish(pos) {
  state.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
  state.gpsError = null;
  listeners.forEach((fn) => fn(state.userPos));
}

function fail(err) {
  const motivos = {
    1: 'Permiso de ubicación denegado',
    2: 'Tu dispositivo no pudo calcular la ubicación (activa los servicios de ubicación)',
    3: 'Se agotó el tiempo buscando tu ubicación'
  };
  state.gpsError = motivos[err.code] || 'No se pudo obtener tu ubicación';
  listeners.forEach((fn) => fn(null));
}

function watch(highAccuracy) {
  watchId = navigator.geolocation.watchPosition(
    publish,
    (err) => {
      // En computadores el modo "alta precisión" suele fallar: reintenta en modo normal
      if (highAccuracy && err.code !== 1) {
        navigator.geolocation.clearWatch(watchId);
        watch(false);
        return;
      }
      fail(err);
    },
    { enableHighAccuracy: highAccuracy, maximumAge: 10000, timeout: highAccuracy ? 10000 : 30000 }
  );
}

export function startLocationWatch() {
  if (watchId !== null) return;
  if (!('geolocation' in navigator)) {
    state.gpsError = 'Este navegador no soporta ubicación';
    return;
  }
  watch(true);
}

/** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
export function haversine(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceToPoint(p) {
  return state.userPos ? haversine(state.userPos, { lat: p.lat, lng: p.lng }) : null;
}

export function formatDistance(m) {
  if (m === null || m === undefined) return '—';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}
