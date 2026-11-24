import { subscribe } from './store.js';
import { switchTab } from './router.js';
import { initSupabase } from './services/supabase.js';
import { restoreSession } from './services/auth.js';
import { renderAll } from './render.js';
import { exposeActions } from './actions.js';

import { WelcomeScreen } from './components/Welcome.js';
import { AuthScreen } from './components/Auth.js';
import { HomeScreen } from './components/Home.js';
import { MapScreen } from './components/CampusMap.js';
import { ScanScreen } from './components/Scan.js';
import { HistoryScreen } from './components/History.js';
import { RewardsScreen } from './components/Rewards.js';
import { ChallengesScreen } from './components/Challenges.js';
import { ProfileScreen } from './components/Profile.js';
import { BottomNav } from './components/BottomNav.js';
import { Overlays } from './components/Overlays.js';

function mount() {
  document.getElementById('app').innerHTML = [
    Overlays(),
    WelcomeScreen(),
    AuthScreen(),
    HomeScreen(),
    MapScreen(),
    ScanScreen(),
    HistoryScreen(),
    RewardsScreen(),
    ChallengesScreen(),
    ProfileScreen(),
    BottomNav()
  ].join('\n');
}

async function boot() {
  exposeActions();
  mount();
  subscribe(renderAll);
  renderAll();

  // Supabase: si ya había una sesión guardada, entra directo al inicio
  await initSupabase();
  try {
    if (await restoreSession()) switchTab('screen-home');
  } catch (err) {
    console.error('No se pudo restaurar la sesión:', err);
  }
}

boot();
