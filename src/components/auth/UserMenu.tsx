import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  LogOut,
  Loader2,
  Settings,
  Shield,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

function getDisplayName(
  email: string,
  name?: string | null
): string {
  if (name?.trim()) return name.trim()
  return email.split('@')[0] ?? 'Usuario'
}

function getInitials(email: string, name?: string | null): string {
  if (name?.trim()) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        toast.error(error.message)
        return
      }
      setOpen(false)
      toast.success('Sesión cerrada')
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const handleLoginSuccess = () => {
    toast.success('Sesión iniciada')
    setOpen(false)
  }

  const email = user?.email ?? ''
  const name =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    null
  const displayName = user ? getDisplayName(email, name) : ''
  const initials = user ? getInitials(email, name) : ''
  const provider = user?.app_metadata?.provider ?? 'email'

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
        aria-label={user ? 'Cuenta de usuario' : 'Iniciar sesión'}
      >
        {user ? (
          <span className="text-xs font-semibold">{initials}</span>
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {!user ? (
            <>
              <DialogHeader>
                <DialogTitle>Iniciar sesión</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Accede para sincronizar tus transacciones con Supabase.
              </p>
              <LoginForm onSuccess={handleLoginSuccess} />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials}
                  </span>
                  <span className="flex flex-col items-start gap-0.5">
                    <span>{displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {email}
                    </span>
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-1">
                <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Configuración
                </p>
                <div className="rounded-lg border border-border">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50"
                    disabled
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">Perfil y preferencias</span>
                    <span className="text-xs text-muted-foreground">Próximamente</span>
                  </button>
                  <Separator />
                  <Link
                    to="/forgot-password"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50"
                    onClick={() => setOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Seguridad y contraseña
                  </Link>
                  <Separator />
                  <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="capitalize">Conectado vía {provider}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 text-expense hover:text-expense"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Cerrar sesión
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}