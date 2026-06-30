import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Cargando página…</span>
    </div>
  )
}