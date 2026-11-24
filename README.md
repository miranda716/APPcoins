# 🌿 EcoPuntos · Edición Campus Unicórdoba

App web (PWA-ready) para reciclar en el campus de la Universidad de Córdoba (Montería), ganar EcoPuntos y canjearlos por recompensas.

- **Hosting:** GitHub Pages (sin Android Studio)
- **Login y datos:** Supabase
- **Mapa y GPS:** Leaflet + OpenStreetMap + `navigator.geolocation`

## Estructura

```
├── .github/workflows/pages.yml   ← publica www/ en GitHub Pages automáticamente
├── supabase/schema.sql           ← tablas + seguridad (se pega en Supabase)
├── capacitor.config.json         ← opcional, solo si algún día haces APK
└── www/                          ← toda la app
    ├── index.html
    ├── css/
    └── js/
        ├── config.js             ← AQUÍ pegas la URL y clave de Supabase
        ├── main.js  store.js  router.js  render.js  actions.js
        ├── services/             ← supabase.js, auth.js, data.js, geo.js
        ├── data/                 ← puntos del campus y recompensas
        ├── utils/
        └── components/           ← una pantalla por archivo (+ cards/)
```

## 1. Configurar Supabase (una sola vez)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: pega todo `supabase/schema.sql` y pulsa **Run**.
3. **Project Settings → API**: copia *Project URL* y la clave *anon / publishable*.
4. Pégalas en `www/js/config.js`.
5. **Authentication → URL Configuration**: en *Site URL* pon la dirección de tu GitHub Pages (`https://TU_USUARIO.github.io/ecopuntos-unicordoba/`). Si no, el correo de confirmación te llevará a un sitio equivocado.
6. (Opcional, para pruebas) **Authentication → Providers → Email**: desactiva *Confirm email* para entrar sin confirmar el correo.

> La clave `anon` es pública por diseño (va en el navegador); lo que protege los datos son las políticas RLS del SQL. **Nunca** pegues la clave `service_role`.

Mientras `config.js` tenga los valores de ejemplo, la app funciona en **modo demo** (botón "Entrar como Demo") sin guardar nada.

## 2. Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (rama `main`):
   ```bash
   git init
   git add .
   git commit -m "EcoPuntos con Supabase + Leaflet"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ecopuntos-unicordoba.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Espera ~1 minuto (pestaña **Actions**). Tu app queda en  
   `https://TU_USUARIO.github.io/ecopuntos-unicordoba/`

Cada `git push` a `main` actualiza el sitio solo. Ábrelo en el celular para probar GPS (necesita HTTPS, que GitHub Pages ya trae).

## 3. Probar en tu computador (opcional)

```bash
npm start      # sirve la carpeta www/ en http://localhost:3000
```
(No abre con doble clic: usa módulos ES.)

## Ajustes importantes

- **Coordenadas reales:** las `lat/lng` de `www/js/data/campusPoints.js` son aproximadas. Cámbialas por las de cada punto del campus (clic derecho en Google Maps → copiar coordenadas).
- **GPS estricto:** en `config.js`, `GPS_STRICT = false` permite escanear desde cualquier lugar (pruebas). Ponlo en `true` para exigir estar a menos de 100 m.
- **Seguridad de puntos:** hoy el navegador calcula y guarda los puntos; un usuario avanzado podría manipularlos. Para producción, mueve ese cálculo a una función RPC / Edge Function de Supabase.
- **Desafíos:** todavía son locales (no se guardan en Supabase).
- **Mapa:** usa los tiles públicos de OpenStreetMap, suficientes para desarrollo. Con mucho tráfico conviene un proveedor de tiles propio.
- **Fuente Nunito:** se carga de Google Fonts (necesita internet).

## Pendiente

- Lectura real de QR con la cámara
- Desafíos y referidos persistentes en Supabase
- Instalable en el celular (manifest + service worker) como PWA
