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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {sections.map(({ value: v, label, icon: Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'text-primary')} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}