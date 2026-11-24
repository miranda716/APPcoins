// Re-dibuja todas las pantallas con el estado actual.
import { renderHome } from './components/Home.js';
import { renderMap } from './components/CampusMap.js';
import { renderScannerSelect } from './components/Scan.js';
import { renderRewards } from './components/Rewards.js';
import { renderHistory } from './components/History.js';
import { renderFullChallenges } from './components/Challenges.js';
import { renderProfile } from './components/Profile.js';

export function renderAll() {
  renderHome();
  renderProfile();
  renderMap();
  renderScannerSelect();
  renderRewards();
  renderHistory();
  renderFullChallenges();
}
