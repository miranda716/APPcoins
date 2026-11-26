// Funciones que las plantillas HTML llaman con onclick="...".
// Se exponen en window para que los atributos onclick las encuentren.
// (Mejora futura: cambiar onclick por addEventListener / data-action.)
import { goScreen, switchTab } from './router.js';
import { showToast, closeModal } from './utils/ui.js';
import { toggleDarkMode } from './utils/theme.js';
import { loginDemo, openAuth } from './components/Welcome.js';
import { switchAuthTab, handleLogin, handleRegister } from './components/Auth.js';
import { filterMap, selectPoint, presetScan, locateMe } from './components/CampusMap.js';
import { toggleFlash, retryCamera, claimRecycle } from './components/Scan.js';
import { filterRewards, redeemReward } from './components/Rewards.js';
import { switchChallengeTab } from './components/Challenges.js';
import { logout, shareAchievement, changeAvatar } from './components/Profile.js';
import { openNotifications, openReferralModal, copyReferral, openReferralInput, submitReferralCode } from './components/Modals.js';

export function exposeActions() {
  Object.assign(window, {
    goScreen, switchTab, showToast, closeModal, toggleDarkMode,
    loginDemo, openAuth,
    switchAuthTab, handleLogin, handleRegister,
    filterMap, selectPoint, presetScan, locateMe,
    toggleFlash, retryCamera, claimRecycle,
    filterRewards, redeemReward,
    switchChallengeTab,
    logout, shareAchievement, changeAvatar,
    openNotifications, openReferralModal, copyReferral, openReferralInput, submitReferralCode
  });
}
