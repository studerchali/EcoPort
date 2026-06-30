import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

/**
 * Maneja el redirect de OAuth (Google/Apple) y confirmación de email.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const { error: authError } = await supabase.auth.getSession()
      if (authError) {
        setError(authError.message)
        return
      }
      navigate('/', { replace: true })
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-10 w-10 text-expense" />
        <p className="text-center text-sm text-muted-foreground">{error}</p>
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