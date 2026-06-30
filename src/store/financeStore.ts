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

interface FinanceState extends FinanceData {
  selectedYear: number
  setSelectedYear: (year: number) => void
  addIncome: (income: Omit<Income, 'id'>) => void
  updateIncome: (id: string, income: Partial<Income>) => void
  deleteIncome: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  updateHolding: (id: string, holding: Partial<InvestmentHolding>) => void
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

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...seedData,
      selectedYear: 2026,

      setSelectedYear: (year) => set({ selectedYear: year }),

      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: generateId('inc') }],
        })),

      updateIncome: (id, income) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...income } : i
          ),
        })),

      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: generateId('exp') }],
        })),

      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
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
        set((state) =>
          replace
            ? { ...data, selectedYear: state.selectedYear }
            : {
                incomes: [...state.incomes, ...data.incomes],
                expenses: [...state.expenses, ...data.expenses],
                accountBalances: data.accountBalances,
                debts: data.debts,
                holdings: data.holdings,
                fixedIncome: data.fixedIncome,
                balanceHistory: data.balanceHistory,
                settings: data.settings,
              }
        ),

      resetToSeed: () => set({ ...seedData, selectedYear: 2026 }),

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
        }
      },
    }),
    {
      name: 'ecoport-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        incomes: state.incomes,
        expenses: state.expenses,
        accountBalances: state.accountBalances,
        debts: state.debts,
        holdings: state.holdings,
        fixedIncome: state.fixedIncome,
        balanceHistory: state.balanceHistory,
        settings: state.settings,
        selectedYear: state.selectedYear,
      }),
    }
  )
)