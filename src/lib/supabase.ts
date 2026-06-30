import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv()

if (!supabaseUrl || !supabaseAnonKey) {
  const hint = import.meta.env.PROD
    ? 'Configúralas en Vercel → Settings → Environment Variables.'
    : 'Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local'
  throw new Error(`Faltan variables de entorno Supabase. ${hint}`)
}

/**
 * Cliente Supabase singleton para toda la app.
 * Usa la clave anon (pública) — nunca incluir service_role en el frontend.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})