/**
 * Estado local (Zustand + persist). Usuarios autenticados: solo preferencias.
 * Transacciones e inversiones reales viven en Supabase vía contexts.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Income,
  Expense,
  FinanceData,
  InvestmentHolding,
  FixedIncomeAccount,
  Debt,
  AppSettings,
} from '@/types/finance'
import { seedData } from '@/data/seed'
import { rememberAccountInList } from '@/lib/accounts'
import {
  getStorageKey,
  migrateLegacyStorage,
  usesRemoteData,
  type StorageScope,
} from '@/lib/user-storage'

interface FinanceState extends FinanceData {
  savedAccounts: string[]
  selectedYear: number
  storageScope: StorageScope
  hideSensitiveData: boolean
  toggleHideSensitiveData: () => void
  setSelectedYear: (year: number) => void
  rememberAccount: (account: string) => void
  addIncome: (income: Omit<Income, 'id'>) => void
  updateIncome: (id: string, income: Partial<Income>) => void
  deleteIncome: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  updateHolding: (id: string, holding: Partial<InvestmentHolding>) => void
  addHolding: (holding: Omit<InvestmentHolding, 'id'>) => void
  deleteHolding: (id: string) => void
  addHoldings: (holdings: Omit<InvestmentHolding, 'id'>[]) => void
  importHoldings: (
    holdings: Omit<InvestmentHolding, 'id'>[],
    strategy: 'replace' | 'merge'
  ) => void
  updateFixedIncome: (id: string, account: Partial<FixedIncomeAccount>) => void
  updateDebt: (id: string, debt: Partial<Debt>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  importData: (data: FinanceData, replace?: boolean) => void
  resetToSeed: () => void
  getExportData: () => FinanceData
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const emptyTransactional = {
  incomes: [] as Income[],
  expenses: [] as Expense[],
  holdings: [] as InvestmentHolding[],
}

function preferencesPartialize(state: FinanceState) {
  return {
    savedAccounts: state.savedAccounts,
    selectedYear: state.selectedYear,
    settings: state.settings,
    accountBalances: state.accountBalances,
    debts: state.debts,
    fixedIncome: state.fixedIncome,
    balanceHistory: state.balanceHistory,
    storageScope: state.storageScope,
    hideSensitiveData: state.hideSensitiveData,
  }
}

function fullPartialize(state: FinanceState) {
  return {
    ...preferencesPartialize(state),
    incomes: state.incomes,
    expenses: state.expenses,
    holdings: state.holdings,
  }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...seedData,
      savedAccounts: seedData.savedAccounts ?? [],
      selectedYear: 2026,
      storageScope: 'guest' as StorageScope,
      hideSensitiveData: false,

      toggleHideSensitiveData: () =>
        set((state) => ({ hideSensitiveData: !state.hideSensitiveData })),

      setSelectedYear: (year) => set({ selectedYear: year }),

      rememberAccount: (account) =>
        set((state) => ({
          savedAccounts: rememberAccountInList(state.savedAccounts, account),
        })),

      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: generateId('inc') }],
          savedAccounts: rememberAccountInList(state.savedAccounts, income.account),
        })),

      updateIncome: (id, income) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...income } : i
          ),
          savedAccounts: income.account
            ? rememberAccountInList(state.savedAccounts, income.account)
            : state.savedAccounts,
        })),

      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: generateId('exp') }],
          savedAccounts: rememberAccountInList(
            state.savedAccounts,
            expense.paymentMethod
          ),
        })),

      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
          savedAccounts: expense.paymentMethod
            ? rememberAccountInList(state.savedAccounts, expense.paymentMethod)
            : state.savedAccounts,
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      updateHolding: (id, holding) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.id === id ? { ...h, ...holding } : h
          ),
        })),

      addHolding: (holding) =>
        set((state) => ({
          holdings: [
            ...state.holdings,
            { ...holding, id: generateId('hold') },
          ],
        })),

      deleteHolding: (id) =>
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        })),

      addHoldings: (holdings) =>
        set((state) => ({
          holdings: [
            ...state.holdings,
            ...holdings.map((h) => ({ ...h, id: generateId('hold') })),
          ],
        })),

      importHoldings: (holdings, strategy) =>
        set((state) => {
          if (strategy === 'replace') {
            return {
              holdings: holdings.map((h) => ({
                ...h,
                id: generateId('hold'),
              })),
            }
          }
          const map = new Map(
            state.holdings.map((h) => [`${h.ticker}|${h.platform}`, h])
          )
          for (const h of holdings) {
            const key = `${h.ticker}|${h.platform}`
            const existing = map.get(key)
            if (existing) {
              map.set(key, {
                ...existing,
                units: h.units,
                avgPrice: h.avgPrice,
                currentPrice: h.currentPrice,
              })
            } else {
              map.set(key, { ...h, id: generateId('hold') })
            }
          }
          return { holdings: Array.from(map.values()) }
        }),

      updateFixedIncome: (id, account) =>
        set((state) => ({
          fixedIncome: state.fixedIncome.map((f) =>
            f.id === id ? { ...f, ...account } : f
          ),
        })),

      updateDebt: (id, debt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...debt } : d
          ),
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      importData: (data, replace = true) =>
        set((state) => {
          const mergedAccounts = [
            ...(data.savedAccounts ?? []),
            ...data.incomes.map((i) => i.account),
            ...data.expenses.map((e) => e.paymentMethod),
          ]
          let savedAccounts = state.savedAccounts
          for (const account of mergedAccounts) {
            savedAccounts = rememberAccountInList(savedAccounts, account)
          }

          if (replace) {
            return {
              ...data,
              savedAccounts: data.savedAccounts ?? savedAccounts,
              selectedYear: state.selectedYear,
              storageScope: state.storageScope,
            }
          }

          return {
            incomes: [...state.incomes, ...data.incomes],
            expenses: [...state.expenses, ...data.expenses],
            accountBalances: data.accountBalances,
            debts: data.debts,
            holdings: data.holdings,
            fixedIncome: data.fixedIncome,
            balanceHistory: data.balanceHistory,
            settings: data.settings,
            savedAccounts,
            storageScope: state.storageScope,
          }
        }),

      resetToSeed: () =>
        set({
          ...seedData,
          savedAccounts: seedData.savedAccounts ?? [],
          selectedYear: 2026,
          storageScope: get().storageScope,
        }),

      getExportData: () => {
        const {
          incomes,
          expenses,
          accountBalances,
          debts,
          holdings,
          fixedIncome,
          balanceHistory,
          settings,
          savedAccounts,
        } = get()
        return {
          incomes,
          expenses,
          accountBalances,
          debts,
          holdings,
          fixedIncome,
          balanceHistory,
          settings,
          savedAccounts,
        }
      },
    }),
    {
      name: getStorageKey('guest'),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        usesRemoteData(state.storageScope)
          ? preferencesPartialize(state)
          : fullPartialize(state),
    }
  )
)

let rebindPromise: Promise<void> | null = null
let lastBoundScope: StorageScope | null = null

/** Cambia el almacenamiento local al usuario actual (preferencias por cuenta). */
export async function rebindFinanceStore(scope: StorageScope): Promise<void> {
  if (lastBoundScope === scope && rebindPromise === null) return

  if (rebindPromise) {
    await rebindPromise
    if (lastBoundScope === scope) return
  }

  rebindPromise = (async () => {
    const key = getStorageKey(scope)
    const remote = usesRemoteData(scope)

    migrateLegacyStorage(key, scope)

    useFinanceStore.persist.setOptions({
      name: key,
      partialize: (state) =>
        remote ? preferencesPartialize(state) : fullPartialize(state),
    })

    useFinanceStore.setState({
      storageScope: scope,
      ...(remote ? emptyTransactional : {}),
    })

    await useFinanceStore.persist.rehydrate()
    useFinanceStore.setState({ storageScope: scope })
    lastBoundScope = scope
  })()

  try {
    await rebindPromise
  } finally {
    rebindPromise = null
  }
}