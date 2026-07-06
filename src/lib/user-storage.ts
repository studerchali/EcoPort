import type { User } from '@supabase/supabase-js'
import { isDemoUser } from '@/lib/demo'

export const LEGACY_STORAGE_KEY = 'ecoport-v1'
/** v2: datos demo ficticios; la clave anterior queda obsoleta (sin datos personales). */
export const STORAGE_KEY_PREFIX = 'ecoport-v2'

export type StorageScope = 'guest' | 'demo' | `user:${string}`

export function getStorageKey(scope: StorageScope): string {
  if (scope === 'guest') return `${STORAGE_KEY_PREFIX}-guest`
  if (scope === 'demo') return `${STORAGE_KEY_PREFIX}-demo`
  return `${STORAGE_KEY_PREFIX}-${scope.slice(5)}`
}

export function resolveStorageScope(user: User | null | undefined): StorageScope {
  if (!user) return 'guest'
  if (isDemoUser(user)) return 'demo'
  return `user:${user.id}`
}

/** Usuarios reales: transacciones e inversiones viven en Supabase (RLS por user_id). */
export function usesRemoteData(scope: StorageScope): boolean {
  return scope.startsWith('user:')
}

interface LegacyPersistedState {
  savedAccounts?: string[]
  selectedYear?: number
  settings?: unknown
  accountBalances?: unknown
  debts?: unknown
  fixedIncome?: unknown
  balanceHistory?: unknown
  incomes?: unknown
  expenses?: unknown
  holdings?: unknown
}

function readLegacyState(): LegacyPersistedState | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: LegacyPersistedState }
    return parsed.state ?? (parsed as LegacyPersistedState)
  } catch {
    return null
  }
}

/** Migra la clave global antigua a almacenamiento por usuario (una sola vez). */
export function migrateLegacyStorage(targetKey: string, scope: StorageScope): void {
  if (localStorage.getItem(targetKey)) return

  const legacy = readLegacyState()
  if (!legacy) return

  const remote = usesRemoteData(scope)

  const state = remote
    ? {
        savedAccounts: legacy.savedAccounts ?? [],
        selectedYear: legacy.selectedYear ?? 2026,
        settings: legacy.settings,
        accountBalances: legacy.accountBalances,
        debts: legacy.debts,
        fixedIncome: legacy.fixedIncome,
        balanceHistory: legacy.balanceHistory,
      }
    : legacy

  localStorage.setItem(
    targetKey,
    JSON.stringify({ state, version: 0 })
  )
}