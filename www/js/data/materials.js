// Materiales reciclables: puntos y CO₂ evitado por escaneo (1 escaneo = 1 reciclaje).
// La clave (plastico, vidrio…) es la que va dentro del QR.
export const MATERIALS = {
  plastico: { label: 'Plástico', icon: '🧴', pts: 50, co2: 0.65 },
  vidrio:   { label: 'Vidrio',   icon: '🍾', pts: 40, co2: 0.45 },
  papel:    { label: 'Papel',    icon: '📄', pts: 30, co2: 0.50 },
  aluminio: { label: 'Aluminio', icon: '🥫', pts: 20, co2: 0.85 }
};

export const materialByLabel = (label) =>
  Object.values(MATERIALS).find((m) => m.label === label);
