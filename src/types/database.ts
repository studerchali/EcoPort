/**
 * Tipos generados manualmente alineados con supabase/migrations/001_initial_schema.sql
 * Regenerar con `supabase gen types typescript` cuando uses la CLI.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TransactionType = 'income' | 'expense'
export type CategoryKind = 'income' | 'expense' | 'both'
export type DbCurrency = 'EUR' | 'USD' | 'ARS'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  default_currency: DbCurrency
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  slug: string
  kind: CategoryKind
  color: string | null
  icon: string | null
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: DbCurrency
  category_id: string | null
  category_name: string
  date: string
  description: string
  account: string | null
  investment_related: boolean
  reversal_of_id: string | null
  metadata: Json
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  asset: string
  platform: string
  quantity: number
  buy_price: number
  current_price: number
  currency: DbCurrency
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Balance {
  id: string
  user_id: string
  period_year: number
  period_month: number
  currency: DbCurrency
  income_total: number
  expense_total: number
  net_balance: number
  computed_at: string
}

/** Payload para crear una transacción (inmutable — solo INSERT) */
export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  currency?: DbCurrency
  category_id?: string | null
  category_name: string
  date: string
  description?: string
  account?: string | null
  investment_related?: boolean
  metadata?: Json
}

/** Payload para anular una transacción (inserta reversión) */
export interface ReverseTransactionInput {
  transaction_id: string
  reason?: string
}

export interface TransactionFilters {
  type?: TransactionType
  currency?: DbCurrency
  category_id?: string
  year?: number
  month?: number
  investment_related?: boolean
  limit?: number
  offset?: number
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: Profile & Record<string, unknown>
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      categories: {
        Row: Category & Record<string, unknown>
        Insert: Omit<Category, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      transactions: {
        Row: Transaction & Record<string, unknown>
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          amount: number
          currency?: DbCurrency
          category_id?: string | null
          category_name: string
          date: string
          description?: string
          account?: string | null
          investment_related?: boolean
          reversal_of_id?: string | null
          metadata?: Json
          created_at?: string
        } & Record<string, unknown>
        Update: Record<string, never>
        Relationships: []
      }
      investments: {
        Row: Investment & Record<string, unknown>
        Insert: Omit<Investment, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      balances: {
        Row: Balance & Record<string, unknown>
        Insert: Omit<Balance, 'id' | 'computed_at'> & {
          id?: string
          computed_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Balance, 'id' | 'user_id'>> & Record<string, unknown>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

/** Enums de Postgres (referencia; no forman parte de GenericSchema) */
export type DatabaseEnums = {
  transaction_type: TransactionType
  category_kind: CategoryKind
}