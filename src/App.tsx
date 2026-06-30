import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { IngresosPage } from '@/pages/IngresosPage'
import { GastosPage } from '@/pages/GastosPage'
import { BalancePage } from '@/pages/BalancePage'
import { InversionesPage } from '@/pages/InversionesPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { SupabaseTestPage } from '@/pages/SupabaseTestPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="supabase-test" element={<SupabaseTestPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="ingresos" element={<IngresosPage />} />
            <Route path="gastos" element={<GastosPage />} />
            <Route path="transacciones" element={<TransactionsPage />} />
            <Route path="balance" element={<BalancePage />} />
            <Route path="inversiones" element={<InversionesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}