import { state } from '../store.js';
import { HistoryItem } from './cards/HistoryItem.js';

export function HistoryScreen() {
  return /* html */ `
<section class="screen" id="screen-history">
  <div class="auth-header">
    <button class="icon-btn" onclick="switchTab('screen-home')">←</button>
    <div>
      <h2 style="font-size:19px; font-weight:900;">Historial de Movimientos</h2>
      <p style="font-size:12px; color:var(--text-muted);">Reciclajes y canjes en Unicórdoba</p>
    </div>
  </div>
  <div class="section-pad" id="history-list"></div>
</section>
`;
}

export function renderHistory() {
  let currentMonth = '';
  document.getElementById('history-list').innerHTML = state.history.map((h) => {
    const isNewMonth = h.mes !== currentMonth;
    currentMonth = h.mes;
    return HistoryItem(h, isNewMonth);
  }).join('');
}
