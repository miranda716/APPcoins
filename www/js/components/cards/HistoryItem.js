// Fila del historial (con encabezado de mes cuando cambia).

export function HistoryItem(h, showMonthHeader) {
  const header = showMonthHeader
    ? `<div style="font-size:12px; font-weight:900; color:var(--text-muted); margin:10px 0 6px; text-transform:uppercase;">${h.mes}</div>`
    : '';
  const isPositive = h.puntos > 0;
  return `
    ${header}
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
      <div>
        <div style="font-size:13px; font-weight:800;">${h.titulo}</div>
        <div style="font-size:11px; color:var(--text-muted); font-weight:700;">${h.fecha}</div>
      </div>
      <div style="font-size:15px; font-weight:900; color:${isPositive ? 'var(--secondary)' : 'var(--danger)'}; white-space:nowrap;">
        ${isPositive ? '+' + h.puntos : h.puntos} pts
      </div>
    </div>
  `;
}
