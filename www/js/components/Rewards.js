import { state, emitChange } from '../store.js';
import { rewardsData } from '../data/rewards.js';
import { openModal } from '../utils/ui.js';
import { monthLabel } from '../utils/date.js';
import { saveProgress } from '../services/data.js';
import { RewardCard } from './cards/RewardCard.js';

export function RewardsScreen() {
  return /* html */ `
<section class="screen" id="screen-rewards">
  <div class="home-header">
    <div>
      <div class="greeting-sub">🎁 Aliados Campus Unicórdoba</div>
      <h2 class="greeting-title">Recompensas</h2>
    </div>
    <div class="reward-chip" style="font-size:14px; padding:6px 12px;" id="rewards-balance">1,250 pts</div>
  </div>

  <div class="filter-chips" id="reward-tabs">
    <button class="chip active" onclick="filterRewards('Todas', this)">Todas</button>
    <button class="chip" onclick="filterRewards('Descuentos', this)">Descuentos</button>
    <button class="chip" onclick="filterRewards('Productos', this)">Productos</button>
    <button class="chip" onclick="filterRewards('Experiencias', this)">Experiencias</button>
  </div>

  <div class="section-pad" id="rewards-list"></div>
</section>
`;
}

export function filterRewards(cat, el) {
  state.rewardFilter = cat;
  document.querySelectorAll('#reward-tabs .chip').forEach((c) => c.classList.remove('active'));
  el.classList.add('active');
  renderRewards();
}

export function renderRewards() {
  document.getElementById('rewards-balance').textContent = `${state.user.puntos.toLocaleString('es-CO')} pts`;
  const items = rewardsData.filter((r) => state.rewardFilter === 'Todas' || r.categoria === state.rewardFilter);
  document.getElementById('rewards-list').innerHTML =
    items.map((r) => RewardCard(r, state.user.puntos)).join('');
}

export function redeemReward(id) {
  const r = rewardsData.find((item) => item.id === id);
  if (!r || state.user.puntos < r.costo) return;

  state.user.puntos -= r.costo;
  const couponCode = 'UNICOR-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  state.history.unshift({
    mes: monthLabel(),
    titulo: `Canje: ${r.titulo} (${r.comercio})`,
    fecha: 'Ahora mismo',
    puntos: -r.costo
  });

  emitChange();
  saveProgress({ titulo: `Canje: ${r.titulo} (${r.comercio})`, puntos: -r.costo });

  const pattern = Array.from({ length: 25 }, (_, i) => (i * 7 + r.costo) % 3 === 0 ? 'qr-cell w' : 'qr-cell');
  openModal(`
    <span class="reward-chip">Cupón Generado</span>
    <h3 style="font-size:18px; font-weight:900; margin-top:8px;">${r.titulo}</h3>
    <p style="font-size:12px; color:var(--text-muted);">${r.comercio}</p>
    <div class="qr-coupon-box">
      ${pattern.map((c) => `<div class="${c}"></div>`).join('')}
    </div>
    <div style="font-family:monospace; font-size:15px; font-weight:900; letter-spacing:1px;">${couponCode}</div>
    <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">Presenta este QR en caja dentro del campus.</p>
    <button class="btn btn-primary" style="width:100%; margin-top:14px;" onclick="closeModal()">Listo</button>
  `);
}
