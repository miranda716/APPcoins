// Catálogo de recompensas: descuentos en las dos cafeterías del campus.
// La categoría es la cafetería (se usa en los filtros de la pantalla).
// TODO: reemplazar por Firebase Firestore.
export const rewardsData = [
  { id: 'rew-1', titulo: 'Descuento 15% Almuerzo o Café', comercio: 'Cafetería Central', costo: 200, categoria: 'Cafetería Central', icono: '☕' },
  { id: 'rew-2', titulo: 'Descuento 10% Almuerzo', comercio: 'Cafetería Central', costo: 150, categoria: 'Cafetería Central', icono: '🍽️' },
  { id: 'rew-3', titulo: 'Descuento 10% Café', comercio: 'Cafetería Central', costo: 100, categoria: 'Cafetería Central', icono: '☕' },
  { id: 'rew-4', titulo: 'Descuento 15% Almuerzo o Café', comercio: 'Cafetería de Salud', costo: 200, categoria: 'Cafetería de Salud', icono: '☕' },
  { id: 'rew-5', titulo: 'Descuento 10% Almuerzo', comercio: 'Cafetería de Salud', costo: 150, categoria: 'Cafetería de Salud', icono: '🍽️' },
  { id: 'rew-6', titulo: 'Descuento 10% Café', comercio: 'Cafetería de Salud', costo: 100, categoria: 'Cafetería de Salud', icono: '☕' }
];
