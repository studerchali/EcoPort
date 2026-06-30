import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tus finanzas">
      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
    </AuthLayout>
  )
}