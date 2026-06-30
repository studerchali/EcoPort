# EcoPort

**EcoPort** es una aplicación web de finanzas personales: ingresos, gastos, balance, inversiones y transacciones. PWA instalable con sincronización en Supabase, datos aislados por cuenta y modo privacidad para ocultar montos sensibles.

**Versión:** 1.0.0 · **Producción:** [ecoport-ashy.vercel.app](https://ecoport-ashy.vercel.app)

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Vite 8, React 19, TypeScript |
| Estilos | Tailwind CSS 4, shadcn/ui |
| Gráficos | Recharts |
| Estado | Zustand + React Context |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Deploy | Vercel |
| PWA | vite-plugin-pwa |

## Características

- Dashboard con KPIs y gráficos mensuales
- Ingresos, gastos y libro de transacciones unificado
- Balance derivado en tiempo real desde `calculations.ts`
- Inversiones con importación CSV (IBKR)
- Autenticación email y OAuth (Google / Apple)
- **Datos por usuario:** RLS en Supabase + localStorage aislado por cuenta
- **Modo privacidad:** oculta montos y muestra porcentajes donde aplica
- Importación / exportación JSON y CSV
- Cuenta demo para explorar sin datos reales

## Inicio rápido

### Requisitos

- Node.js 20+
- Proyecto en [Supabase](https://supabase.com)

### Instalación

```bash
git clone https://github.com/studerchali/EcoPort.git
cd EcoPort
npm install
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales (ver [docs/SUPABASE.md](docs/SUPABASE.md)).

```bash
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174).

### Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run preview      # Vista previa del build
npm run lint         # Linter (oxlint)
npm run setup:demo   # Crear cuenta demo en Supabase Auth
npm run generate:seed # Regenerar seed desde Excel (local)
```

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el **SQL Editor**.
3. Configura variables en `.env.local` o Vercel.
4. Añade redirect URLs en Authentication:
   - `http://localhost:5174/auth/callback`
   - `https://tu-dominio.vercel.app/auth/callback`

Guía detallada: [docs/SUPABASE.md](docs/SUPABASE.md)

## Despliegue en Vercel

Guía paso a paso: [docs/DEPLOY.md](docs/DEPLOY.md)

| Variable | Producción |
|----------|------------|
| `VITE_SUPABASE_URL` | URL del proyecto |
| `VITE_SUPABASE_ANON_KEY` | Clave anon (pública) |
| `VITE_APP_URL` | URL de Vercel |
| `VITE_ALLOW_PUBLIC_ACCESS` | `false` |
| `VITE_DEMO_*` | Opcional, para botón demo |

## Seguridad

- Claves solo en variables de entorno (`.env.local` / Vercel).
- **Nunca** `service_role` en el frontend.
- RLS activo en `profiles`, `transactions`, `investments`, `categories`, `balances`.
- `.xlsx` / `.csv` personales ignorados por Git.

Más información: [docs/SECURITY.md](docs/SECURITY.md)

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login`, `/register` | Autenticación |
| `/app` | Dashboard |
| `/app/ingresos` | Ingresos |
| `/app/gastos` | Gastos |
| `/app/transacciones` | Libro unificado |
| `/app/balance` | Balance |
| `/app/inversiones` | Portfolio |

## Estructura del proyecto

```
├── docs/                 # Supabase, seguridad, deploy
├── public/               # PWA e iconos
├── scripts/              # Seed, demo, utilidades
├── src/
│   ├── components/       # UI, formularios, gráficos
│   ├── contexts/         # Auth, transacciones, inversiones
│   ├── hooks/            # Selectores y privacidad
│   ├── lib/              # Cálculos, Supabase, mappers
│   ├── pages/            # Vistas
│   ├── store/            # Zustand (preferencias por usuario)
│   └── types/            # TypeScript
└── supabase/migrations/  # Esquema SQL + RLS
```

## Estado del proyecto (v1.0.0)

- [x] UI completa: Dashboard, ingresos, gastos, balance, inversiones
- [x] Supabase Auth (email + OAuth opcional)
- [x] Transacciones inmutables con RLS
- [x] Datos aislados por cuenta (Supabase + localStorage por scope)
- [x] Importación CSV IBKR
- [x] Modo privacidad (ocultar montos)
- [x] PWA instalable
- [x] Despliegue en Vercel
- [ ] Tests automatizados
- [ ] Perfil de usuario en Supabase (preferencias en nube)

## Desarrollo con agentes

Consulta [AGENTS.md](AGENTS.md) para flujos de iteración especializados.

## Licencia

[MIT](LICENSE) — Copyright (c) 2026 EcoPort Contributors