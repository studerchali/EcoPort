import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useFinanceStore } from '@/store/financeStore'
import { HIDDEN_AMOUNT } from '@/lib/format'
import type { Currency } from '@/types/finance'

interface CurrencyAmountProps {
  amount: number
  currency?: Currency
  variant?: 'income' | 'expense' | 'neutral' | 'balance'
  className?: string
  compact?: boolean
  /** Si se define, muestra porcentaje en lugar del monto cuando el modo privacidad está activo. */
  shareOf?: number
}

export function CurrencyAmount({
  amount,
  currency = 'EUR',
  variant = 'neutral',
  className,
  compact,
  shareOf,
}: CurrencyAmountProps) {
  const hideSensitiveData = useFinanceStore((s) => s.hideSensitiveData)

  const colorClass =
    variant === 'income'
      ? 'text-income'
      : variant === 'expense'
        ? 'text-expense'
        : variant === 'balance'
          ? amount >= 0
            ? 'text-income'
            : 'text-expense'
          : 'text-foreground'

  let display: string
  if (hideSensitiveData) {
    if (shareOf !== undefined && shareOf > 0) {
      display = new Intl.NumberFormat('es-ES', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(amount / shareOf)
    } else {
      display = HIDDEN_AMOUNT
    }
  } else {
    display = formatCurrency(amount, currency, compact)
  }

  return (
    <span className={cn('font-semibold tabular-nums', colorClass, className)}>
      {display}
    </span>
  )
}