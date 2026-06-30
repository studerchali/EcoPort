# Seguridad — EcoPort

## Variables de entorno

| Variable | Uso | ¿Commitear? |
|----------|-----|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Solo en `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon | Solo en `.env.local` |
| `VITE_ALLOW_PUBLIC_ACCESS` | Bypass de auth en dev | `.env.example` con `false` |

**Prohibido en el repositorio:**

- `service_role` key de Supabase
- Contraseñas de base de datos
- Tokens de terceros
- Archivos `.env` con valores reales
- Exportaciones personales (`.xlsx`, `.csv`)

## Buenas prácticas

1. Usa `.env.local` para desarrollo (ignorado por Git).
2. En producción, configura variables en tu hosting (Vercel, Netlify, etc.).
3. Mantén `VITE_ALLOW_PUBLIC_ACCESS=false` en producción.
4. No incluyas `dist/` en el repo; el build puede embeber variables de entorno.
5. Rota la anon key si crees que se filtró (Supabase Dashboard → Settings → API).

## Datos de demostración

El archivo `src/data/seed.ts` contiene **datos ficticios** para desarrollo offline. No representan finanzas reales.