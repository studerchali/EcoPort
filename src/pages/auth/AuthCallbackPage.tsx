import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/lib/routes'

function readOAuthError(): string | null {
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)

  const error =
    params.get('error_description') ??
    params.get('error') ??
    hashParams.get('error_description') ??
    hashParams.get('error')

  if (!error) return null

  if (
    error.includes('not enabled') ||
    error.includes('Unsupported provider')
  ) {
    return (
      'Google/Apple no están habilitados en Supabase. ' +
      'Configura los proveedores en el panel de Supabase o usa email/contraseña.'
    )
  }

  return decodeURIComponent(error.replace(/\+/g, ' '))
}

/**
 * Maneja el redirect de OAuth (Google/Apple) y confirmación de email.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlError = readOAuthError()
    if (urlError) {
      setError(urlError)
      return
    }

    const handleCallback = async () => {
      const { error: authError } = await supabase.auth.getSession()
      if (authError) {
        setError(authError.message)
        return
      }
      navigate(APP_ROUTES.dashboard, { replace: true })
    }

    void handleCallback()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-10 w-10 text-expense" />
        <p className="max-w-md text-center text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => navigate('/login')}>Volver al login</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completando autenticación…</p>
    </div>
  )
}