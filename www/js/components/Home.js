import { state } from '../store.js';
import { getLevelInfo } from '../utils/level.js';
import { ChallengeCard } from './cards/ChallengeCard.js';

export function HomeScreen() {
  return /* html */ `
<section class="screen" id="screen-home">
  <div class="home-header">
    <div>
      <div class="greeting-sub">📍 Campus Unicórdoba · Montería</div>
      <h2 class="greeting-title" id="home-greeting">¡Hola, Sofía!</h2>
    </div>
    <div class="header-actions">
      <button class="icon-btn" onclick="toggleDarkMode()" title="Modo oscuro">🌓</button>
      <button class="icon-btn notif-dot" onclick="openNotifications()" title="Notificaciones">🔔</button>
    </div>
  </div>

  <div class="section-pad">
    <!-- Tarjeta Verde Hero -->
    <div class="hero-points-card">
      <div class="points-top">
        <div>
          <div class="points-label">Tus EcoPuntos</div>
          <div class="points-value" id="home-points">1,250</div>
        </div>
        <div class="level-badge" id="home-level-badge">🌿 Nivel 7 · Guardián del Campus</div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="home-level-bar" style="width: 80%;"></div>
      </div>
      <div class="progress-caption">
        <span id="home-level-range">200 pts</span>
        <span id="home-level-next">20 pts para Nivel 8</span>
      </div>
    </div>

    <!-- Widget Impacto Universitario -->
    <div class="campus-impact-strip">
      <div class="impact-pill-card">
        <strong id="home-level-num">Nivel 7</strong>
        <span id="home-level-name">Guardián del Campus</span>
      </div>
      <div class="impact-pill-card">
        <strong id="home-recycles">32</strong>
        <span>Reciclajes</span>
      </div>
    </div>

    <!-- Cuatro Accesos Rápidos -->
    <div class="quick-grid">
      <div class="quick-item" onclick="switchTab('screen-scan')">
        <div class="quick-icon">📷</div>
        <span>Escanear QR</span>
      </div>
      <div class="quick-item" onclick="switchTab('screen-map')">
        <div class="quick-icon">🗺️</div>
        <span>Puntos campus</span>
      </div>
      <div class="quick-item" onclick="goScreen('screen-history')">
        <div class="quick-icon">📜</div>
        <span>Historial</span>
      </div>
      <div class="quick-item" onclick="openReferralModal()">
        <div class="quick-icon">🎁</div>
        <span>Invitar amigos</span>
      </div>
    </div>

    <!-- Banner -->
    <div class="promo-banner">
      <div>
        <h4>¡Recicla más, gana más!</h4>
        <p>Puntos dobles hoy en Plazoleta El Ágora</p>
      </div>
      <span style="font-size:26px;">♻️</span>
    </div>

    <!-- Desafíos Activos -->
    <div class="sec-head">
      <h3>Desafíos activos</h3>
      <button class="sec-link" onclick="goScreen('screen-challenges')">Ver todos →</button>
    </div>
    <div id="home-challenges-list"></div>
  </div>
</section>
`;
}

export function renderHome() {
  const u = state.user;
  const lvl = getLevelInfo(u.puntosHistoricos);
  const pct = lvl.next === null
    ? 100
    : Math.min(100, Math.max(6, Math.round(((u.puntosHistoricos - lvl.min) / (lvl.next - lvl.min)) * 100)));

  document.getElementById('home-greeting').textContent = `¡Hola, ${u.nombre.split(' ')[0]}!`;
  document.getElementById('home-points').textContent = u.puntos.toLocaleString('es-CO');
  document.getElementById('home-level-badge').textContent = `🌿 ${lvl.title}`;
  document.getElementById('home-level-bar').style.width = pct + '%';
  document.getElementById('home-level-range').textContent = `${lvl.min.toLocaleString('es-CO')} pts`;
  document.getElementById('home-level-next').textContent = lvl.nextLabel;
  document.getElementById('home-level-num').textContent = `Nivel ${lvl.nivel}`;
  document.getElementById('home-level-name').textContent = lvl.nombre;
  document.getElementById('home-recycles').textContent = u.reciclajesTotales;

  const active = state.challenges.filter((c) => !c.completado).slice(0, 2);
  document.getElementById('home-challenges-list').innerHTML =
    active.map((c) => ChallengeCard(c, 'home')).join('');
}
