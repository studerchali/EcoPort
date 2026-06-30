import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { AuthError } from '@/components/auth/AuthError'
import { useAuth } from '@/contexts/AuthContext'
import { DemoLoginButton } from '@/components/auth/DemoLoginButton'
import { isDemoAccountEnabled } from '@/lib/env'

interface LoginFormProps {
  onSuccess?: () => void
  showRegisterLink?: boolean
}

export function LoginForm({ onSuccess, showRegisterLink = true }: LoginFormProps) {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signInWithEmail(email, password)
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    onSuccess?.()
  }

  return (
    <div className="space-y-4">
      {isDemoAccountEnabled() && (
        <DemoLoginButton onSuccess={onSuccess} showHint />
      )}
      <OAuthButtons onError={setError} />
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          o con email
        </span>
      </div>
      <AuthError message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dialog-email">Email</Label>
          <Input
            id="dialog-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="dialog-password">Contraseña</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
              onClick={onSuccess}
            >
              ¿Olvidaste la contraseña?
            </Link>
          </div>
          <Input
            id="dialog-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>
      {showRegisterLink && (
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
            onClick={onSuccess}
          >
            Regístrate
          </Link>
        </p>
      )}
    </div>
  )
}