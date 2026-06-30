import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { Currency } from '@/types/finance'

interface CurrencyAmountProps {
  amount: number
  currency?: Currency
  variant?: 'income' | 'expense' | 'neutral' | 'balance'
  className?: string
  compact?: boolean
}

export function CurrencyAmount({
  amount,
  currency = 'EUR',
  variant = 'neutral',
  className,
  compact,
}: CurrencyAmountProps) {
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

  return (
    <span className={cn('font-semibold tabular-nums', colorClass, className)}>
      {formatCurrency(amount, currency, compact)}
    </span>
  )
}