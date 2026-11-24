// Tarjeta de desafío. variant "home" = compacta, "full" = pantalla de desafíos.

export function ChallengeCard(c, variant = 'home') {
  const pct = Math.round((c.progreso / c.meta) * 100);
  const caption = variant === 'full'
    ? (c.completado ? '✅ Completado' : `Progreso: ${c.progreso} de ${c.meta}`)
    : `Progreso: ${c.progreso} / ${c.meta}`;
  return `
    <div class="card">
      <div class="challenge-top">
        <span class="challenge-title">${c.titulo}</span>
        <span class="reward-chip">+${c.puntos} pts</span>
      </div>
      <div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); font-weight:700;">
        <span>${caption}</span>
        <span>${pct}%</span>
      </div>
    </div>
  `;
}
