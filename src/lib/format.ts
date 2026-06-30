import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Currency } from '@/types/finance'

export const HIDDEN_AMOUNT = '••••••'
export const HIDDEN_NUMBER = '•••'

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  ARS: 'ARS',
}

export function formatCurrency(
  amount: number,
  currency: Currency = 'EUR',
  compact = false
): string {
  const symbol = currencySymbols[currency]
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact && Math.abs(amount) >= 1000 ? 'compact' : 'standard',
  }).format(amount)

  if (currency === 'EUR') return `${formatted} ${symbol}`
  if (currency === 'USD') return `${symbol}${formatted}`
  return `${formatted} ${symbol}`
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy', { locale: es })
}

export function formatDateInput(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM-dd')
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}