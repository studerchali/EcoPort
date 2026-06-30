import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  Shield,
  Smartphone,
  Cloud,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { useAuth } from '@/contexts/AuthContext'
import { APP_ROUTES } from '@/lib/routes'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard visual',
    description:
      'KPIs, gráficos de ingresos vs gastos, balance histórico y distribución por categorías.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: TrendingUp,
    title: 'Ingresos y gastos',
    description:
      'Registra movimientos con categorías, multi-moneda y sincronización en la nube.',
    color: 'text-income bg-income/10',
  },
  {
    icon: Scale,
    title: 'Balance en tiempo real',
    description:
      'Tu balance se calcula automáticamente desde las transacciones. Sin cifras manuales.',
    color: 'text-balance bg-balance/10',
  },
  {
    icon: PieChart,
    title: 'Inversiones',
    description:
      'Portfolio simple con valoración aproximada, P/L y formulario para añadir posiciones.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: Cloud,
    title: 'Sincronización Supabase',
    description:
      'Datos seguros con autenticación, transacciones inmutables y acceso desde cualquier dispositivo.',
    color: 'text-balance bg-balance/10',
  },
  {
    icon: Smartphone,
    title: 'PWA instalable',
    description:
      'Úsala como app en el móvil: rápida, responsive y lista para el día a día.',
    color: 'text-income bg-income/10',
  },
]

const highlights = [
  'Multi-moneda (EUR, USD, ARS)',
  'Gráficos con Recharts',
  'Importación y exportación JSON/CSV',
  'Modo oscuro',
  'Diseño mobile-first',
]

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate(APP_ROUTES.dashboard, { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              Finanzas personales, claras y bajo control
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tu dinero,{' '}
              <span className="text-primary">organizado</span> en un solo lugar
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              EcoPort te ayuda a registrar ingresos y gastos, ver tu balance al
              instante, analizar categorías y seguir tus inversiones. Deja el
              Excel atrás.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/register">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link to="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>

          {/* Preview cards */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ingresos YTD
                </p>
                <p className="mt-1 text-2xl font-bold text-income">+4.840 €</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gastos YTD
                </p>
                <p className="mt-1 text-2xl font-bold text-expense">-3.798 €</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm sm:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Balance neto
                </p>
                <p className="mt-1 text-2xl font-bold text-balance">+1.042 €</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Todo lo que necesitas para tus finanzas
          </h2>
          <p className="mt-3 text-muted-foreground">
            Una herramienta completa para el seguimiento diario y la visión a
            largo plazo.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color }) => (
            <Card
              key={title}
              className="border-border/60 transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex rounded-lg p-2.5 ${color}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Diseñada para usuarios reales
              </h2>
              <p className="mt-3 text-muted-foreground">
                Si vienes de una hoja de cálculo, EcoPort mantiene la lógica que
                ya conoces pero con una interfaz moderna, gráficos y datos en
                la nube.
              </p>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-income"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, label: 'Ingresos', variant: 'income' },
                { icon: TrendingDown, label: 'Gastos', variant: 'expense' },
                { icon: Scale, label: 'Balance', variant: 'balance' },
                { icon: PieChart, label: 'Inversiones', variant: 'primary' },
              ].map(({ icon: Icon, label, variant }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm"
                >
                  <Icon
                    className={`h-8 w-8 ${
                      variant === 'income'
                        ? 'text-income'
                        : variant === 'expense'
                          ? 'text-expense'
                          : variant === 'balance'
                            ? 'text-balance'
                            : 'text-primary'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="flex flex-col items-center p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Empieza a controlar tus finanzas hoy
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Crea tu cuenta en menos de un minuto y accede al dashboard, tus
              transacciones y tu portfolio.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/register">Crear cuenta</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} EcoPort — Finanzas personales</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">
              Iniciar sesión
            </Link>
            <Link to="/register" className="hover:text-foreground">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}