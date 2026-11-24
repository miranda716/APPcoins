// Detalle del punto seleccionado en el mapa. distLabel = "35 m", "1.2 km" o "—".

export function PlaceCard(sel, distLabel) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
      <div>
        <span style="font-size:11px; font-weight:800; color:var(--secondary); text-transform:uppercase;">
          ${sel.tipo === 'reciclaje' ? 'Punto Ecológico Campus' : 'Comercio Aliado Unicórdoba'}
        </span>
        <h3 style="font-size:16px; font-weight:900; margin-top:2px;">${sel.nombre}</h3>
      </div>
      <span class="reward-chip">${distLabel}</span>
    </div>
    <p style="font-size:12px; color:var(--text-muted); margin:8px 0 4px; font-weight:700;">
      🕒 ${sel.horario}
    </p>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0 12px;">
      ${sel.materiales.map((m) => `<span style="background:var(--bg); border:1px solid var(--border); padding:4px 9px; border-radius:999px; font-size:11px; font-weight:800;">${m}</span>`).join('')}
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <a class="btn btn-primary" style="text-decoration:none; font-size:13px; padding:10px;"
         href="https://www.google.com/maps/search/?api=1&query=${sel.lat},${sel.lng}" target="_blank">
        📍 Cómo llegar
      </a>
      <button class="btn" style="background:var(--accent-soft); color:var(--primary); font-size:13px; padding:10px;"
              onclick="presetScan('${sel.id}')">
        📷 Escanear aquí
      </button>
    </div>
  `;
}
