export type Currency = 'EUR' | 'USD' | 'ARS'

export type ExpenseCategory =
  | 'Super'
  | 'Transporte'
  | 'Alquiler'
  | 'OCIO'
  | 'Comida'
  | 'Suscripciones'
  | 'Viaje'
  | 'Devolucion'
  | 'Otro'

export type AccountName =
  | 'Efectivo'
  | 'Santander'
  | 'Wells Fargo Checking'
  | 'Wells Fargo AC'
  | 'Capital One Savings'
  | 'Capital One Credit'
  | 'Discover Credit'
  | 'IBKR'
  | 'TradeRepublic'

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
  category: ExpenseCategory
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
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Super',
  'Transporte',
  'Alquiler',
  'OCIO',
  'Comida',
  'Suscripciones',
  'Viaje',
  'Devolucion',
  'Otro',
]

export const ACCOUNTS: AccountName[] = [
  'Efectivo',
  'Santander',
  'Wells Fargo Checking',
  'Wells Fargo AC',
  'Capital One Savings',
  'Capital One Credit',
  'Discover Credit',
  'IBKR',
  'TradeRepublic',
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