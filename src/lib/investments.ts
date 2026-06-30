import { supabase } from '@/lib/supabase'
import type { Database, DbCurrency, Investment } from '@/types/database'

type InvestmentInsert = Database['public']['Tables']['investments']['Insert']
type InvestmentUpdate = Database['public']['Tables']['investments']['Update']

export interface CreateInvestmentInput {
  asset: string
  platform: string
  quantity: number
  buy_price: number
  current_price: number
  currency?: DbCurrency
  notes?: string | null
}

export interface UpdateInvestmentInput {
  asset?: string
  platform?: string
  quantity?: number
  buy_price?: number
  current_price?: number
  currency?: DbCurrency
  notes?: string | null
}

export class InvestmentError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'InvestmentError'
    this.code = code
  }
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new InvestmentError(error.message, error.name)
  if (!user) throw new InvestmentError('Usuario no autenticado', 'UNAUTHENTICATED')
  return user.id
}

function mapRow(row: Record<string, unknown>): Investment {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    asset: row.asset as string,
    platform: row.platform as string,
    quantity: Number(row.quantity),
    buy_price: Number(row.buy_price),
    current_price: Number(row.current_price),
    currency: row.currency as Investment['currency'],
    notes: (row.notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function getInvestments(): Promise<Investment[]> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('asset', { ascending: true })

  if (error) throw new InvestmentError(error.message, error.code)
  return (data ?? []).map(mapRow)
}

export async function createInvestment(
  input: CreateInvestmentInput
): Promise<Investment> {
  if (input.quantity < 0 || input.buy_price < 0 || input.current_price < 0) {
    throw new InvestmentError('Los valores deben ser mayores o iguales a 0')
  }
  if (!input.asset.trim() || !input.platform.trim()) {
    throw new InvestmentError('Activo y plataforma son obligatorios')
  }

  const userId = await requireUserId()

  const row: InvestmentInsert = {
    user_id: userId,
    asset: input.asset.trim(),
    platform: input.platform.trim(),
    quantity: input.quantity,
    buy_price: input.buy_price,
    current_price: input.current_price,
    currency: input.currency ?? 'USD',
    notes: input.notes ?? null,
  }

  const { data, error } = await supabase
    .from('investments')
    .insert(row)
    .select()
    .single()

  if (error) throw new InvestmentError(error.message, error.code)
  return mapRow(data)
}

export async function updateInvestment(
  id: string,
  input: UpdateInvestmentInput
): Promise<Investment> {
  const userId = await requireUserId()

  const row: InvestmentUpdate = {}
  if (input.asset !== undefined) row.asset = input.asset.trim()
  if (input.platform !== undefined) row.platform = input.platform.trim()
  if (input.quantity !== undefined) row.quantity = input.quantity
  if (input.buy_price !== undefined) row.buy_price = input.buy_price
  if (input.current_price !== undefined) row.current_price = input.current_price
  if (input.currency !== undefined) row.currency = input.currency
  if (input.notes !== undefined) row.notes = input.notes

  const { data, error } = await supabase
    .from('investments')
    .update(row)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new InvestmentError(error.message, error.code)
  return mapRow(data)
}

export async function deleteInvestment(id: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new InvestmentError(error.message, error.code)
}