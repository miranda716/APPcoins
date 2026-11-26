export function BottomNav() {
  return /* html */ `
<nav class="bottom-nav" id="bottom-nav">
  <button class="nav-btn active" data-target="screen-home" onclick="switchTab('screen-home')">
    <span style="font-size:19px;">🏠</span>
    <span>Inicio</span>
  </button>
  <button class="nav-btn" data-target="screen-map" onclick="switchTab('screen-map')">
    <span style="font-size:19px;">🧭</span>
    <span>Explorar</span>
  </button>
  <div class="nav-scan-wrap">
    <button class="nav-scan-btn" onclick="switchTab('screen-scan')" title="Escanear QR">+</button>
  </div>
  <button class="nav-btn" data-target="screen-rewards" onclick="switchTab('screen-rewards')">
    <span style="font-size:19px;">🎁</span>
    <span>Recompensas</span>
  </button>
  <button class="nav-btn" data-target="screen-profile" onclick="switchTab('screen-profile')">
    <span style="font-size:19px;">👤</span>
    <span>Perfil</span>
  </button>
</nav>
`;
}
