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
import { isDemoUser } from '@/lib/demo'
import { investmentToHolding } from '@/lib/mappers'
import {
  createInvestment,
  deleteInvestment,
  getInvestments,
  updateInvestment,
  type CreateInvestmentInput,
  type UpdateInvestmentInput,
} from '@/lib/investments'
import { useFinanceStore } from '@/store/financeStore'
import type { Investment } from '@/types/database'
import type { InvestmentHolding } from '@/types/finance'

interface InvestmentsContextValue {
  investments: Investment[]
  holdings: InvestmentHolding[]
  loading: boolean
  error: string | null
  isSupabaseMode: boolean
  refresh: () => Promise<void>
  addInvestment: (input: CreateInvestmentInput) => Promise<Investment>
  updateInvestment: (
    id: string,
    input: UpdateInvestmentInput
  ) => Promise<Investment>
  deleteInvestment: (id: string) => Promise<void>
}

const InvestmentsContext = createContext<InvestmentsContextValue | undefined>(
  undefined
)

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const storeHoldings = useFinanceStore((s) => s.holdings)
  const addHoldingLocal = useFinanceStore((s) => s.addHolding)
  const updateHoldingLocal = useFinanceStore((s) => s.updateHolding)
  const deleteHoldingLocal = useFinanceStore((s) => s.deleteHolding)

  const isSupabaseMode = Boolean(user) && !isDemoUser(user)

  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseMode) return
    setLoading(true)
    setError(null)
    try {
      const rows = await getInvestments()
      setInvestments(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inversiones')
    } finally {
      setLoading(false)
    }
  }, [isSupabaseMode])

  useEffect(() => {
    if (isSupabaseMode) {
      void refresh()
    } else {
      setInvestments([])
      setError(null)
    }
  }, [isSupabaseMode, refresh])

  const holdings = useMemo(() => {
    if (!isSupabaseMode) return storeHoldings
    return investments.map(investmentToHolding)
  }, [isSupabaseMode, storeHoldings, investments])

  const addInvestment = useCallback(
    async (input: CreateInvestmentInput) => {
      if (!isSupabaseMode) {
        addHoldingLocal({
          ticker: input.asset,
          platform: input.platform,
          units: input.quantity,
          avgPrice: input.buy_price,
          currentPrice: input.current_price,
        })
        const created = useFinanceStore.getState().holdings.at(-1)
        if (!created) throw new Error('No se pudo crear la inversión')
        return {
          id: created.id,
          user_id: 'local',
          asset: created.ticker,
          platform: created.platform,
          quantity: created.units,
          buy_price: created.avgPrice,
          current_price: created.currentPrice,
          currency: input.currency ?? 'USD',
          notes: input.notes ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      const created = await createInvestment(input)
      await refresh()
      return created
    },
    [isSupabaseMode, addHoldingLocal, refresh]
  )

  const updateInvestmentFn = useCallback(
    async (id: string, input: UpdateInvestmentInput) => {
      if (!isSupabaseMode) {
        updateHoldingLocal(id, {
          ticker: input.asset,
          platform: input.platform,
          units: input.quantity,
          avgPrice: input.buy_price,
          currentPrice: input.current_price,
        })
        const updated = useFinanceStore.getState().holdings.find((h) => h.id === id)
        if (!updated) throw new Error('Inversión no encontrada')
        return {
          id: updated.id,
          user_id: 'local',
          asset: updated.ticker,
          platform: updated.platform,
          quantity: updated.units,
          buy_price: updated.avgPrice,
          current_price: updated.currentPrice,
          currency: input.currency ?? 'USD',
          notes: input.notes ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      const updated = await updateInvestment(id, input)
      await refresh()
      return updated
    },
    [isSupabaseMode, updateHoldingLocal, refresh]
  )

  const deleteInvestmentFn = useCallback(
    async (id: string) => {
      if (!isSupabaseMode) {
        deleteHoldingLocal(id)
        return
      }
      await deleteInvestment(id)
      await refresh()
    },
    [isSupabaseMode, deleteHoldingLocal, refresh]
  )

  const value = useMemo(
    () => ({
      investments,
      holdings,
      loading,
      error,
      isSupabaseMode,
      refresh,
      addInvestment,
      updateInvestment: updateInvestmentFn,
      deleteInvestment: deleteInvestmentFn,
    }),
    [
      investments,
      holdings,
      loading,
      error,
      isSupabaseMode,
      refresh,
      addInvestment,
      updateInvestmentFn,
      deleteInvestmentFn,
    ]
  )

  return (
    <InvestmentsContext.Provider value={value}>
      {children}
    </InvestmentsContext.Provider>
  )
}

export function useInvestments() {
  const ctx = useContext(InvestmentsContext)
  if (!ctx) {
    throw new Error('useInvestments debe usarse dentro de InvestmentsProvider')
  }
  return ctx
}