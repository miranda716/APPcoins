// Contenedores de toast y modal (se llenan desde utils/ui.js).
export function Overlays() {
  return /* html */ `
  <div class="toast" id="toast"></div>

<div class="modal-backdrop" id="modal-backdrop" onclick="closeModal(event)">
  <div class="modal-card" id="modal-content" onclick="event.stopPropagation()"></div>
</div>
`;
}
