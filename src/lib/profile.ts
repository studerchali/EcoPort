import { supabase } from '@/lib/supabase'
import { isMissingTableError } from '@/lib/supabase-errors'
import type { User } from '@supabase/supabase-js'

/** Garantiza fila en profiles (necesaria para FK de transactions/investments). */
export async function ensureUserProfile(user: User): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      default_currency: 'EUR',
    },
    { onConflict: 'id' }
  )

  if (error && !isMissingTableError(error) && import.meta.env.DEV) {
    console.warn('[ensureUserProfile]', error.message)
  }
}