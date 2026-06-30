import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { HIDDEN_AMOUNT } from '@/lib/format'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  variant?: 'income' | 'expense' | 'neutral' | 'balance'
  /** false = value es texto (ej. nombre de categoría), no se enmascara */
  maskValue?: boolean
  /** false = subtitle no monetario (ej. conteo de cuentas) */
  maskSubtitle?: boolean
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  maskValue = true,
  maskSubtitle = true,
}: KpiCardProps) {
  const hideSensitiveData = useFinanceStore((s) => s.hideSensitiveData)

  const iconColor =
    variant === 'income'
      ? 'text-income bg-income/10'
      : variant === 'expense'
        ? 'text-expense bg-expense/10'
        : variant === 'balance'
          ? 'text-balance bg-balance/10'
          : 'text-primary bg-primary/10'

  const displayValue =
    hideSensitiveData && maskValue ? HIDDEN_AMOUNT : value
  const displaySubtitle =
    hideSensitiveData && maskSubtitle && subtitle ? HIDDEN_AMOUNT : subtitle

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('rounded-lg p-2', iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{displayValue}</div>
        {displaySubtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{displaySubtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}