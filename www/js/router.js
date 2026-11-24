// Navegación entre pantallas.
import { emitChange } from './store.js';

// Pantallas donde NO se muestra la barra inferior
const HIDE_NAV = ['screen-welcome', 'screen-auth'];

export function goScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('bottom-nav').classList.toggle('visible', !HIDE_NAV.includes(id));
}

export function switchTab(id) {
  goScreen(id);
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.target === id);
  });
  emitChange();
}
