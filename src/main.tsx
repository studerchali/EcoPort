import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { FinanceStoreSync } from '@/components/auth/FinanceStoreSync'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { validateEnvOnBoot } from '@/lib/env'

validateEnvOnBoot()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FinanceStoreSync />
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)