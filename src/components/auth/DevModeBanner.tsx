import { FlaskConical } from 'lucide-react'

export function DevModeBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-800 dark:text-amber-200">
      <FlaskConical className="h-3.5 w-3.5 shrink-0 opacity-80" />
      <span>
        Modo desarrollo — Acceso público activado
      </span>
    </div>
  )
}