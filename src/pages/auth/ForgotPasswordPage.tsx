import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthError } from '@/components/auth/AuthError'
import { useAuth } from '@/contexts/AuthContext'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await resetPassword(email)
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Email enviado" subtitle="Recuperación de contraseña">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-income" />
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un
            enlace para restablecer tu contraseña.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/login">Volver al login</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace de recuperación"
    >
      <div className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar enlace
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}