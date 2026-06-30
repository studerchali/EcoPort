/** Activa bypass de autenticación solo en desarrollo (valor exacto: "true"). */
export function isPublicAccessEnabled(): boolean {
  return import.meta.env.VITE_ALLOW_PUBLIC_ACCESS === 'true'
}

export interface DemoCredentials {
  email: string
  password: string
}

/** Credenciales de cuenta demo (solo si están configuradas en env). */
export function getDemoCredentials(): DemoCredentials | null {
  const email = import.meta.env.VITE_DEMO_EMAIL?.trim()
  const password = import.meta.env.VITE_DEMO_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

/** Muestra el botón de cuenta demo cuando está habilitado y hay credenciales. */
export function isDemoAccountEnabled(): boolean {
  return import.meta.env.VITE_DEMO_ENABLED === 'true' && getDemoCredentials() !== null
}

/** OAuth Google — activar solo tras habilitar el proveedor en Supabase Dashboard. */
export function isOAuthGoogleEnabled(): boolean {
  return import.meta.env.VITE_OAUTH_GOOGLE_ENABLED === 'true'
}

/** OAuth Apple — activar solo tras habilitar el proveedor en Supabase Dashboard. */
export function isOAuthAppleEnabled(): boolean {
  return import.meta.env.VITE_OAUTH_APPLE_ENABLED === 'true'
}

export function isAnyOAuthEnabled(): boolean {
  return isOAuthGoogleEnabled() || isOAuthAppleEnabled()
}

/** URL base de la app (producción: dominio Vercel). */
export function getAppUrl(): string {
  const configured = import.meta.env.VITE_APP_URL
  if (configured) return configured.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function getSupabaseEnv(): {
  url: string | undefined
  anonKey: string | undefined
} {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

/** Avisos de configuración en arranque (no bloquea la app). */
export function validateEnvOnBoot(): void {
  const { url, anonKey } = getSupabaseEnv()
  const missing: string[] = []
  if (!url) missing.push('VITE_SUPABASE_URL')
  if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY')

  if (missing.length > 0 && import.meta.env.PROD) {
    console.error(
      `[EcoPort] Faltan variables de entorno: ${missing.join(', ')}. ` +
        'Configúralas en Vercel → Settings → Environment Variables.'
    )
  }

  if (import.meta.env.PROD && isPublicAccessEnabled()) {
    console.warn(
      '[EcoPort] VITE_ALLOW_PUBLIC_ACCESS=true en producción — desactívalo por seguridad.'
    )
  }
}