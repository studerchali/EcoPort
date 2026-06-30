# Configuración de Supabase — EcoPort

## 1. Crear proyecto

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Anota la **URL** y la **anon key** (Settings → API).

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_ALLOW_PUBLIC_ACCESS=false
```

> **Nunca** subas `.env.local` a Git. La `anon key` es pública en el cliente, pero debe ir solo en variables de entorno.

## 3. Aplicar el esquema

En **SQL Editor**, ejecuta el contenido de:

```
supabase/migrations/001_initial_schema.sql
```

O con Supabase CLI:

```bash
supabase db push
```

## 4. Autenticación

En Authentication → URL Configuration, añade:

| Entorno | Redirect URL |
|---------|----------------|
| Local | `http://localhost:5174/auth/callback` |
| Producción | `https://tu-dominio.com/auth/callback` |

Proveedores opcionales: Google, Apple (OAuth).

## 5. Row Level Security

El esquema incluye RLS en todas las tablas. Cada usuario solo accede a sus propios datos. Las transacciones son **inmutables** (solo INSERT + SELECT); las correcciones usan `reversal_of_id`.

Verifica en **Table Editor** que RLS esté **Enabled** en: `profiles`, `categories`, `transactions`, `investments`, `balances`.

## 6. Datos por cuenta

| Sesión | Dónde se guardan ingresos/gastos/inversiones |
|--------|---------------------------------------------|
| Google / email | Tablas Supabase filtradas por `user_id` |
| Demo (`demo@ecoport.io`) | localStorage `ecoport-v1-demo` |
| Sin login (solo dev) | localStorage `ecoport-v1-guest` |

Si ves el banner *"Base de datos pendiente"*, la migración SQL no se ha aplicado aún.

## 7. Perfil al registrarse

El trigger `on_auth_user_created` crea la fila en `profiles`. Si te registraste antes de aplicar la migración, ejecuta manualmente:

```sql
INSERT INTO public.profiles (id, email, default_currency)
SELECT id, email, 'EUR' FROM auth.users WHERE email = 'tu@email.com'
ON CONFLICT (id) DO NOTHING;
```