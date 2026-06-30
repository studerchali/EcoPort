export type Currency = 'EUR' | 'USD' | 'ARS'

export type IncomeSource =
  | 'Salario'
  | 'Freelance'
  | 'Inversiones'
  | 'Alquiler'
  | 'Venta'
  | 'Regalo'
  | 'Reembolso'
  | 'Otro'

export type ExpenseCategory =
  | 'Vivienda'
  | 'Alimentación'
  | 'Transporte'
  | 'Salud'
  | 'Educación'
  | 'Ocio'
  | 'Ropa y calzado'
  | 'Suscripciones'
  | 'Servicios'
  | 'Otro'

/** Cuenta definida por el usuario (texto libre). */
export type AccountName = string

export interface Income {
  id: string
  date: string
  source: string
  amount: number
  currency: Currency
  account: AccountName
  notes: string
}

export interface Expense {
  id: string
  date: string
  category: ExpenseCategory | string
  detail: string
  amount: number
  currency: Currency
  paymentMethod: AccountName
  notes: string
}

export interface AccountBalance {
  account: AccountName
  amount: number
  currency: Currency
}

export interface Debt {
  id: string
  name: string
  amount: number
  currency: Currency
}

export interface InvestmentHolding {
  id: string
  ticker: string
  platform: string
  units: number
  avgPrice: number
  currentPrice: number
}

export interface FixedIncomeAccount {
  id: string
  bank: string
  type: string
  capital: number
  annualRate: number
}

export interface BalanceSnapshot {
  date: string
  balanceUSD: number
  debtUSD: number
  balanceEUR: number
  debtEUR: number
}

export interface ProjectionSettings {
  initialCapital: number
  monthlyContribution: number
  annualGrowthRate: number
  years: number
}

export interface ExchangeRates {
  EUR: number
  USD: number
  ARS: number
}

export interface AppSettings {
  defaultCurrency: Currency
  exchangeRates: ExchangeRates
  fiscalYear: number
  projection: ProjectionSettings
}

export interface FinanceData {
  incomes: Income[]
  expenses: Expense[]
  accountBalances: AccountBalance[]
  debts: Debt[]
  holdings: InvestmentHolding[]
  fixedIncome: FixedIncomeAccount[]
  balanceHistory: BalanceSnapshot[]
  settings: AppSettings
  savedAccounts?: string[]
}

export const INCOME_SOURCES: IncomeSource[] = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Alquiler',
  'Venta',
  'Regalo',
  'Reembolso',
  'Otro',
]

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Salud',
  'Educación',
  'Ocio',
  'Ropa y calzado',
  'Suscripciones',
  'Servicios',
  'Otro',
]

export const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const