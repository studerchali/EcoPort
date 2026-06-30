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
import { isMissingTableError } from '@/lib/supabase-errors'
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
  importHoldings: (
    holdings: Omit<InvestmentHolding, 'id'>[],
    strategy: 'replace' | 'merge'
  ) => Promise<void>
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
  const importHoldingsLocal = useFinanceStore((s) => s.importHoldings)

  const wantsSupabase = Boolean(user) && !isDemoUser(user)
  const [supabaseSchemaMissing, setSupabaseSchemaMissing] = useState(false)
  const useRemoteDb = wantsSupabase && !supabaseSchemaMissing

  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wantsSupabase) {
      setSupabaseSchemaMissing(false)
    }
  }, [wantsSupabase])

  const refresh = useCallback(async () => {
    if (!useRemoteDb) return
    setLoading(true)
    setError(null)
    try {
      const rows = await getInvestments()
      setInvestments(rows)
    } catch (err) {
      if (isMissingTableError(err)) {
        setSupabaseSchemaMissing(true)
        setInvestments([])
        setError(null)
        return
      }
      setError(err instanceof Error ? err.message : 'Error al cargar inversiones')
    } finally {
      setLoading(false)
    }
  }, [useRemoteDb])

  useEffect(() => {
    if (useRemoteDb) {
      void refresh()
    } else {
      setInvestments([])
      setError(null)
      setLoading(false)
    }
  }, [useRemoteDb, refresh])

  const holdings = useMemo(() => {
    if (!useRemoteDb) return storeHoldings
    return investments.map(investmentToHolding)
  }, [useRemoteDb, storeHoldings, investments])

  const addInvestment = useCallback(
    async (input: CreateInvestmentInput) => {
      if (!useRemoteDb) {
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
      try {
        const created = await createInvestment(input)
        await refresh()
        return created
      } catch (err) {
        if (isMissingTableError(err)) {
          setSupabaseSchemaMissing(true)
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
        throw err
      }
    },
    [useRemoteDb, addHoldingLocal, refresh]
  )

  const updateInvestmentFn = useCallback(
    async (id: string, input: UpdateInvestmentInput) => {
      if (!useRemoteDb) {
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
      try {
        const updated = await updateInvestment(id, input)
        await refresh()
        return updated
      } catch (err) {
        if (isMissingTableError(err)) {
          setSupabaseSchemaMissing(true)
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
        throw err
      }
    },
    [useRemoteDb, updateHoldingLocal, refresh]
  )

  const deleteInvestmentFn = useCallback(
    async (id: string) => {
      if (!useRemoteDb) {
        deleteHoldingLocal(id)
        return
      }
      try {
        await deleteInvestment(id)
        await refresh()
      } catch (err) {
        if (isMissingTableError(err)) {
          setSupabaseSchemaMissing(true)
          deleteHoldingLocal(id)
          return
        }
        throw err
      }
    },
    [useRemoteDb, deleteHoldingLocal, refresh]
  )

  const importHoldingsFn = useCallback(
    async (
      holdingsToImport: Omit<InvestmentHolding, 'id'>[],
      strategy: 'replace' | 'merge'
    ) => {
      const importLocal = () => {
        importHoldingsLocal(holdingsToImport, strategy)
      }

      if (!useRemoteDb) {
        importLocal()
        return
      }

      try {
        const existingRows = await getInvestments()

        if (strategy === 'replace') {
          for (const inv of existingRows) {
            await deleteInvestment(inv.id)
          }
        }

        const mergeBase = strategy === 'merge' ? existingRows : []

        for (const h of holdingsToImport) {
          const existing = mergeBase.find(
            (inv) => inv.asset === h.ticker && inv.platform === h.platform
          )
          if (existing) {
            await updateInvestment(existing.id, {
              asset: h.ticker,
              platform: h.platform,
              quantity: h.units,
              buy_price: h.avgPrice,
              current_price: h.currentPrice,
              currency: 'USD',
            })
          } else {
            await createInvestment({
              asset: h.ticker,
              platform: h.platform,
              quantity: h.units,
              buy_price: h.avgPrice,
              current_price: h.currentPrice,
              currency: 'USD',
            })
          }
        }

        await refresh()
      } catch (err) {
        if (isMissingTableError(err)) {
          setSupabaseSchemaMissing(true)
          importLocal()
          return
        }
        throw err
      }
    },
    [useRemoteDb, importHoldingsLocal, refresh]
  )

  const value = useMemo(
    () => ({
      investments,
      holdings,
      loading,
      error,
      isSupabaseMode: useRemoteDb,
      refresh,
      addInvestment,
      updateInvestment: updateInvestmentFn,
      deleteInvestment: deleteInvestmentFn,
      importHoldings: importHoldingsFn,
    }),
    [
      investments,
      holdings,
      loading,
      error,
      useRemoteDb,
      refresh,
      addInvestment,
      updateInvestmentFn,
      deleteInvestmentFn,
      importHoldingsFn,
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