import { state } from '../store.js';
import { switchTab } from '../router.js';
import { showToast } from '../utils/ui.js';
import { isSupabaseConfigured } from '../config.js';
import { signIn, signUp, friendlyError } from '../services/auth.js';

export function AuthScreen() {
  return /* html */ `
<section class="screen full-screen" id="screen-auth">
  <div class="auth-header">
    <button class="icon-btn" onclick="goScreen('screen-welcome')">←</button>
    <div>
      <h2 style="font-size:18px; font-weight:900;">Acceso Estudiantil</h2>
      <p style="font-size:12px; color:var(--text-muted);">Supabase Auth · Unicórdoba</p>
    </div>
  </div>

  <div class="auth-box">
    <div class="tabs-pill">
      <button class="tab-pill-btn active" id="tab-login" onclick="switchAuthTab('login')">Iniciar sesión</button>
      <button class="tab-pill-btn" id="tab-register" onclick="switchAuthTab('register')">Registrarse</button>
    </div>

    <form id="form-login" onsubmit="handleLogin(event)">
      <div class="form-group">
        <label>Correo institucional o personal</label>
        <input type="email" id="login-email" placeholder="tucorreo@correo.unicordoba.edu.co" autocomplete="email" required>
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="login-pass" placeholder="Tu contraseña" autocomplete="current-password" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">Ingresar al Campus</button>
    </form>

    <form id="form-register" style="display:none;" onsubmit="handleRegister(event)">
      <div class="form-group">
        <label>Nombre completo</label>
        <input type="text" id="reg-name" placeholder="Ej: Mateo Vergara" required>
      </div>
      <div class="form-group">
        <label>Usuario</label>
        <input type="text" id="reg-user" placeholder="Ej: mateo_eco" required>
      </div>
      <div class="form-group">
        <label>Correo electrónico</label>
        <input type="email" id="reg-email" placeholder="mateo@correo.unicordoba.edu.co" required>
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="reg-pass" placeholder="Mínimo 6 caracteres" minlength="6" autocomplete="new-password" required>
      </div>
      <div class="form-group">
        <label>Código de referido (Opcional · Prueba: SOFIA-UNICOR)</label>
        <input type="text" id="reg-ref" placeholder="SOFIA-UNICOR">
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:6px;">Crear cuenta (+100 pts)</button>
    </form>
  </div>
</section>
`;
}

export function switchAuthTab(mode) {
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-register').classList.toggle('active', mode === 'register');
  document.getElementById('form-login').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = mode === 'register' ? 'block' : 'none';
}

function setBusy(form, busy) {
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = busy;
  btn.style.opacity = busy ? '0.6' : '1';
}

function requireSupabase() {
  if (isSupabaseConfigured) return true;
  showToast('Supabase aún no está configurado (js/config.js). Usa "Entrar como Demo".', true);
  return false;
}

export async function handleLogin(e) {
  e.preventDefault();
  if (!requireSupabase()) return;
  const form = e.target;
  setBusy(form, true);
  try {
    await signIn(
      document.getElementById('login-email').value.trim(),
      document.getElementById('login-pass').value
    );
    switchTab('screen-home');
    showToast('✅ Sesión iniciada en EcoPuntos Unicórdoba');
  } catch (err) {
    showToast('❌ ' + friendlyError(err), true);
  } finally {
    setBusy(form, false);
  }
}

export async function handleRegister(e) {
  e.preventDefault();
  if (!requireSupabase()) return;
  const form = e.target;
  setBusy(form, true);
  try {
    const result = await signUp({
      nombre: document.getElementById('reg-name').value.trim(),
      usuario: document.getElementById('reg-user').value.trim().replace('@', ''),
      correo: document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-pass').value,
      ref: document.getElementById('reg-ref').value.trim().toUpperCase()
    });
    if (result.needsConfirmation) {
      showToast('📩 Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
      switchAuthTab('login');
      return;
    }
    switchTab('screen-home');
    showToast(state.user.doublePoints
      ? '🎉 +100 pts de bienvenida y Puntos x2 activados por referido'
      : '🎉 ¡Registro exitoso! Recibiste +100 EcoPuntos de bienvenida');
  } catch (err) {
    showToast('❌ ' + friendlyError(err), true);
  } finally {
    setBusy(form, false);
  }
}
