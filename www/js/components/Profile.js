import { state, emitChange } from '../store.js';
import { getLevelInfo } from '../utils/level.js';
import { goScreen } from '../router.js';
import { showToast } from '../utils/ui.js';
import { signOut } from '../services/auth.js';

export function ProfileScreen() {
  return /* html */ `
<section class="screen" id="screen-profile">
  <div class="home-header">
    <h2 class="greeting-title">Mi Perfil</h2>
    <button class="icon-btn" onclick="shareAchievement()">📤</button>
  </div>

  <div class="section-pad">
    <div class="card" style="text-align:center; padding:20px;">
      <div style="width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#1F6B34,#8BC34A); color:#FFF; font-size:28px; font-weight:900; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
          <span id="prof-avatar">S</span>
      </div>
      <h3 id="prof-name" style="font-size:19px; font-weight:900;">Sofía Martínez</h3>
      <p id="prof-handle" style="font-size:13px; color:var(--text-muted); font-weight:700;">@sofia_unicordoba · Ing. Ambiental</p>
      <div class="reward-chip" id="prof-level" style="display:inline-block; margin-top:8px;">Nivel 5 · EcoGuerrero</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid var(--border);">
        <div>
          <strong id="prof-co2" style="font-size:20px; color:var(--primary); display:block;">18.4 kg</strong>
          <span style="font-size:12px; color:var(--text-muted); font-weight:700;">CO₂ evitado</span>
        </div>
        <div>
          <strong id="prof-recycles" style="font-size:20px; color:var(--primary); display:block;">32</strong>
          <span style="font-size:12px; color:var(--text-muted); font-weight:700;">Reciclajes totales</span>
        </div>
      </div>
    </div>

    <div class="menu-row" onclick="showToast('📊 Has evitado 18.4 kg de CO₂, equivalente a plantar 2 árboles en el campus.')">
      <span>📊 Mis estadísticas</span><span>›</span>
    </div>
    <div class="menu-row" onclick="shareAchievement()">
      <span>🏅 Mis logros (Compartir)</span><span>›</span>
    </div>
    <div class="menu-row" onclick="openReferralModal()">
      <span>🤝 Código de referido: <span id="prof-ref">SOFIA-UNICOR</span></span><span>›</span>
    </div>
    <div class="menu-row" onclick="openReferralInput()">
      <span>🎟️ Ingresar código de quien me invitó</span><span>›</span>
    </div>
    <div class="menu-row" onclick="openNotifications()">
      <span>🔔 Notificaciones inteligentes</span><span>›</span>
    </div>
    <div class="menu-row" onclick="showToast('💬 Soporte EcoPuntos Unicórdoba: Bloque Administrativo, Oficina Verde.')">
      <span>❓ Ayuda y soporte</span><span>›</span>
    </div>
    <div class="menu-row" style="color:var(--danger);" onclick="logout()">
      <span>🚪 Cerrar sesión</span><span>›</span>
    </div>
  </div>
</section>
`;
}

export function renderProfile() {
  const u = state.user;
  document.getElementById('prof-name').textContent = u.nombre;
  document.getElementById('prof-avatar').textContent = u.nombre.charAt(0).toUpperCase();
  document.getElementById('prof-handle').textContent = `@${u.usuario} · Campus Unicórdoba`;
  document.getElementById('prof-level').textContent = getLevelInfo(u.puntos).title;
  document.getElementById('prof-co2').textContent = `${u.co2Total.toFixed(1)} kg`;
  document.getElementById('prof-recycles').textContent = u.reciclajesTotales;
  document.getElementById('prof-ref').textContent = u.codigoReferido;
}

export async function logout() {
  try {
    await signOut();
  } catch (err) {
    console.error(err);
  }
  goScreen('screen-welcome');
  emitChange();
  showToast('Sesión cerrada');
}

export function shareAchievement() {
  const u = state.user;
  const text = `¡Soy ${getLevelInfo(u.puntos).title} en Unicórdoba con ${u.co2Total.toFixed(1)} kg de CO₂ evitados! 🌿`;
  if (navigator.share) {
    navigator.share({ title: 'EcoPuntos Unicórdoba', text }).catch(() => {});
  } else {
    showToast('🌿 ' + text);
  }
}
