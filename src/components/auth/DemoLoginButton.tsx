import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getDemoCredentials, isDemoAccountEnabled } from '@/lib/env'
import { APP_ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

interface DemoLoginButtonProps extends ComponentProps<typeof Button> {
  onSuccess?: () => void
  showHint?: boolean
}

export function DemoLoginButton({
  onSuccess,
  showHint = false,
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: DemoLoginButtonProps) {
  const { signInWithEmail } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (!isDemoAccountEnabled()) return null

  const credentials = getDemoCredentials()!

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithEmail(
        credentials.email,
        credentials.password
      )
      if (error) {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'Cuenta demo no configurada. Contacta al administrador.'
            : error.message
        )
        return
      }
      toast.success('Entrando con cuenta demo')
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(APP_ROUTES.dashboard, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        showHint && 'flex w-full flex-col items-center gap-2',
        !showHint && className
      )}
    >
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn('gap-2', showHint ? 'w-full' : className)}
        onClick={handleDemoLogin}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <PlayCircle className="h-4 w-4" aria-hidden="true" />
        )}
        Probar cuenta demo
      </Button>
      {showHint && (
        <p className="text-center text-xs text-muted-foreground">
          Explora la app con datos de ejemplo sin registrarte
        </p>
      )}
    </div>
  )
}