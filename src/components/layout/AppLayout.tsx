import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  List,
  Moon,
  Sun,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { DevModeBanner } from '@/components/auth/DevModeBanner'
import { DemoBanner } from '@/components/auth/DemoBanner'
import { SchemaSetupBanner } from '@/components/auth/SchemaSetupBanner'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoUser } from '@/lib/demo'
import { UserMenu } from '@/components/auth/UserMenu'
import { isPublicAccessEnabled } from '@/lib/env'
import { ImportExportMenu } from '@/components/shared/ImportExportMenu'
import { QuickAddDialog } from '@/components/shared/QuickAddDialog'
import { APP_ROUTES } from '@/lib/routes'

const navItems = [
  { path: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { path: APP_ROUTES.ingresos, label: 'Ingresos', icon: TrendingUp },
  { path: APP_ROUTES.gastos, label: 'Gastos', icon: TrendingDown },
  { path: APP_ROUTES.transacciones, label: 'Transacciones', icon: List },
  { path: APP_ROUTES.balance, label: 'Balance', icon: Scale },
  { path: APP_ROUTES.inversiones, label: 'Inversiones', icon: PieChart },
]

function isNavActive(pathname: string, path: string): boolean {
  if (path === APP_ROUTES.dashboard) {
    return pathname === APP_ROUTES.dashboard
  }
  return pathname.startsWith(path)
}

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [dark, setDark] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const setSelectedYear = useFinanceStore((s) => s.setSelectedYear)

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
  }

  const publicAccess = isPublicAccessEnabled()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      {publicAccess && <DevModeBanner />}
      {!publicAccess && isDemoUser(user) && <DemoBanner />}
      <SchemaSetupBanner />
      <div className="flex flex-1">
      <aside
        className="hidden w-64 flex-col border-r border-border bg-card lg:flex"
        aria-label="Barra lateral"
      >
        <div className="border-b border-border p-6">
          <Link to={APP_ROUTES.dashboard}>
            <h1 className="text-xl font-bold text-primary">EcoPort</h1>
            <p className="text-xs text-muted-foreground">Finanzas personales</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              aria-current={isNavActive(location.pathname, path) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isNavActive(location.pathname, path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3">
            <Link to={APP_ROUTES.dashboard} className="text-lg font-semibold lg:hidden">
              EcoPort
            </Link>
            <Select
              value={String(selectedYear)}
              onValueChange={(v: string) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-28" aria-label="Año fiscal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuickAddOpen(true)}
              className="lg:hidden"
              aria-label="Añadir transacción"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setQuickAddOpen(true)}
              className="hidden lg:flex"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Añadir
            </Button>
            <ImportExportMenu />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDark}
              aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {dark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <UserMenu />
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 pb-20 lg:p-6 lg:pb-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card lg:hidden"
          aria-label="Navegación móvil"
        >
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              aria-current={isNavActive(location.pathname, path) ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
                isNavActive(location.pathname, path)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      </div>

      <QuickAddDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  )
}