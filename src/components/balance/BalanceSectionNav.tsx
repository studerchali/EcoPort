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
    <div className="flex flex-wrap gap-2">
      {sections.map(({ value: v, label, icon: Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              active
                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-3.5 w-3.5 shrink-0', active && 'text-primary')} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}