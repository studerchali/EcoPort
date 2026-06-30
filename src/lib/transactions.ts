/**
 * Capa de acceso a Supabase para transacciones (libro mayor inmutable).
 * Solo INSERT + SELECT; correcciones y bajas vía reversal_of_id (ver reverseTransaction).
 * RLS en Postgres garantiza que user_id = auth.uid().
 */
import { supabase } from '@/lib/supabase'
import type {
  CreateTransactionInput,
  Database,
  DbCurrency,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '@/types/database'

type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export class TransactionError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'TransactionError'
    this.code = code
  }
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new TransactionError(error.message, error.name)
  if (!user) throw new TransactionError('Usuario no autenticado', 'UNAUTHENTICATED')
  return user.id
}

function mapRow(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as TransactionType,
    amount: Number(row.amount),
    currency: row.currency as Transaction['currency'],
    category_id: (row.category_id as string) ?? null,
    category_name: row.category_name as string,
    date: row.date as string,
    description: (row.description as string) ?? '',
    account: (row.account as string) ?? null,
    investment_related: Boolean(row.investment_related),
    reversal_of_id: (row.reversal_of_id as string) ?? null,
    metadata: (row.metadata ?? {}) as Transaction['metadata'],
    created_at: row.created_at as string,
  }
}

/** Transacción activa = no es reversión y no fue anulada */
export function isActiveTransaction(
  tx: Transaction,
  reversedIds: Set<string>
): boolean {
  return tx.reversal_of_id === null && !reversedIds.has(tx.id)
}

/**
 * Crea una transacción (INSERT únicamente — inmutable).
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  if (input.amount <= 0) {
    throw new TransactionError('El monto debe ser mayor que 0')
  }

  const userId = await requireUserId()

  const row: TransactionInsert = {
    user_id: userId,
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? 'EUR',
    category_id: input.category_id ?? null,
    category_name: input.category_name,
    date: input.date,
    description: input.description ?? '',
    account: input.account ?? null,
    investment_related: input.investment_related ?? false,
    metadata: input.metadata ?? {},
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(row)
    .select()
    .single()

  if (error) throw new TransactionError(error.message, error.code)
  return mapRow(data)
}

/**
 * Lista transacciones del usuario con filtros opcionales.
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const userId = await requireUserId()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.type) query = query.eq('type', filters.type)
  if (filters.currency) query = query.eq('currency', filters.currency)
  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.investment_related !== undefined) {
    query = query.eq('investment_related', filters.investment_related)
  }
  if (filters.year) {
    const start = `${filters.year}-01-01`
    const end = `${filters.year}-12-31`
    query = query.gte('date', start).lte('date', end)
  }
  if (filters.month && filters.year) {
    const m = String(filters.month).padStart(2, '0')
    const start = `${filters.year}-${m}-01`
    const lastDay = new Date(filters.year, filters.month, 0).getDate()
    const end = `${filters.year}-${m}-${String(lastDay).padStart(2, '0')}`
    query = query.gte('date', start).lte('date', end)
  }

  const limit = filters.limit ?? 500
  const offset = filters.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) throw new TransactionError(error.message, error.code)
  return (data ?? []).map(mapRow)
}

/**
 * Obtiene una transacción por ID (solo si pertenece al usuario).
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new TransactionError(error.message, error.code)
  return data ? mapRow(data) : null
}

/**
 * Anula una transacción insertando una reversión (patrón inmutable).
 * No modifica ni elimina el registro original.
 */
export async function reverseTransaction(
  transactionId: string,
  reason?: string
): Promise<Transaction> {
  const original = await getTransactionById(transactionId)
  if (!original) {
    throw new TransactionError('Transacción no encontrada', 'NOT_FOUND')
  }
  if (original.reversal_of_id) {
    throw new TransactionError(
      'No se puede anular una transacción de reversión',
      'INVALID_OPERATION'
    )
  }

  const userId = await requireUserId()

  const { data: existingReversal } = await supabase
    .from('transactions')
    .select('id')
    .eq('reversal_of_id', transactionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingReversal) {
    throw new TransactionError(
      'Esta transacción ya fue anulada',
      'ALREADY_REVERSED'
    )
  }

  const oppositeType: TransactionType =
    original.type === 'income' ? 'expense' : 'income'

  const reversalRow: TransactionInsert = {
    user_id: userId,
    type: oppositeType,
    amount: original.amount,
    currency: original.currency,
    category_id: original.category_id,
    category_name: original.category_name,
    date: new Date().toISOString().slice(0, 10),
    description: reason ?? `Anulación de transacción ${transactionId.slice(0, 8)}`,
    account: original.account,
    investment_related: original.investment_related,
    reversal_of_id: transactionId,
    metadata: { reversal_reason: reason ?? null },
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(reversalRow)
    .select()
    .single()

  if (error) throw new TransactionError(error.message, error.code)
  return mapRow(data)
}

/**
 * Transacciones activas (excluye anuladas y reversiones).
 */
export async function getActiveTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const all = await getTransactions(filters)
  const reversedIds = new Set(
    all.filter((t) => t.reversal_of_id).map((t) => t.reversal_of_id as string)
  )
  return all.filter((t) => isActiveTransaction(t, reversedIds))
}

/**
 * Totales derivados desde transacciones activas (fuente de verdad).
 */
export async function getTransactionTotals(
  year: number,
  currency: DbCurrency = 'EUR'
): Promise<{ income: number; expense: number; net: number }> {
  const txs = await getActiveTransactions({ year, currency })
  const income = txs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const expense = txs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  return { income, expense, net: income - expense }
}