import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            E
          </span>
          <span className="text-lg font-bold tracking-tight text-primary">
            EcoPort
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Acciones de cuenta">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Crear cuenta</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}