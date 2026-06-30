import { Calendar, Wallet, AlertCircle, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { value: 'mensual', label: 'Mensual', icon: Calendar },
  { value: 'cuentas', label: 'Cuentas', icon: Wallet },
  { value: 'deuda', label: 'Deuda', icon: AlertCircle },
  { value: 'historico', label: 'Histórico', icon: History },
] as const

interface BalanceSectionNavProps {
  value: string
  onChange: (value: string) => void
}

export function BalanceSectionNav({ value, onChange }: BalanceSectionNavProps) {
  return (
    <nav
      aria-label="Secciones de balance"
      className="scrollbar-none -mx-1 flex w-full gap-1 overflow-x-auto px-1 sm:mx-0 sm:gap-1.5 sm:px-0"
    >
      {sections.map(({ value: v, label, icon: Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-all sm:flex-1 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm',
              active
                ? 'border-primary/40 bg-primary text-primary-foreground shadow-sm'
                : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-background/80 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', active && 'text-primary-foreground')} />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}