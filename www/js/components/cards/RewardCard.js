// Tarjeta de recompensa canjeable.

export function RewardCard(r, puntosUsuario) {
  const canRedeem = puntosUsuario >= r.costo;
  const missing = r.costo - puntosUsuario;
  return `
    <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
      <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
        <div style="width:48px; height:48px; border-radius:14px; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">
          ${r.icono}
        </div>
        <div style="min-width:0;">
          <h4 style="font-size:14px; font-weight:900;">${r.titulo}</h4>
          <p style="font-size:12px; color:var(--text-muted); font-weight:700;">${r.comercio}</p>
          <span style="font-size:12px; font-weight:900; color:var(--primary);">${r.costo} pts</span>
        </div>
      </div>
      <button class="btn ${canRedeem ? 'btn-primary' : 'btn-disabled'}"
              style="padding:9px 12px; font-size:12px; white-space:nowrap; flex-shrink:0;"
              ${canRedeem ? `onclick="redeemReward('${r.id}')"` : 'disabled'}>
        ${canRedeem ? 'Canjear' : `Faltan ${missing}`}
      </button>
    </div>
  `;
}
