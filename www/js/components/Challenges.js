import { state } from '../store.js';
import { ChallengeCard } from './cards/ChallengeCard.js';

export function ChallengesScreen() {
  return /* html */ `
<section class="screen" id="screen-challenges">
  <div class="auth-header">
    <button class="icon-btn" onclick="switchTab('screen-home')">←</button>
    <div>
      <h2 style="font-size:19px; font-weight:900;">Desafíos Semanales</h2>
      <p style="font-size:12px; color:var(--text-muted);">Se actualizan cada semana · Lunes 00:00</p>
    </div>
  </div>

  <div class="section-pad">
    <div class="tabs-pill">
      <button class="tab-pill-btn active" id="ch-tab-active" onclick="switchChallengeTab('active')">Activos</button>
      <button class="tab-pill-btn" id="ch-tab-done" onclick="switchChallengeTab('done')">Completados</button>
    </div>
    <div id="challenges-full-list"></div>
  </div>
</section>
`;
}

export function switchChallengeTab(tab) {
  state.challengeTab = tab;
  document.getElementById('ch-tab-active').classList.toggle('active', tab === 'active');
  document.getElementById('ch-tab-done').classList.toggle('active', tab === 'done');
  renderFullChallenges();
}

export function renderFullChallenges() {
  const container = document.getElementById('challenges-full-list');
  const items = state.challenges.filter((c) => state.challengeTab === 'active' ? !c.completado : c.completado);

  if (!items.length) {
    container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted);">No hay desafíos en esta sección.</div>`;
    return;
  }
  container.innerHTML = items.map((c) => ChallengeCard(c, 'full')).join('');
}
