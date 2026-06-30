import {
  format,
  getMonth,
  getYear,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns'
import type {
  Income,
  Expense,
  ExchangeRates,
  Currency,
  InvestmentHolding,
  FixedIncomeAccount,
  Debt,
  AccountBalance,
  ExpenseCategory,
  AccountName,
} from '@/types/finance'
import { MONTHS_ES } from '@/types/finance'

export function toEUR(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === 'EUR') return amount
  if (currency === 'USD') return amount / rates.USD
  if (currency === 'ARS') return amount / rates.ARS
  return amount
}

export function toUSD(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === 'USD') return amount
  if (currency === 'EUR') return amount * rates.USD
  if (currency === 'ARS') return amount / (rates.ARS / rates.USD)
  return amount
}

export function filterByYear<T extends { date: string }>(
  entries: T[],
  year: number
): T[] {
  return entries.filter((e) => getYear(parseISO(e.date)) === year)
}

export function filterByMonthYear<T extends { date: string }>(
  entries: T[],
  monthIndex: number,
  year: number
): T[] {
  const start = startOfMonth(new Date(year, monthIndex, 1))
  const end = endOfMonth(start)
  return entries.filter((e) => {
    const d = parseISO(e.date)
    return isWithinInterval(d, { start, end })
  })
}

export interface MonthlyBalanceRow {
  month: string
  monthIndex: number
  year: number
  incomeEUR: number
  expenseEUR: number
  balanceEUR: number
  incomeUSD: number
  expenseUSD: number
  balanceUSD: number
}

export function monthlyIncomeExpenseBalance(
  incomes: Income[],
  expenses: Expense[],
  year: number,
  rates: ExchangeRates
): MonthlyBalanceRow[] {
  return MONTHS_ES.map((month, monthIndex) => {
    const monthIncomes = filterByMonthYear(incomes, monthIndex, year)
    const monthExpenses = filterByMonthYear(expenses, monthIndex, year)

    const incomeEUR = monthIncomes.reduce(
      (sum, i) => sum + toEUR(i.amount, i.currency, rates),
      0
    )
    const expenseEUR = monthExpenses.reduce(
      (sum, e) => sum + toEUR(e.amount, e.currency, rates),
      0
    )
    const incomeUSD = monthIncomes.reduce(
      (sum, i) => sum + toUSD(i.amount, i.currency, rates),
      0
    )
    const expenseUSD = monthExpenses.reduce(
      (sum, e) => sum + toUSD(e.amount, e.currency, rates),
      0
    )

    return {
      month,
      monthIndex,
      year,
      incomeEUR,
      expenseEUR,
      balanceEUR: incomeEUR - expenseEUR,
      incomeUSD,
      expenseUSD,
      balanceUSD: incomeUSD - expenseUSD,
    }
  })
}

export interface AccountTotal {
  account: AccountName
  incomeEUR: number
  expenseEUR: number
  netEUR: number
}

export function accountTotals(
  incomes: Income[],
  expenses: Expense[],
  year: number | null,
  rates: ExchangeRates
): AccountTotal[] {
  const filteredIncomes = year ? filterByYear(incomes, year) : incomes
  const filteredExpenses = year ? filterByYear(expenses, year) : expenses

  const map = new Map<AccountName, AccountTotal>()

  for (const income of filteredIncomes) {
    const existing = map.get(income.account) ?? {
      account: income.account,
      incomeEUR: 0,
      expenseEUR: 0,
      netEUR: 0,
    }
    existing.incomeEUR += toEUR(income.amount, income.currency, rates)
    map.set(income.account, existing)
  }

  for (const expense of filteredExpenses) {
    const existing = map.get(expense.paymentMethod) ?? {
      account: expense.paymentMethod,
      incomeEUR: 0,
      expenseEUR: 0,
      netEUR: 0,
    }
    existing.expenseEUR += toEUR(expense.amount, expense.currency, rates)
    map.set(expense.paymentMethod, existing)
  }

  return Array.from(map.values()).map((a) => ({
    ...a,
    netEUR: a.incomeEUR - a.expenseEUR,
  }))
}

export interface CategoryTotal {
  category: ExpenseCategory
  totalEUR: number
  count: number
}

