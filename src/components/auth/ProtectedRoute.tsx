import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { TransactionsProvider } from '@/contexts/TransactionsContext'
import { isPublicAccessEnabled } from '@/lib/env'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const publicAccess = isPublicAccessEnabled()

  if (publicAccess) {
    return (
      <TransactionsProvider>
        <Outlet />
      </TransactionsProvider>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Cargando sesión…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <TransactionsProvider>
      <Outlet />
    </TransactionsProvider>
  )
}