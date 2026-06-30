import { PlayCircle } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-1.5 text-center text-xs text-primary">
      <PlayCircle className="h-3.5 w-3.5 shrink-0 opacity-80" />
      <span>Cuenta demo — Datos de ejemplo (no se guardan en la nube)</span>
    </div>
  )
}