import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageLoader } from '@/components/shared/PageLoader'
import { APP_BASE, APP_ROUTES } from '@/lib/routes'

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
)
const IngresosPage = lazy(() =>
  import('@/pages/IngresosPage').then((m) => ({ default: m.IngresosPage }))
)
const GastosPage = lazy(() =>
  import('@/pages/GastosPage').then((m) => ({ default: m.GastosPage }))
)
const BalancePage = lazy(() =>
  import('@/pages/BalancePage').then((m) => ({ default: m.BalancePage }))
)
const InversionesPage = lazy(() =>
  import('@/pages/InversionesPage').then((m) => ({ default: m.InversionesPage }))
)
const TransactionsPage = lazy(() =>
  import('@/pages/TransactionsPage').then((m) => ({
    default: m.TransactionsPage,
  }))
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
)
const AuthCallbackPage = lazy(() =>
  import('@/pages/auth/AuthCallbackPage').then((m) => ({
    default: m.AuthCallbackPage,
  }))
)

const SupabaseTestPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/SupabaseTestPage').then((m) => ({
        default: m.SupabaseTestPage,
      }))
    )
  : null

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <LazyPage>
              <LandingPage />
            </LazyPage>
          }
        />
        <Route
          path="login"
          element={
            <LazyPage>
              <LoginPage />
            </LazyPage>
          }
        />
        <Route
          path="register"
          element={
            <LazyPage>
              <RegisterPage />
            </LazyPage>
          }
        />
        <Route
          path="forgot-password"
          element={
            <LazyPage>
              <ForgotPasswordPage />
            </LazyPage>
          }
        />
        <Route
          path="auth/callback"
          element={
            <LazyPage>
              <AuthCallbackPage />
            </LazyPage>
          }
        />
        {SupabaseTestPage && (
          <Route
            path="supabase-test"
            element={
              <LazyPage>
                <SupabaseTestPage />
              </LazyPage>
            }
          />
        )}

        <Route path={APP_BASE} element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              index
              element={
                <LazyPage>
                  <Dashboard />
                </LazyPage>
              }
            />
            <Route
              path="ingresos"
              element={
                <LazyPage>
                  <IngresosPage />
                </LazyPage>
              }
            />
            <Route
              path="gastos"
              element={
                <LazyPage>
                  <GastosPage />
                </LazyPage>
              }
            />
            <Route
              path="transacciones"
              element={
                <LazyPage>
                  <TransactionsPage />
                </LazyPage>
              }
            />
            <Route
              path="balance"
              element={
                <LazyPage>
                  <BalancePage />
                </LazyPage>
              }
            />
            <Route
              path="inversiones"
              element={
                <LazyPage>
                  <InversionesPage />
                </LazyPage>
              }
            />
          </Route>
        </Route>

        {/* Rutas legacy → redirigir a /app */}
        <Route path="ingresos" element={<Navigate to={APP_ROUTES.ingresos} replace />} />
        <Route path="gastos" element={<Navigate to={APP_ROUTES.gastos} replace />} />
        <Route path="transacciones" element={<Navigate to={APP_ROUTES.transacciones} replace />} />
        <Route path="balance" element={<Navigate to={APP_ROUTES.balance} replace />} />
        <Route path="inversiones" element={<Navigate to={APP_ROUTES.inversiones} replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}