// Modales de contenido fijo: notificaciones y referidos.
import { state } from '../store.js';
import { openModal, closeModal, showToast } from '../utils/ui.js';
import { emitChange } from '../store.js';
import { applyReferral } from '../services/data.js';
import { friendlyError } from '../services/auth.js';

export function openNotifications() {
  openModal(`
    <h3 style="font-size:18px; font-weight:900; margin-bottom:12px;">🔔 Notificaciones Inteligentes</h3>
    <div style="text-align:left; display:flex; flex-direction:column; gap:10px; font-size:13px;">
      <div style="background:var(--bg); padding:10px; border-radius:12px;">
        <strong>⏳ Desafío por vencer</strong>
        <p style="font-size:12px; color:var(--text-muted);">Te falta 1 reciclaje para ganar +100 pts esta semana.</p>
      </div>
      <div style="background:var(--bg); padding:10px; border-radius:12px;">
        <strong>🎁 Recompensa alcanzable</strong>
        <p style="font-size:12px; color:var(--text-muted);">Ya te alcanza para un Descuento 15% en Cafetería Central.</p>
      </div>
      <div style="background:var(--bg); padding:10px; border-radius:12px;">
        <strong>📍 Punto cercano en el campus</strong>
        <p style="font-size:12px; color:var(--text-muted);">Estás a 18m del Punto Central Plazoleta El Ágora.</p>
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%; margin-top:14px;" onclick="closeModal()">Cerrar</button>
  `);
}

export function openReferralModal() {
  openModal(`
    <div style="font-size:38px;">🤝</div>
    <h3 style="font-size:18px; font-weight:900; margin-top:6px;">Invita a tus compañeros</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
      Ambos reciben <strong>Puntos Dobles</strong> cuando tu invitado haga su primer reciclaje en Unicórdoba.
    </p>
    <div style="background:var(--bg); border:1.5px dashed var(--primary); padding:12px; border-radius:14px; font-weight:900; font-size:16px; margin:14px 0;">
      ${state.user.codigoReferido}
    </div>
    <button class="btn btn-primary" style="width:100%;" onclick="copyReferral()">Copiar código y compartir</button>
  `);
}

export function copyReferral() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(state.user.codigoReferido).catch(() => {});
  }
  closeModal();
  showToast('📋 Código de referido copiado al portapapeles');
}

// Ingresar el código de quien te invitó (solo una vez)
export function openReferralInput() {
  if (state.user.referidoPor) {
    openModal(`
      <div style="font-size:38px;">✅</div>
      <h3 style="font-size:18px; font-weight:900; margin-top:6px;">Referido registrado</h3>
      <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Ya usaste el código <strong>${state.user.referidoPor}</strong>. Solo se puede registrar uno.</p>
      <button class="btn btn-primary" style="width:100%; margin-top:14px;" onclick="closeModal()">Cerrar</button>
    `);
    return;
  }
  openModal(`
    <div style="font-size:38px;">🎟️</div>
    <h3 style="font-size:18px; font-weight:900; margin-top:6px;">¿Quién te invitó?</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Escribe su código de referido. Solo puedes registrar <strong>uno</strong> y activa Puntos x2 en tu próximo reciclaje.</p>
    <input id="referral-input" type="text" placeholder="Ej: SOFIA-UNICOR" autocapitalize="characters"
           style="width:100%; margin-top:12px; padding:12px; border-radius:12px; border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-weight:800; text-align:center; text-transform:uppercase;">
    <button class="btn btn-primary" style="width:100%; margin-top:12px;" onclick="submitReferralCode()">Guardar código</button>
    <button class="btn" style="width:100%; margin-top:6px; background:none; color:var(--text-muted); font-size:13px;" onclick="closeModal()">Cancelar</button>
  `);
}

export async function submitReferralCode() {
  const code = document.getElementById('referral-input').value;
  try {
    await applyReferral(code);
    closeModal();
    emitChange();
    showToast('🎉 Código registrado. ¡Puntos x2 en tu próximo reciclaje!');
  } catch (err) {
    showToast('❌ ' + friendlyError(err), true);
  }
}
