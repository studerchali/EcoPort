import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { splitTransactions, toUnifiedTransaction } from '@/lib/mappers'
import {
  addExpenseRecord,
  addIncomeRecord,
  correctExpenseRecord,
  correctIncomeRecord,
  fetchActiveFinanceData,
  voidExpenseRecord,
  voidIncomeRecord,
} from '@/lib/transactionService'
import { useFinanceStore } from '@/store/financeStore'
import type { Transaction } from '@/types/database'
import type { Expense, Income } from '@/types/finance'
import type { UnifiedTransaction } from '@/lib/mappers'

interface TransactionsContextValue {
  incomes: Income[]
  expenses: Expense[]
  unified: UnifiedTransaction[]
  loading: boolean
  error: string | null
  isSupabaseMode: boolean
  refresh: () => Promise<void>
  addIncome: (data: Omit<Income, 'id'>) => Promise<Income>
  addExpense: (data: Omit<Expense, 'id'>) => Promise<Expense>
  updateIncome: (id: string, data: Omit<Income, 'id'>) => Promise<Income>
  updateExpense: (id: string, data: Omit<Expense, 'id'>) => Promise<Expense>
  deleteIncome: (id: string) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(
  undefined
)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const storeIncomes = useFinanceStore((s) => s.incomes)
  const storeExpenses = useFinanceStore((s) => s.expenses)
  const addIncomeLocal = useFinanceStore((s) => s.addIncome)
  const addExpenseLocal = useFinanceStore((s) => s.addExpense)
  const updateIncomeLocal = useFinanceStore((s) => s.updateIncome)
  const updateExpenseLocal = useFinanceStore((s) => s.updateExpense)
  const deleteIncomeLocal = useFinanceStore((s) => s.deleteIncome)
  const deleteExpenseLocal = useFinanceStore((s) => s.deleteExpense)

  const isSupabaseMode = Boolean(user)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseMode) return
    setLoading(true)
    setError(null)
    try {
      const { transactions: txs } = await fetchActiveFinanceData({ limit: 2000 })
      setTransactions(txs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }, [isSupabaseMode])

  useEffect(() => {
    if (isSupabaseMode) {
      void refresh()
    } else {
      setTransactions([])
      setError(null)
    }
  }, [isSupabaseMode, refresh])

  const { incomes, expenses, unified } = useMemo(() => {
    if (!isSupabaseMode) {
      return {
        incomes: storeIncomes,
        expenses: storeExpenses,
        unified: [
          ...storeIncomes.map((i) => ({
            id: i.id,
            type: 'income' as const,
            date: i.date,
            label: i.source,
            category: i.source,
            amount: i.amount,
            currency: i.currency,
            account: i.account,
            description: i.source,
            notes: i.notes,
          })),
          ...storeExpenses.map((e) => ({
            id: e.id,
            type: 'expense' as const,
            date: e.date,
            label: e.detail,
            category: e.category,
            amount: e.amount,
            currency: e.currency,
            account: e.paymentMethod,
            description: e.detail,
            notes: e.notes,
          })),
        ],
      }
    }

    const split = splitTransactions(transactions)
    return {
      ...split,
      unified: transactions.map(toUnifiedTransaction),
    }
  }, [isSupabaseMode, storeIncomes, storeExpenses, transactions])

  const addIncome = useCallback(
    async (data: Omit<Income, 'id'>) => {
      if (!isSupabaseMode) {
        addIncomeLocal(data)
        const created = useFinanceStore.getState().incomes.at(-1)
        if (!created) throw new Error('No se pudo crear el ingreso')
        return created
      }
      const { income } = await addIncomeRecord(data)
      await refresh()
      return income
    },
    [isSupabaseMode, addIncomeLocal, refresh]
  )

  const addExpense = useCallback(
    async (data: Omit<Expense, 'id'>) => {
      if (!isSupabaseMode) {
        addExpenseLocal(data)
        const created = useFinanceStore.getState().expenses.at(-1)
        if (!created) throw new Error('No se pudo crear el gasto')
        return created
      }
      const { expense } = await addExpenseRecord(data)
      await refresh()
      return expense
    },
    [isSupabaseMode, addExpenseLocal, refresh]
  )

  const updateIncome = useCallback(
    async (id: string, data: Omit<Income, 'id'>) => {
      if (!isSupabaseMode) {
        updateIncomeLocal(id, data)
        return { id, ...data }
      }
      const { income } = await correctIncomeRecord(id, data)
      await refresh()
      return income
    },
    [isSupabaseMode, updateIncomeLocal, refresh]
  )

  const updateExpense = useCallback(
    async (id: string, data: Omit<Expense, 'id'>) => {
      if (!isSupabaseMode) {
        updateExpenseLocal(id, data)
        return { id, ...data }
      }
      const { expense } = await correctExpenseRecord(id, data)
      await refresh()
      return expense
    },
    [isSupabaseMode, updateExpenseLocal, refresh]
  )

  const deleteIncome = useCallback(
    async (id: string) => {
      if (!isSupabaseMode) {
        deleteIncomeLocal(id)
        return
      }
      await voidIncomeRecord(id)
      await refresh()
    },
    [isSupabaseMode, deleteIncomeLocal, refresh]
  )

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!isSupabaseMode) {
        deleteExpenseLocal(id)
        return
      }
      await voidExpenseRecord(id)
      await refresh()
    },
    [isSupabaseMode, deleteExpenseLocal, refresh]
  )

  const value = useMemo(
    () => ({
      incomes,
      expenses,
      unified,
      loading,
      error,
      isSupabaseMode,
      refresh,
      addIncome,
      addExpense,
      updateIncome,
      updateExpense,
      deleteIncome,
      deleteExpense,
    }),
    [
      incomes,
      expenses,
      unified,
      loading,
      error,
      isSupabaseMode,
      refresh,
      addIncome,
      addExpense,
      updateIncome,
      updateExpense,
      deleteIncome,
      deleteExpense,
    ]
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) {
    throw new Error('useTransactions debe usarse dentro de TransactionsProvider')
  }
  return ctx
}