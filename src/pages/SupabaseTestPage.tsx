import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Página temporal de verificación de conexión Supabase.
 * Acceso directo: /supabase-test (sin layout principal).
 */
export function SupabaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>(
    'loading'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Verificar que el cliente está inicializado y responde
      if (supabase && typeof supabase.auth.getSession === 'function') {
        supabase.auth
          .getSession()
          .then(() => setStatus('connected'))
          .catch((err: Error) => {
            setStatus('error')
            setErrorMessage(err.message)
          })
      } else {
        setStatus('error')
        setErrorMessage('Cliente Supabase no inicializado')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        {status === 'loading' && (
          <p className="text-muted-foreground">Comprobando conexión…</p>
        )}
        {status === 'connected' && (
          <>
            <p className="text-xl font-semibold text-income">
              Conectado a Supabase
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cliente inicializado correctamente
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-xl font-semibold text-expense">
              Error de conexión
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  )
}