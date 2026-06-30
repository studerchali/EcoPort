import { useCallback } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import {
  formatCurrency,
  formatPercent,
  HIDDEN_AMOUNT,
  HIDDEN_NUMBER,
} from '@/lib/format'
import type { Currency } from '@/types/finance'

export function usePrivacyFormat() {
  const hideSensitiveData = useFinanceStore((s) => s.hideSensitiveData)
  const toggleHideSensitiveData = useFinanceStore((s) => s.toggleHideSensitiveData)

  const formatMoney = useCallback(
    (amount: number, currency: Currency = 'EUR', compact = false) =>
      hideSensitiveData ? HIDDEN_AMOUNT : formatCurrency(amount, currency, compact),
    [hideSensitiveData]
  )

  const formatUnits = useCallback(
    (units: number, decimals = 4) =>
      hideSensitiveData ? HIDDEN_NUMBER : units.toFixed(decimals),
    [hideSensitiveData]
  )

  const formatShare = useCallback(
    (value: number, total: number) => {
      if (total <= 0) return formatPercent(0)
      return formatPercent(value / total)
    },
    []
  )

  const maskTick = useCallback(
    () => (hideSensitiveData ? HIDDEN_NUMBER : undefined),
    [hideSensitiveData]
  )

  return {
    hideSensitiveData,
    toggleHideSensitiveData,
    formatMoney,
    formatUnits,
    formatShare,
    formatPercentValue: formatPercent,
    maskTick,
    hiddenAmount: HIDDEN_AMOUNT,
    hiddenNumber: HIDDEN_NUMBER,
  }
}