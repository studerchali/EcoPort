# Despliegue en Vercel — EcoPort

Guía paso a paso para publicar EcoPort en producción.

## Requisitos previos

- Cuenta en [GitHub](https://github.com) con el repositorio `EcoPort` subido
- Cuenta en [Vercel](https://vercel.com) (plan gratuito suficiente)
- Proyecto [Supabase](https://supabase.com) configurado con el esquema SQL aplicado

---

## Paso 1 — Preparar Supabase para producción

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **Authentication → URL Configuration**.
3. Configura:
   - **Site URL:** `https://tu-proyecto.vercel.app` (la URL final de Vercel)
   - **Redirect URLs:** añade:
     - `https://tu-proyecto.vercel.app/auth/callback`
     - `http://localhost:5174/auth/callback` (para desarrollo local)
4. Ve a **Settings → API** y copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

> Nunca uses la clave `service_role` en el frontend.

---

## Paso 2 — Conectar el repositorio en Vercel

1. Entra en [vercel.com/new](https://vercel.com/new).
2. Importa el repositorio de GitHub `EcoPort`.
3. Vercel detectará automáticamente **Vite** gracias a `vercel.json`.
4. Verifica la configuración de build:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

No cambies estos valores salvo que sepas lo que haces.

---

## Paso 3 — Variables de entorno en Vercel

En **Settings → Environment Variables**, añade:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` (anon key) | Production, Preview |
| `VITE_APP_URL` | `https://tu-proyecto.vercel.app` | Production |
| `VITE_ALLOW_PUBLIC_ACCESS` | `false` | Production |
| `VITE_DEMO_ENABLED` | `true` | Production, Preview |
| `VITE_DEMO_EMAIL` | `demo@ecoport.io` | Production, Preview |
| `VITE_DEMO_PASSWORD` | (ver abajo) | Production, Preview |

Para **Preview** (PRs), puedes usar las mismas credenciales Supabase o un proyecto de staging.

### Cuenta demo

Permite a visitantes probar la app con un clic (landing y login).

1. En Supabase → **Authentication → Providers → Email**, desactiva **Confirm email** (o confirma el usuario demo manualmente).
2. En tu máquina, con `.env.local` configurado:

```bash
npm run setup:demo
```

3. Añade las variables `VITE_DEMO_*` en Vercel y redeploy.

Credenciales: las que definas en `VITE_DEMO_EMAIL` y `VITE_DEMO_PASSWORD` (nunca las subas a Git).

> Las variables `VITE_*` se inyectan en **tiempo de build**. Tras cambiarlas, haz **Redeploy**.

---

## Paso 4 — Desplegar

1. Haz clic en **Deploy**.
2. Espera a que termine el build (`npm run build`).
3. Abre la URL generada (`https://ecoport-xxx.vercel.app`).

Si el build falla por variables faltantes, revisa el Paso 3 y redeploy.

---

## Paso 5 — Verificación post-despliegue

Checklist manual:

- [ ] La app carga sin pantalla en blanco
- [ ] `/login` muestra el formulario de acceso
- [ ] Registro / login con email funciona
- [ ] OAuth redirige correctamente a `/auth/callback`
- [ ] Dashboard muestra KPIs y gráficos
- [ ] Añadir ingreso/gasto actualiza el balance
- [ ] Inversiones: añadir y listar posiciones
- [ ] PWA: en móvil, "Añadir a pantalla de inicio" funciona
- [ ] `VITE_ALLOW_PUBLIC_ACCESS` está en `false` (sin banner de modo dev)

---

## Paso 6 — Dominio personalizado (opcional)

1. En Vercel: **Settings → Domains → Add**.
2. Sigue las instrucciones DNS de tu registrador.
3. Actualiza en Supabase:
   - Site URL
   - Redirect URLs
4. Actualiza `VITE_APP_URL` en Vercel y redeploy.

---

## Paso 7 — Actualizaciones continuas

Cada `git push` a `main` dispara un despliegue automático en Vercel.

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

---

## Solución de problemas

### Pantalla en blanco al cargar

- Revisa la consola del navegador.
- Confirma que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas.
- Redeploy tras añadir variables.

### Rutas 404 al recargar (`/ingresos`, `/balance`, etc.)

- `vercel.json` incluye rewrites SPA. Verifica que el archivo está en la raíz del repo.

### OAuth no redirige

- Comprueba que la URL de callback está en Supabase Redirect URLs.
- La URL debe coincidir exactamente (con `https`, sin barra final).

### Chunk grande / carga lenta

- La app usa lazy loading y code splitting (`vendor-charts`, `vendor-react`, etc.).
- El primer acceso al Dashboard descarga Recharts; las demás rutas son más ligeras.

---

## Comandos locales útiles

```bash
# Simular build de producción
npm run build
npm run preview

# Verificar tipos y lint
npm run build
npm run lint
```

---

## Seguridad en producción

- `VITE_ALLOW_PUBLIC_ACCESS=false` (obligatorio)
- RLS activo en Supabase (ver `supabase/migrations/001_initial_schema.sql`)
- Solo clave `anon` en el frontend
- Headers de seguridad configurados en `vercel.json`