export function expensesByCategory(
  expenses: Expense[],
  year: number | null,
  rates: ExchangeRates
): CategoryTotal[] {
  const filtered = year ? filterByYear(expenses, year) : expenses
  const map = new Map<ExpenseCategory, CategoryTotal>()

  for (const expense of filtered) {
    const existing = map.get(expense.category) ?? {
      category: expense.category,
      totalEUR: 0,
      count: 0,
    }
    existing.totalEUR += toEUR(expense.amount, expense.currency, rates)
    existing.count += 1
    map.set(expense.category, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.totalEUR - a.totalEUR)
}

export interface YtdKpis {
  totalIncomeEUR: number
  totalExpenseEUR: number
  netBalanceEUR: number
  biggestCategory: ExpenseCategory | null
  biggestCategoryAmount: number
  totalDebtEUR: number
  activeAccounts: number
}

export interface MonthSummary {
  monthIndex: number
  monthName: string
  incomeEUR: number
  expenseEUR: number
  balanceEUR: number
}

export function monthSummary(
  incomes: Income[],
  expenses: Expense[],
  monthIndex: number,
  year: number,
  rates: ExchangeRates
): MonthSummary {
  const monthIncomes = filterByMonthYear(incomes, monthIndex, year)
  const monthExpenses = filterByMonthYear(expenses, monthIndex, year)

  const incomeEUR = monthIncomes.reduce(
    (sum, i) => sum + toEUR(i.amount, i.currency, rates),
    0
  )
  const expenseEUR = monthExpenses.reduce(
    (sum, e) => sum + toEUR(e.amount, e.currency, rates),
    0
  )

  return {
    monthIndex,
    monthName: MONTHS_ES[monthIndex],
    incomeEUR,
    expenseEUR,
    balanceEUR: incomeEUR - expenseEUR,
  }
}

/** Mes a mostrar en el dashboard: actual si el año coincide, si no diciembre */
export function displayMonthIndex(selectedYear: number): number {
  const now = new Date()
  if (getYear(now) === selectedYear) {
    return getMonth(now)
  }
  return 11
}

export function ytdKpis(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  year: number,
  rates: ExchangeRates
): YtdKpis {
  const yearIncomes = filterByYear(incomes, year)
  const yearExpenses = filterByYear(expenses, year)

  const totalIncomeEUR = yearIncomes.reduce(
    (sum, i) => sum + toEUR(i.amount, i.currency, rates),
    0
  )
  const totalExpenseEUR = yearExpenses.reduce(
    (sum, e) => sum + toEUR(e.amount, e.currency, rates),
    0
  )

  const categories = expensesByCategory(expenses, year, rates)
  const biggest = categories[0] ?? null

  const accountMap = accountTotals(incomes, expenses, year, rates)
  const activeAccounts = accountMap.filter(
    (a) => a.incomeEUR > 0 || a.expenseEUR > 0
  ).length

  const totalDebtEUR = debts.reduce(
    (sum, d) => sum + toEUR(d.amount, d.currency, rates),
    0
  )

  return {
    totalIncomeEUR,
    totalExpenseEUR,
    netBalanceEUR: totalIncomeEUR - totalExpenseEUR,
    biggestCategory: biggest?.category ?? null,
    biggestCategoryAmount: biggest?.totalEUR ?? 0,
    totalDebtEUR,
    activeAccounts,
  }
}

export interface BalanceTrendPoint {
  month: string
  balance: number
  cumulative: number
}

export function balanceTrend(
  incomes: Income[],
  expenses: Expense[],
  year: number,
  rates: ExchangeRates
): BalanceTrendPoint[] {
  const monthly = monthlyIncomeExpenseBalance(incomes, expenses, year, rates)
  let cumulative = 0
  return monthly.map((m) => {
    cumulative += m.balanceEUR
    return {
      month: m.month.slice(0, 3),
      balance: m.balanceEUR,
      cumulative,
    }
  })
}

export interface HoldingMetrics {
  id: string
  ticker: string
  platform: string
  units: number
  avgPrice: number
  invested: number
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPct: number
}

export function investmentMetrics(
  holdings: InvestmentHolding[]
): HoldingMetrics[] {
  return holdings.map((h) => {
    const invested = h.units * h.avgPrice
    const currentValue = h.units * h.currentPrice
    const profitLoss = currentValue - invested
    const profitLossPct = invested > 0 ? profitLoss / invested : 0
    return {
      id: h.id,
      ticker: h.ticker,
      platform: h.platform,
      units: h.units,
      avgPrice: h.avgPrice,
      invested,
      currentPrice: h.currentPrice,
      currentValue,
      profitLoss,
      profitLossPct,
    }
  })
}

export function totalInvested(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.units * h.avgPrice, 0)
}

export function totalCurrentValue(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.units * h.currentPrice, 0)
}

export function fixedIncomeAnnualInterest(accounts: FixedIncomeAccount[]): number {
  return accounts.reduce((sum, a) => sum + a.capital * a.annualRate, 0)
}

export function projectFutureValue(
  initialCapital: number,
  monthlyContribution: number,
  annualGrowthRate: number,
  years: number
): number {
  const monthlyRate = annualGrowthRate / 12
  const months = years * 12
  let value = initialCapital

  for (let m = 0; m < months; m++) {
    value = value * (1 + monthlyRate) + monthlyContribution
  }

  return value
}

export function computeAccountBalances(
  baseBalances: AccountBalance[],
  incomes: Income[],
  expenses: Expense[],
  rates: ExchangeRates
): (AccountBalance & { computedEUR: number })[] {
  const map = new Map<AccountName, number>()

  for (const b of baseBalances) {
    map.set(b.account, toEUR(b.amount, b.currency, rates))
  }

  for (const income of incomes) {
    const current = map.get(income.account) ?? 0
    map.set(
      income.account,
      current + toEUR(income.amount, income.currency, rates)
    )
  }

  for (const expense of expenses) {
    const current = map.get(expense.paymentMethod) ?? 0
    map.set(
      expense.paymentMethod,
      current - toEUR(expense.amount, expense.currency, rates)
    )
  }

  return baseBalances.map((b) => ({
    ...b,
    computedEUR: map.get(b.account) ?? 0,
  }))
}

export function formatMonthLabel(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM yyyy')
}

export function getMonthName(dateStr: string): string {
  const monthIndex = getMonth(parseISO(dateStr))
  return MONTHS_ES[monthIndex]
}