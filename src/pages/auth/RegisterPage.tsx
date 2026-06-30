import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { AuthError } from '@/components/auth/AuthError'
import { useAuth } from '@/contexts/AuthContext'

export function RegisterPage() {
  const { signUpWithEmail, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user && !success) navigate('/', { replace: true })
  }, [user, success, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error: authError } = await signUpWithEmail(email, password)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Revisa tu email" subtitle="Confirmación de cuenta">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-income" />
          <p className="text-sm text-muted-foreground">
            Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Revisa tu bandeja de entrada.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/login">Volver al login</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Empieza a gestionar tus finanzas">
      <div className="space-y-4">
        <OAuthButtons onError={setError} />
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            o con email
          </span>
        </div>
        <AuthError message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}