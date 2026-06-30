import { AlertTriangle } from 'lucide-react'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useInvestments } from '@/contexts/InvestmentsContext'
import { SCHEMA_SETUP_MESSAGE } from '@/lib/supabase-errors'

export function SchemaSetupBanner() {
  const { error: txError, isSupabaseMode: txRemote } = useTransactions()
  const { error: invError, isSupabaseMode: invRemote } = useInvestments()

  const schemaError =
    (txRemote && txError === SCHEMA_SETUP_MESSAGE) ||
    (invRemote && invError === SCHEMA_SETUP_MESSAGE)

  if (!schemaError) return null

  return (
    <div
      role="alert"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <strong>Base de datos pendiente.</strong> Tus datos no se guardarán en la
          nube hasta aplicar la migración{' '}
          <code className="rounded bg-amber-500/15 px-1 text-xs">
            supabase/migrations/001_initial_schema.sql
          </code>{' '}
          en el SQL Editor de Supabase.
        </p>
      </div>
    </div>
  )
}