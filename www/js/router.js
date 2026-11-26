// Navegación entre pantallas.
import { emitChange } from './store.js';

// Pantallas donde NO se muestra la barra inferior
const HIDE_NAV = ['screen-welcome', 'screen-auth'];

// Funciones que se ejecutan al entrar a una pantalla
const enterHooks = {};
export function onEnter(id, fn) {
  (enterHooks[id] = enterHooks[id] || []).push(fn);
}

export function goScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('bottom-nav').classList.toggle('visible', !HIDE_NAV.includes(id));
  (enterHooks[id] || []).forEach((fn) => fn());
}

export function switchTab(id) {
  goScreen(id);
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.target === id);
  });
  emitChange();
}
