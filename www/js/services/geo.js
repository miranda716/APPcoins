// GPS del dispositivo (navigator.geolocation) y cálculo de distancias.
import { state } from '../store.js';

const listeners = new Set();
let watchId = null;

/** Registra una función que se llama cada vez que cambia la posición. */
export function onPosition(fn) {
  listeners.add(fn);
}

export function startLocationWatch() {
  if (watchId !== null || !('geolocation' in navigator)) return;
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      state.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
      state.gpsError = null;
      listeners.forEach((fn) => fn(state.userPos));
    },
    (err) => {
      state.gpsError = err.code === 1 ? 'Permiso de ubicación denegado' : 'No se pudo obtener tu ubicación';
      listeners.forEach((fn) => fn(null));
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
  );
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
