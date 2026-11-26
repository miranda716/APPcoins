import { state } from '../store.js';
import { campusPoints } from '../data/campusPoints.js';
import { switchTab } from '../router.js';
import { showToast } from '../utils/ui.js';
import { onPosition, startLocationWatch, distanceToPoint, formatDistance } from '../services/geo.js';
import { PlaceCard } from './cards/PlaceCard.js';

export function MapScreen() {
  return /* html */ `
<section class="screen" id="screen-map">
  <div class="home-header">
    <div>
      <div class="greeting-sub">🗺️ Sede Principal · 8.7913° N, 75.8611° O</div>
      <h2 class="greeting-title">Explorar Unicórdoba</h2>
    </div>
  </div>

  <div class="filter-chips" id="map-filters">
    <button class="chip active" onclick="filterMap('Todos', this)">Todos (6)</button>
    <button class="chip" onclick="filterMap('Plástico', this)">🧴 Plástico</button>
    <button class="chip" onclick="filterMap('Papel', this)">📄 Papel</button>
    <button class="chip" onclick="filterMap('Vidrio', this)">🍾 Vidrio</button>
    <button class="chip" onclick="filterMap('Aluminio', this)">🥫 Aluminio</button>
    <button class="chip" onclick="filterMap('Comercio', this)">☕ Comercios</button>
  </div>

  <div class="map-canvas" id="map-canvas">
    <div id="leaflet-map"></div>
    <button class="locate-btn" onclick="locateMe()" title="Mi ubicación">📍</button>
  </div>

  <div class="section-pad">
    <div class="card" id="selected-place-card"></div>
  </div>
</section>
`;
}

let map = null;
let markersLayer = null;
let userMarker = null;
let accuracyCircle = null;

const isMapVisible = () => document.getElementById('screen-map').classList.contains('active');

function pinIcon(p, selected) {
  return L.divIcon({
    className: 'eco-pin' + (selected ? ' selected' : ''),
    html: `<div class="pin-bubble ${p.tipo === 'reciclaje' ? 'pin-reciclaje' : 'pin-comercio'}"><span>${p.tipo === 'reciclaje' ? '♻️' : '☕'}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 38]
  });
}

function initMap() {
  if (map) return;
  const box = document.getElementById('leaflet-map');
  if (!window.L) {
    box.innerHTML = '<p style="padding:24px; text-align:center; font-size:13px; color:var(--text-muted);">No se pudo cargar el mapa (Leaflet). Revisa tu conexión.</p>';
    return;
  }
  const lat = campusPoints.reduce((s, p) => s + p.lat, 0) / campusPoints.length;
  const lng = campusPoints.reduce((s, p) => s + p.lng, 0) / campusPoints.length;

  map = L.map(box).setView([lat, lng], 17);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  onPosition(updateUserMarker);
  startLocationWatch();
}

function updateUserMarker() {
  if (map && state.userPos) {
    const ll = [state.userPos.lat, state.userPos.lng];
    if (!userMarker) {
      userMarker = L.marker(ll, {
        icon: L.divIcon({ className: 'user-pos', html: '<div class="user-pos-dot"></div>', iconSize: [18, 18] }),
        interactive: false, keyboard: false, zIndexOffset: 1000
      }).addTo(map);
      accuracyCircle = L.circle(ll, { radius: state.userPos.accuracy, color: '#2196F3', weight: 1, fillOpacity: 0.1 }).addTo(map);
    } else {
      userMarker.setLatLng(ll);
      accuracyCircle.setLatLng(ll).setRadius(state.userPos.accuracy);
    }
  }
  renderPlaceCard(); // actualiza la distancia mostrada
}

function visiblePoints() {
  return campusPoints.filter((p) => {
    if (state.mapFilter === 'Todos') return true;
    if (state.mapFilter === 'Comercio') return p.tipo === 'comercio';
    return p.materiales.includes(state.mapFilter);
  });
}

function renderPlaceCard() {
  const sel = campusPoints.find((p) => p.id === state.selectedPointId);
  const card = document.getElementById('selected-place-card');
  if (!sel) { card.innerHTML = ''; return; }
  card.innerHTML = PlaceCard(sel, formatDistance(distanceToPoint(sel)));
}

export function renderMap() {
  if (!isMapVisible()) return; // el mapa se crea al abrir la pestaña (evita pedir GPS en el login)
  initMap();

  const filtered = visiblePoints();
  if (!filtered.some((p) => p.id === state.selectedPointId) && filtered.length) {
    state.selectedPointId = filtered[0].id;
  }

  if (map) {
    markersLayer.clearLayers();
    filtered.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: pinIcon(p, p.id === state.selectedPointId), keyboard: false })
        .on('click', () => selectPoint(p.id))
        .addTo(markersLayer);
    });
    setTimeout(() => map.invalidateSize(), 0); // la pantalla acaba de hacerse visible
  }
  renderPlaceCard();
}

export function filterMap(filter, el) {
  state.mapFilter = filter;
  document.querySelectorAll('#map-filters .chip').forEach((c) => c.classList.remove('active'));
  el.classList.add('active');
  renderMap();
}

export function selectPoint(id) {
  state.selectedPointId = id;
  const p = campusPoints.find((x) => x.id === id);
  if (map && p) map.panTo([p.lat, p.lng]);
  renderMap();
}

export function locateMe() {
  if (state.userPos && map) {
    map.setView([state.userPos.lat, state.userPos.lng], 18);
  } else {
    showToast(state.gpsError || '📡 Buscando tu ubicación… acepta el permiso de GPS.', !!state.gpsError);
  }
}

export function presetScan() {
  switchTab('screen-scan');
}
