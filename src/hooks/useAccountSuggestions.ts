import { useMemo } from 'react'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useFinanceStore } from '@/store/financeStore'
import { collectAccountsFromTransactions } from '@/lib/accounts'

export function useAccountSuggestions(): string[] {
  const savedAccounts = useFinanceStore((s) => s.savedAccounts)
  const { incomes, expenses } = useTransactions()

  return useMemo(
    () => collectAccountsFromTransactions(incomes, expenses, savedAccounts),
    [savedAccounts, incomes, expenses]
  )
}