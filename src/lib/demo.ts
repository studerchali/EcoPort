import { seedData } from '@/data/seed'
import { getDemoCredentials } from '@/lib/env'
import { useFinanceStore } from '@/store/financeStore'
import type { User } from '@supabase/supabase-js'

export function isDemoUser(user: User | null | undefined): boolean {
  if (!user?.email) return false
  const creds = getDemoCredentials()
  if (!creds) return false
  return user.email.toLowerCase() === creds.email.toLowerCase()
}

/** Carga datos de ejemplo en localStorage para la sesión demo. */
export function loadDemoSeedData(): void {
  useFinanceStore.getState().importData(seedData, true)
  useFinanceStore.getState().setSelectedYear(2026)
}