# EcoPort

**EcoPort** es una aplicación web de finanzas personales: ingresos, gastos, balance, inversiones y transacciones sincronizadas con Supabase. Diseñada como PWA instalable, con modo offline y datos de demostración para desarrollo.

**Versión:** 0.1.0

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Vite, React 19, TypeScript |
| Estilos | Tailwind CSS 4, shadcn/ui |
| Gráficos | Recharts |
| Estado | Zustand + React Context |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| PWA | vite-plugin-pwa |

## Características

- Dashboard con KPIs y gráficos mensuales
- Gestión de ingresos y gastos con formularios validados
- Libro de transacciones unificado con búsqueda y filtros
- Balance derivado en tiempo real (nunca almacenado manualmente en la UI)
- Autenticación email y OAuth (Google / Apple)
- Transacciones inmutables en Supabase con patrón de reversión
- Importación / exportación JSON y CSV
- Modo desarrollo sin login (`VITE_ALLOW_PUBLIC_ACCESS`)

## Inicio rápido

### Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (para sync en la nube)

### Instalación

```bash
git clone https://github.com/TU_USUARIO/EcoPort.git
cd EcoPort
npm install
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales Supabase (ver [docs/SUPABASE.md](docs/SUPABASE.md)).

```bash
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174) (Vite usa el siguiente puerto libre si 5174 está ocupado).

### Otros comandos

```bash
npm run build      # Build de producción
npm run preview    # Vista previa del build
npm run lint       # Linter (oxlint)
```

## Despliegue en producción

EcoPort está preparado para Vercel con code splitting, PWA, `vercel.json` y variables de entorno documentadas.

**Guía completa paso a paso:** [docs/DEPLOY.md](docs/DEPLOY.md)

Variables obligatorias en Vercel:

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon |
| `VITE_APP_URL` | URL de producción (`https://tu-app.vercel.app`) |
| `VITE_ALLOW_PUBLIC_ACCESS` | `false` en producción |

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el SQL Editor.
3. Configura las variables en `.env.local`.
4. Añade `http://localhost:5174/auth/callback` como redirect URL en Authentication.

Guía detallada: [docs/SUPABASE.md](docs/SUPABASE.md)

## Seguridad

- Las claves viven **solo** en `.env.local` (ignorado por Git).
- No se incluye `service_role` en el frontend.
- Exportaciones personales (`.xlsx`, `.csv`) están en `.gitignore`.

Más información: [docs/SECURITY.md](docs/SECURITY.md)

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard |
| `/ingresos` | Ingresos |
| `/gastos` | Gastos |
| `/transacciones` | Libro unificado |
| `/balance` | Balance mensual y cuentas |
| `/inversiones` | Portfolio |
| `/login` | Autenticación |

## Estructura del proyecto

```
├── docs/                 # Documentación (Supabase, seguridad)
├── public/               # Assets estáticos y PWA
├── scripts/              # Utilidades de desarrollo
├── src/
│   ├── components/       # UI, formularios, gráficos
│   ├── contexts/         # Auth, transacciones
│   ├── data/             # Seed de demostración
│   ├── hooks/            # Selectores financieros
│   ├── lib/              # Cálculos, Supabase, mappers
│   ├── pages/            # Vistas de la app
│   ├── store/            # Zustand (settings, inversiones)
│   └── types/            # TypeScript
└── supabase/migrations/  # Esquema SQL
```

## Estado actual (v0.1.0)

- [x] UI completa con Dashboard, ingresos, gastos, balance, inversiones
- [x] Integración Supabase Auth
- [x] Esquema DB con RLS y transacciones inmutables
- [x] Sync de transacciones vía `TransactionsContext`
- [x] Balance derivado desde `calculations.ts`
- [x] PWA instalable
- [x] Sync de inversiones con Supabase
- [x] Preparado para despliegue en Vercel
- [ ] Perfil y preferencias de usuario
- [ ] Tests automatizados

## Desarrollo con agentes

Consulta [AGENTS.md](AGENTS.md) para flujos de iteración con agentes especializados.

## Licencia

[MIT](LICENSE) — Copyright (c) 2026 EcoPort Contributors