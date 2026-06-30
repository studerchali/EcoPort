import type { Expense, Income } from '@/types/finance'

export function normalizeAccountName(account: string): string {
  return account.trim()
}

export function rememberAccountInList(
  list: string[],
  account: string
): string[] {
  const trimmed = normalizeAccountName(account)
  if (!trimmed) return list
  const exists = list.some(
    (a) => a.localeCompare(trimmed, 'es', { sensitivity: 'accent' }) === 0
  )
  if (exists) return list
  return [...list, trimmed]
}

export function collectAccountsFromTransactions(
  incomes: Income[],
  expenses: Expense[],
  savedAccounts: string[] = []
): string[] {
  const set = new Set(savedAccounts.map(normalizeAccountName).filter(Boolean))

  for (const income of incomes) {
    const name = normalizeAccountName(income.account)
    if (name) set.add(name)
  }

  for (const expense of expenses) {
    const name = normalizeAccountName(expense.paymentMethod)
    if (name) set.add(name)
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
}