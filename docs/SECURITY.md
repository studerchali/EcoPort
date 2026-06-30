# Seguridad — EcoPort

## Variables de entorno

| Variable | Uso | ¿Commitear? |
|----------|-----|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Solo en `.env.local` / Vercel |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon | Solo en `.env.local` / Vercel |
| `VITE_ALLOW_PUBLIC_ACCESS` | Bypass de auth en dev | `.env.example` con `false` |
| `VITE_DEMO_*` | Cuenta demo opcional | Placeholders en `.env.example` |
| `VITE_OAUTH_*` | Flags OAuth | `.env.example` con `false` |

**Prohibido en el repositorio:**

- `service_role` key de Supabase
- Contraseñas de base de datos
- Tokens OIDC de Vercel (`VERCEL_OIDC_TOKEN`)
- Archivos `.env.local` con valores reales
- Exportaciones personales (`.xlsx`, `.csv`)

## Row Level Security (RLS)

El esquema `001_initial_schema.sql` habilita RLS en:

| Tabla | Política |
|-------|----------|
| `profiles` | SELECT/UPDATE solo `auth.uid() = id` |
| `categories` | CRUD solo `auth.uid() = user_id` |
| `transactions` | SELECT + INSERT solo `auth.uid() = user_id` |
| `investments` | CRUD solo `auth.uid() = user_id` |
| `balances` | SELECT solo `auth.uid() = user_id` |

Las transacciones son **inmutables** en el cliente (sin UPDATE/DELETE); las correcciones insertan una reversión.

## Aislamiento por cuenta

| Tipo de sesión | Almacenamiento |
|----------------|----------------|
| Usuario autenticado | Supabase (`user_id` del JWT) |
| Cuenta demo | `localStorage` → `ecoport-v1-demo` |
| Invitado / dev público | `localStorage` → `ecoport-v1-guest` |

`FinanceStoreSync` cambia el scope al iniciar o cerrar sesión para evitar mezclar datos entre usuarios en el mismo navegador.

## Frontend

- Cliente Supabase en `src/lib/supabase.ts` usa solo `VITE_*` (embebidas en build).
- `SupabaseTestPage` solo se registra en `import.meta.env.DEV`.
- Cabeceras de seguridad en `vercel.json` (X-Frame-Options, nosniff, etc.).

## Datos de demostración

`src/data/seed.ts` contiene datos ficticios. La contraseña demo debe configurarse en variables de entorno, no hardcodeada en producción.

## Checklist antes de publicar en GitHub

- [ ] `.env.local` no está en el repositorio (`git status` limpio de `.env*`)
- [ ] `VITE_ALLOW_PUBLIC_ACCESS=false` en Vercel Production
- [ ] Migración SQL aplicada en Supabase
- [ ] OAuth redirect URLs apuntan al dominio correcto
- [ ] No hay `service_role` en ningún archivo del proyecto