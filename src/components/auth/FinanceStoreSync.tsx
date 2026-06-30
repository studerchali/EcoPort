import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { loadDemoSeedData } from '@/lib/demo'
import { ensureUserProfile } from '@/lib/profile'
import {
  resolveStorageScope,
  usesRemoteData,
} from '@/lib/user-storage'
import { rebindFinanceStore } from '@/store/financeStore'

/** Sincroniza localStorage y estado local con la cuenta autenticada. */
export function FinanceStoreSync() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    const scope = resolveStorageScope(user)

    void (async () => {
      await rebindFinanceStore(scope)

      if (user && usesRemoteData(scope)) {
        await ensureUserProfile(user)
      }

      if (user?.email && scope === 'demo') {
        loadDemoSeedData()
      }
    })()
  }, [user, loading])

  return null
}