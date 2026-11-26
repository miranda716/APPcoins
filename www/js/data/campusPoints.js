// Puntos ecológicos y comercios aliados del Campus Unicórdoba (Montería).
// TODO: reemplazar por Firebase Firestore.
export const campusPoints = [
  {
    id: 'pt-biblio',
    nombre: 'Punto Ecológico Biblioteca Central',
    tipo: 'reciclaje',
    x: '26%', y: '22%',
    materiales: ['Plástico', 'Vidrio', 'Papel', 'Aluminio'],
    horario: 'Lun - Vie · 7:00 AM - 8:00 PM',
    codigoQR: 'UNICOR-BIBLIO-01',
    lat: 8.7918, lng: -75.8615
  },
  {
    id: 'pt-ing',
    nombre: 'Bloque 11 Bioclimático',
    tipo: 'reciclaje',
    x: '74%', y: '25%',
    materiales: ['Plástico', 'Vidrio', 'Papel', 'Aluminio'],
    horario: 'Lun - Sáb · 6:30 AM - 9:00 PM',
    codigoQR: 'UNICOR-ING-02',
    lat: 8.789615, lng: -75.859270
  },
  {
    id: 'pt-agora',
    nombre: 'Edificio de Postgrados',
    tipo: 'reciclaje',
    x: '50%', y: '48%',
    materiales: ['Plástico', 'Vidrio', 'Papel', 'Aluminio'],
    horario: '24 Horas · Campus Central',
    codigoQR: 'UNICOR-AGORA-03',
    lat: 8.788688477579003, lng: -75.85795985350926
  },
  {
    id: 'pt-basicas',
    nombre: 'EcoEstación Ciencias Básicas',
    tipo: 'reciclaje',
    x: '25%', y: '72%',
    materiales: ['Plástico', 'Vidrio', 'Papel', 'Aluminio'],
    horario: 'Lun - Vie · 7:00 AM - 7:00 PM',
    codigoQR: 'UNICOR-BASICAS-04',
    lat: 8.7905, lng: -75.8618
  },
  {
    id: 'com-cafe',
    nombre: 'Cafetería Central',
    tipo: 'comercio',
    x: '73%', y: '73%',
    materiales: ['Comercio Aliado · Canje QR'],
    horario: 'Lun - Sáb · 6:30 AM - 7:30 PM',
    codigoQR: 'UNICOR-CAFE-05',
    lat: 8.791234, lng: -75.862337
  },
  {
    id: 'com-salud',
    nombre: 'Cafetería de Salud',
    tipo: 'comercio',
    x: '56%', y: '33%',
    materiales: ['Comercio Aliado · Canje QR'],
    horario: 'Lun - Sáb · 6:30 AM - 7:30 PM',
    codigoQR: 'UNICOR-SALUD-06',
    lat: 8.789530, lng: -75.858326
  }
];
