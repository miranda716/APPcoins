// Materiales reciclables: puntos por escaneo (1 escaneo = 1 reciclaje).
// La clave (plastico, vidrio…) es la que va dentro del QR.
export const MATERIALS = {
  plastico: { label: 'Plástico', icon: '🧴', pts: 50 },
  vidrio:   { label: 'Vidrio',   icon: '🍾', pts: 40 },
  papel:    { label: 'Papel',    icon: '📄', pts: 30 },
  aluminio: { label: 'Aluminio', icon: '🥫', pts: 20 }
};

export const materialByLabel = (label) =>
  Object.values(MATERIALS).find((m) => m.label === label);
