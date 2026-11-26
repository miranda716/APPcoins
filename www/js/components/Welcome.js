import { switchTab, goScreen } from '../router.js';
import { showToast } from '../utils/ui.js';
import { switchAuthTab } from './Auth.js';

export function WelcomeScreen() {
  return /* html */ `
<section class="screen full-screen active" id="screen-welcome">
  <div class="botanical-orb orb-1"></div>
  <div class="botanical-orb orb-2"></div>

  <div class="campus-pill">
    <span>🌿</span> Campus Universidad de Córdoba · Montería
  </div>

  <div class="logo-hero">
    <div class="leaf-badge">
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#102B17" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    </div>
    <h1 class="app-title">EcoPuntos</h1>
    <p class="app-slogan">Tu impacto, tus puntos, un mundo mejor.</p>
  </div>

  <div class="welcome-glass-card">
    <h2>Recicla hoy, transforma mañana.</h2>
    <p>Conecta con los puntos ecológicos de las facultades y canjea recompensas en cafeterías y aliados del campus.</p>
    <div class="welcome-stats-mini">
      <div><strong>7 Puntos</strong><span>En el campus</span></div>
      <div><strong>+100 pts</strong><span>Bono registro</span></div>
      <div><strong>x2 Puntos</strong><span>Con referido</span></div>
    </div>
  </div>

  <div class="welcome-actions">
    <button class="btn btn-lime" onclick="loginDemo()">
      Entrar como Demo (Sofía · Nivel 5)
    </button>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
      <button class="btn btn-outline-light" onclick="openAuth('login')">Iniciar sesión</button>
      <button class="btn btn-outline-light" onclick="openAuth('register')">Registrarse</button>
    </div>
  </div>
</section>
`;
}

export function loginDemo() {
  switchTab('screen-home');
  showToast('🌿 ¡Bienvenida al Campus Unicórdoba, Sofía!');
}

export function openAuth(mode) {
  goScreen('screen-auth');
  switchAuthTab(mode);
}
